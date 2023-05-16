---
type: "post"
title: "Rustのstd読み会 pre を友人とやってみた感想"
draft: false
description: "友人とRustのstdについて詳しくなるために色々見てまわる会をしました"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2023-02-19T16:30:47+09:00"
  - summary: 誤字修正
    date: "2023-05-17T06:52:48+09:00"
---

<!-- titleは自動で入る -->

**TL;DR**: `std::cell` の動的なborrowについて少し調べた。また、勉強会のデザインを相談しながら考えた。

# 背景

元々勉強会的なものに興味があります。ただ一方で、「虚無の勉強会を開く暇があるくらいなら自分一人で時間を費やして学んだ成果をドキュメントやブログに残せ」という意見もあります。僕はこれも真っ当な意見だと思っています。

そこで僕は以下のような会なら開く意味があるのではないかと考えています。

- 地元で開くIT系勉強会
  - 対面での交流は楽しいし、モチベが上がる
  - 参加
- オンラインで開く記事読み会
  - 雑多に情報を追えるし、話題に触れることでモチベが上がる
  - 参加 / 主催

どちらも幅広くIT、ソフトウェアに関わる技術的な話がメインでした。ここで僕は、少しレンジを絞った勉強会をしてみたいなと思いました。

ぼんやりとそのようなことを考えながら過ごしていた時に、「Go仕様輪読会のノリでRustのstdを読む会がないかなあ〜」と思いました。調べた限りconnpassにはなさそうだったので、自分が作ろうと思い、下調べを始めました。

## なぜRustのstdなのか

Go, JavaScript/TypeScriptに関しては仕様系だと [Go Documentation 輪読会](https://gospecreading.connpass.com/) さんや [ECMAScript 仕様輪読会](https://esspec.connpass.com/) さんが活動されています。
Rustに関してのコミュニティとしては [Rustオンラインもくもく会](https://rust-online.connpass.com/) さんがもくもく会を定期開催されていて、他にはLTが盛んな印象があります。個人だと [KOBA789 / Channel 78.9](https://www.youtube.com/c/KOBA789) さんがRustを布教されている印象があります。

Rustに関して、僕は以前RFCを読もうとして挫折しています。ref. [rust-rfc-with-ja-dict-script](https://github.com/uta8a/rust-rfc-with-ja-dict-script)
理由としては、RFCからコードに飛ぶのがきつい / 役立つ感、面白い感、わかった気になる感が足りない、というところがありました。

これに対し、コードを中心に読むこと、役立つことを考えた結果、コンパイラ本体やrust-analyzer, clippyではなくstd libraryがいいんじゃないか？という考えに至りました。
そこで今回は「Rustらしいコードの書き方を本家から学び、最終目標としてrust-lang/rust本体への貢献を目指す」ということを目的に、stdのリーディングを行うことにしました。

# 行ったこと

- 参加人間: 2人 [kaito_tateyama](https://twitter.com/kaito_tateyama), [いかなご](https://twitter.com/ikanag0) さん
- 時間: 2/19(日) 13:00 - 16:00 (3h)
- 形態: オンライン、discordで主に通話 + hackmdでドキュメント共有

# 技術的な内容

おもろそうなのでということでその場でいかなごさんが「`std::cell` にしましょう」と決めました。

## `std::cell` のドキュメントを読む

[`std::cell` のドキュメント](https://doc.rust-lang.org/stable/std/cell/)

Rustのメモリ安全性は「不変参照は複数持てる(aliasing), 可変参照は1つしか持てない(mutability)」に基づく。

通常は可変なら `mut` がつくが、 `RefCell`, `Cell` は `mut` とつけないで可変に扱える。これは、通常の可変性(inherited mutability)と異なる、内部状態の可変性(interior mutability)である。

`RefCell` の内部状態の可変性は、通常の静的にコンパイル時に解決される借用とは異なり、「動的な借用」である。これは、実行時にトラッキングされる。

interior mutabilityについて、使う場面が3つある。

- 不変なものの内部を可変にする
  - `Rc<T>` のようなコンテナの内部をいじる
- 論理的に不変なものを実装
  - APIとして不変であって欲しい時
- `Clone`
  - Cloneは引数が `&self` であって `&mut self` ではないので、可変にしたい処理があれば `Cell<T>` を使う必要が出てくる。

## サンプルコードを理解する

以下の `std::cell` の最初に出てくるコードを詳しく調べました。

```rust
use std::cell::{RefCell, RefMut};
use std::collections::HashMap;
use std::rc::Rc;

fn main() {
    let shared_map: Rc<RefCell<_>> = Rc::new(RefCell::new(HashMap::new()));
    // Create a new block to limit the scope of the dynamic borrow
    {
        let mut map: RefMut<_> = shared_map.borrow_mut();
        map.insert("africa", 92388);
        map.insert("kyoto", 11837);
        map.insert("piccadilly", 11826);
        map.insert("marbles", 38);
    }

    // Note that if we had not let the previous borrow of the cache fall out
    // of scope then the subsequent borrow would cause a dynamic thread panic.
    // This is the major hazard of using `RefCell`.
    let total: i32 = shared_map.borrow().values().sum();
    println!("{total}");
}
```

観点は以下の2つ

- `RefMut` が返っているのはなぜ？
  - `Rc` に対する `borrow_mut` が貫通している
- `{}` でスコープを限定しているのはなぜ

### RefMutのなぜ

`Rc` のDerefのおかげで `RefCell::borrow_mut()` が呼べるから。

- [More on Deref coercion](https://doc.rust-lang.org/std/ops/trait.Deref.html#more-on-deref-coercion)
  - dereferenceを勝手にやってくれる
- [RcにDerefを実装している箇所 @ rust-lang/rust / library/alloc/src/rc.rs](https://github.com/rust-lang/rust/blob/f77f4d55bdf9d8955d3292f709bd9830c2fdeca5/library/alloc/src/rc.rs#L1548-L1556)
  - Derefの実態は`&self.inner().value`なのでRcがくるんでいる中身を返してそう
- [borrow_mut](https://doc.rust-lang.org/std/cell/struct.RefCell.html#method.borrow_mut)
  - これが実際に呼ばれている

### スコープ限定のなぜ

スコープを外すと、 `borrow_mut` で可変参照を得た状態で `borrow` で参照を得ることになるのでダメ。

カッコを外すと、こんなエラーが出る [rust playground link](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=8f08addaa40e58b73d8e96304e1d54ad)

```text
   Compiling playground v0.0.1 (/playground)
    Finished dev [unoptimized + debuginfo] target(s) in 0.72s
     Running `target/debug/playground`
thread 'main' panicked at 'already mutably borrowed: BorrowError', src/main.rs:20:33
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

### さらに調べる

[borrow_mut](https://github.com/rust-lang/rust/blob/f77f4d55bdf9d8955d3292f709bd9830c2fdeca5/library/core/src/cell.rs#L965-L970) の実態は `try_borrow_mut` である

[try_borrow_mut](https://github.com/rust-lang/rust/blob/f77f4d55bdf9d8955d3292f709bd9830c2fdeca5/library/core/src/cell.rs#L994-L1016) の実態は、`RefCell` の `borrow` というisizeのフラグに対して `BorrowRefMut::new()` を呼ぶ処理が入っている。

`borrow` は以下のような意味を持つ

- `0`: UNUSED
- 正: 読み込み中(数は読み込まれている数)
- 負: 書き込み中(数は書き込まれている数)

[is_reading/is_writing](https://github.com/rust-lang/rust/blob/f77f4d55bdf9d8955d3292f709bd9830c2fdeca5/library/core/src/cell.rs#L708-L719) あたりを見ると良い。

`BorrowRefMut` は `borrow == 0` でUNUSEDなら生成に成功する。`0` でなければread/write状態にあるので、`None` を返す(`borrow_mut`はexpectしているのでpanicする)

つまり、先ほどのカッコを外してpanicするのは以下のような流れ

- `borrow_mut()` に成功して、 `-1` をborrowに書き込む
- `borrow()` は `borrow < 0` で書き込み状態なので落ちる
  - expectしているからpanic

### 細かい話

- [BorrowRefではborrowをインクリメントしているので、cloneをisize::MAXまでやればcloneできなくなる](https://github.com/rust-lang/rust/blob/f77f4d55bdf9d8955d3292f709bd9830c2fdeca5/library/core/src/cell.rs#L1321-L1334)
  - isize::MAX はだいたい 10^20 くらいなので，がんばって並列化してもそこまでいかない

## 残された疑問

- Cell, RefCellはSyncがないのでスレッドセーフではない。では、スレッドセーフにするにはどうしたらいいのか？
- `Sync` とは？
- `Cell` 周りの不明点
  - `UnsafeCell` にはunsafeが使われていない？
    - ポインタを返すからunsafeで包まれる意味で、unsafeというprefix？
  - `repl(transparent)` が分からない
    - [RFC](https://rust-lang.github.io/rfcs/1758-repr-transparent.html) に記述があるが、FFIとかの文脈が難しい
  - `Freeze` が分からない
    - LLVM, バイナリのセクションが関係しそうで難しい

# 勉強会デザインについて

今回はいずれconnpassか内輪かで展開したいという準備としてやったのでいかなごさんにも意見をもらいながらどういう勉強会ならよくなるか考えていました。

## 進め方

- Moduleのドキュメントをまず読む
  - `std::cell` のドキュメントを1段落ずつ読む
  - 英語の勉強がしたいわけではないので、DeepLなどどんな手段を使ってもいいのでその段落が言いたいことを指示語を明確にしてざっくり説明する。内容にフォーカス。
- 疑問はその場で掘らない
  - チャットやログに疑問を残す
  - あとで解決する、もしくはしない
  - とにかくModuleのドキュメントを読み切るのを優先させる。

## 休憩を取ろう

ポモドーロか、55分やって5分休憩とかしたほうがいい。
コードリーディングがだれるとか、目的を再確認する時間としても機能しそう。

## 目的を決めよう

サンプルコードを完全理解するとき、どこまで分かったらやめるかを決める

今回だと以下

- `RefMut` が返っているのはなぜ？
- `{}` でスコープを限定しているのはなぜ

Cell全体を理解するのは少し目的がふわふわしていてうまくいかなかったので、ここまで理解したら切り上げるというのは大事。

## 時間配分

以下のようなペースだった。

- Moduleドキュメント読み: 1h
- サンプルコード読み: 1h
- 追加でCell読み: 1h

## 対象の参加者層を明確にしよう

今回だと、The Rust Programming Languageは読んでないと厳しそう。

stdを読んで業務や趣味開発に活かしたい感覚だと、本体ソースを読みに行くのは過剰と感じて冷めるかもしれない。

stdを起点にして本体も詳しく時々脱線しながら色々知識を得たいのなら今回の形式は良さそう。API眺めるだけのノリではないことは伝える必要がある。

## Rustのコンパイラソースコードどこから読めるか知らせる

github.devとか、手元に持ってくるのはしんどいとか、githubの検索が結構使えることを知らせておく必要がある。

## よかったポイント

- RefMutで実行時の借用の仕組みが意外と単純に参照カウンタっぽいことをしているのが意外で面白かった
  - やっぱり意外な発見があると楽しい
  - が、意外な発見を意図して勉強会で起こすのは難しい

# 終わりに

いかなごさんに協力してもらって、楽しかったし技術的にも勉強会デザイン的にも色々持ち帰れたので感謝という気持ちです。
