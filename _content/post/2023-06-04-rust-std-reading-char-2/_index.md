---
type: "post"
title: "Rust std読み会 char編 2"
draft: false
description: "rustcをビルドしたり、charのis_numeric周りを調べたり"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2023-06-04T18:18:38+09:00"
---

<!-- titleは自動で入る -->
第4回です。rustcをビルドしてみたり、前回の [char編](https://blog.uta8a.net/post/2023-05-28-rust-std-reading-char/) でUnicodeを調べて、 `is_numeric()` の実装ってもしかしてデカいテーブルを持っているのか？といった疑問が生まれたのでその辺りを軽く眺めました。

# 🦀 会の流れ

- 参加: [kaito_tateyama](https://twitter.com/kaito_tateyama), [いかなご](https://twitter.com/ikanag0) さん
- 時間: 6/3(土) 20:30 - 22:50(勉強会を終えた後雑談して結局23:00くらいまで話してた)
- 形態: オンライン、discordで通話 + hackmdでドキュメント共有
- 内容: Rustの [Primitive Type `char`](https://doc.rust-lang.org/std/primitive.char.html) のAPI以外の前半箇所を理解して、その後UnicodeやUTF-8について調べた。
- やり方
  - 初めに [rust-lang/rust](https://github.com/rust-lang/rust) をビルドして、どのくらいの時間がかかるのか、一回あたりの変更に対して必要なコンパイル時間はどのくらいか調べた。
  - また、kaitoがビルド中にいかなごさんが [library/core/src/unicode/unicode_data.rs](https://github.com/rust-lang/rust/blob/9eee230cd0a56bfba3ce65121798d9f9f4341cdd/library/core/src/unicode/unicode_data.rs) を調べてくれた。
  - Unicode周りで気になることは解消した & これ以上深くやるにはUnicodeの本を読んで知らない単語を補充する必要性を感じたので切り上げた。

# 💻 技術

## ビルド編

[Rust Compiler Development Guide](https://rustc-dev-guide.rust-lang.org/) の一部を参照しつつ、以下の手順でRustのコンパイラ、rustcのビルドを行った。(正確には他にclippyやrust-analyzerなどもビルドされた。)

### ビルド手順まとめ

基本的には [README / Installing from Source](https://github.com/rust-lang/rust#installing-from-source) や [How to build and run the compiler - rustc-dev-guide](https://rustc-dev-guide.rust-lang.org/building/how-to-build-and-run.html) を見れば良い。

以下実際に行った手順。

今回ビルドに使用したマシンスペック

- CPU:                 AMD Ryzen 7 PRO 4750G
- Thread(s) per core:  2
- Core(s) per socket:  8
- Socket(s):           1
- メモリ:              64GB

2020年頃に発売された16コアのマシン。

以下、コマンドの冒頭に `time` コマンドをつけて時間を計測した結果も一緒に載せている。

```sh
# 参考: https://github.com/rust-lang/rust#building-on-a-unix-like-system
# 本来は --depth 1 といったオプションでgitの履歴を全て取得せずに行う方が良い。
$ time git clone https://github.com/rust-lang/rust.git
git clone https://github.com/rust-lang/rust.git  129.00s user 20.64s system 116% cpu 2:09.00 total

$ time ./configure
./configure  0.05s user 0.03s system 99% cpu 0.080 total

# ここで、config.tomlがリポジトリ直下に生成される。
# このtomlファイルを編集して、使用するLLVMをシステムのものに変更
# (デフォルトではLLVMもフルビルドされる)

# tomlファイルを編集した後
$ time ./x.py check
./x.py check  778.00s user 78.38s system 365% cpu 3:54.21 total

$ time ./x.py build
./x.py build  10508.30s user 196.85s system 1107% cpu 16:06.38 total

# ./build/host/stage2/bin/rustc がビルドされたRustのコンパイラ
```

かかった時間は大まかに以下の通り。

- 全歴史込みのソースのダウンロード: 2分
- check: 4分
- 初回のbuild: 16分

ビルド時間の体感としてはv8とかChromiumに比べたらめちゃ早いなという印象。Linux kernelと同じくらいかもしれない？(あやふや)

成果物は `rustc` に限れば以下の場所にある。

- `./build/host/stage0/bin/rustc`: stage0なのでこれはシステムに元々あるrustc
- `./build/host/stage1/bin/rustc`: stage0のコンパイラを用いた1回目のビルドの結果
- `./build/host/stage2/bin/rustc`: stage1のコンパイラを用いた2回目のビルドの結果

stage0,1,2の概念に関しては [Rustコンパイラのコンパイルの流れ - qnighy](https://qnighy.hatenablog.com/entry/2017/06/18/220000) が分かりやすい。bootstrapの流れに関しては [Stages of bootstrapping - rustc-dev-guide](https://rustc-dev-guide.rust-lang.org/building/bootstrapping.html?highlight=skip#stages-of-bootstrapping) の図が分かりやすい。

### LLVMをフルビルドせずにシステムのものを使う

今回はLLVM-14が元々システムに入っていたので、それを `./configure` 後に生成される `config.toml` で指定した。

やり方は [Using pre-built LLVM - rustc-dev-guide](https://rustc-dev-guide.rust-lang.org/building/new-target.html#using-pre-built-llvm) を見た。

```toml
# ...

[target.x86_64-unknown-linux-gnu]
llvm-config = "/usr/bin/llvm-config-14"

# ...
```

これを指定しないとLLVMもフルビルドされて時間がかかる。この辺りの知識は [rust-lang/rustへのcode contributionをはじめからていねいに - JohnTitor](https://zenn.dev/fraternite/articles/4e11063bf05aac) で得た。

### stage1でlibraryでビルドすると、実行可能なバイナリが手に入る

変更を加えるとどのくらい時間がかかるのか？という疑問が生まれたので適当にエラーメッセージを少し変更する -> ビルドという手順を踏んで差分ビルドがどのくらい効いているのか調べた。

変更内容としては、 [library/core/src/char/convert.rs のエラーメッセージ](https://github.com/rust-lang/rust/blob/8177591aecf9c2ab1e96ba7fe2c00753f26a2011/library/core/src/char/convert.rs#L157-L165) に対して、末尾に数文字を加えた。

ABI関連しなければstage1のみで良さそうと感じたので、コンパイラに変更を加える際には以下のようにすると良さそう。 `library/core` を変更した場合を示す。

- コンパイルが通ることを確認したい → `./x.py build --stage 0 library/core`
- 実行可能なバイナリが欲しい → `./x.py build --stage 1 library`

試したログは以下の通り。buildでは結局stage2コンパイラをフルでビルドするので16分かかり、初回ビルドと変わりがない。スコープを絞って、rust-analyzerやclippyやrustfmtなどを除き、かつstage1に絞るとcoreの軽い変更に対して **実行可能なバイナリを3分で得られる。** 実際は `./x.py test` もやるのでもっと時間がかかりそうではある。

ちなみに stage0 だけでは実行可能なバイナリは得られなかった。

```text
./x.py build  10503.40s user 198.32s system 1106% cpu 16:06.96 total

./x.py build --stage 0 library/core  12.66s user 0.80s system 154% cpu 8.727 total

./x.py build --stage 0 library  59.28s user 2.91s system 324% cpu 19.179 total

./x.py build --stage 1 library  2303.51s user 47.63s system 1129% cpu 3:28.21 total
```

### ビルド中にログを眺めていて気になったもの

ビルドログとして流れるcrate名の中で気になったもの

- rustc_privacy
  - privacyってなんだろう
- rustc_borrowck
  - borrow checker関連の雰囲気
- chalk_engine
  - [chalk](https://github.com/rust-lang/chalk): An implementation and definition of the Rust trait system using a PROLOG-like logic solver
- p384
  - どうやらSIMD関連
- unicode-xid
  - unicode周り？
- humantime
  - なんだこれ
- lazy_static
  - `once_cell` がメジャーになっていくから依存剥がされそう
- salsa-macros
  - サルサ？
- lsp-server
  - LSP読みたい
- ide-ssr
  - IDEだからrust-analyzer関連？
- askama
  - あすかまってなんだ
- quine-mc_cluskey
  - quine！？
- ppv-lite86
  - なんだこれ

他に気になったこととして、Rustの差分ビルドはもっと賢くなるのでは？という気がした。(でも賢い人が作っているので真相は分からない)
ログを眺めている感じ、ちょっと無駄に再ビルドしている感じもしたので、もう少しどういう仕組みになっているのか調べたい。

## Unicodeの便利関数の裏側編

前回のchar編で、Unicodeは結構規則性なく文字が収録されていることが分かった。表示は表示するソフトウェア側やfontの責務だが、以下の [`is_numeric()`](https://doc.rust-lang.org/std/primitive.char.html#method.is_numeric) のようにUnicodeのあるcode pointを別のcode pointに変換する関数が実装が大変そうに感じる。

```rust
assert!('٣'.is_numeric());
assert!('7'.is_numeric());
assert!('৬'.is_numeric());
assert!('¾'.is_numeric());
assert!('①'.is_numeric());
assert!(!'K'.is_numeric());
assert!(!'و'.is_numeric());
assert!(!'藏'.is_numeric());
assert!(!'三'.is_numeric());
```

丸のついた1などが数値として扱われている。おそらくこれは巨大テーブルをコンパイラに埋め込んでいるのでは？と考えた。
実際には [library/core/src/unicode/unicode_data.rs](https://github.com/rust-lang/rust/blob/9eee230cd0a56bfba3ce65121798d9f9f4341cdd/library/core/src/unicode/unicode_data.rs) が該当する。

`is_numeric()` は以下のように、実質的に `unicode::N()` を呼んでいる。

```rust
//  ref. https://github.com/rust-lang/rust/blob/9eee230cd0a56bfba3ce65121798d9f9f4341cdd/library/core/src/char/methods.rs#L917-L925

pub fn is_numeric(self) -> bool {
    match self {
        '0'..='9' => true,
        c => c > '\x7f' && unicode::N(c),
    }
}
```

これは実態としては以下の `lookup()` 関数になっている。結局のところ、変換テーブルが存在していてそれを見てcode pointとcode pointの変換を行う。

```rust
// ref. https://github.com/rust-lang/rust/blob/9eee230cd0a56bfba3ce65121798d9f9f4341cdd/library/core/src/unicode/unicode_data.rs#L434-L463

pub mod n {
    static SHORT_OFFSET_RUNS: [u32; 39] = [
        1632, 18876774, 31461440, 102765417, 111154926, 115349830, 132128880, 165684320, 186656630,
        195046653, 199241735, 203436434, 216049184, 241215536, 249605104, 274792208, 278987015,
        283181793, 295766104, 320933114, 383848032, 392238160, 434181712, 442570976, 455154768,
        463544144, 476128256, 484534880, 488730240, 505533120, 509728718, 522314048, 526508784,
        530703600, 534898887, 539094129, 547483904, 568458224, 573766650,
    ];
    static OFFSETS: [u8; 275] = [
        48, 10, 120, 2, 5, 1, 2, 3, 0, 10, 134, 10, 198, 10, 0, 10, 118, 10, 4, 6, 108, 10, 118,
        10, 118, 10, 2, 6, 110, 13, 115, 10, 8, 7, 103, 10, 104, 7, 7, 19, 109, 10, 96, 10, 118, 10,
        70, 20, 0, 10, 70, 10, 0, 20, 0, 3, 239, 10, 6, 10, 22, 10, 0, 10, 128, 11, 165, 10, 6, 10,
        182, 10, 86, 10, 134, 10, 6, 10, 0, 1, 3, 6, 6, 10, 198, 51, 2, 5, 0, 60, 78, 22, 0, 30, 0,
        1, 0, 1, 25, 9, 14, 3, 0, 4, 138, 10, 30, 8, 1, 15, 32, 10, 39, 15, 0, 10, 188, 10, 0, 6,
        154, 10, 38, 10, 198, 10, 22, 10, 86, 10, 0, 10, 0, 10, 0, 45, 12, 57, 17, 2, 0, 27, 36, 4,
        29, 1, 8, 1, 134, 5, 202, 10, 0, 8, 25, 7, 39, 9, 75, 5, 22, 6, 160, 2, 2, 16, 2, 46, 64, 9,
        52, 2, 30, 3, 75, 5, 104, 8, 24, 8, 41, 7, 0, 6, 48, 10, 0, 31, 158, 10, 42, 4, 112, 7, 134,
        30, 128, 10, 60, 10, 144, 10, 7, 20, 251, 10, 0, 10, 118, 10, 0, 10, 102, 10, 102, 12, 0,
        19, 93, 10, 0, 29, 227, 10, 70, 10, 0, 10, 102, 21, 0, 111, 0, 10, 86, 10, 134, 10, 1, 7, 0,
        23, 0, 20, 12, 20, 108, 25, 0, 50, 0, 10, 0, 10, 0, 10, 0, 9, 128, 10, 0, 59, 1, 3, 1, 4,
        76, 45, 1, 15, 0, 13, 0, 10, 0,
    ];
    pub fn lookup(c: char) -> bool {
        super::skip_search(
            c as u32,
            &SHORT_OFFSET_RUNS,
            &OFFSETS,
        )
    }
}
```

ではこのソースは人の手でfmtされているのか？という疑問が湧く。結論としては、この `unicode_data.rs` というファイル自体が別のコードによって自動生成されたものらしい。

> This file is generated by src/tools/unicode-table-generator; do not edit manually!
> -- [`unicode_data.rs`の冒頭](https://github.com/rust-lang/rust/blob/9eee230cd0a56bfba3ce65121798d9f9f4341cdd/library/core/src/unicode/unicode_data.rs#L1)

[`src/tools/unicode-table-generator`](https://github.com/rust-lang/rust/tree/master/src/tools/unicode-table-generator) を見ると、[`src/tools/unicode-table-generator/src/unicode_download.rs`](https://github.com/rust-lang/rust/blob/9eee230cd0a56bfba3ce65121798d9f9f4341cdd/src/tools/unicode-table-generator/src/unicode_download.rs) などでunicode.org以下のテキストファイルをfetchしている様子が分かる。

結論: Unicodeの文字から文字への変換を必要とする関数の裏側には、巨大変換テーブルがいる。

## その他

### debug文はリリースビルドで消える

コンパイラに大きく変更を与えずに小さく変更を与えるにはどうしたらいいか？を考えて、初め `debug!` 内の文章を書き換えようと考えた。

例: [rustcの中にあるdebug](https://github.com/rust-lang/rust/blob/8177591aecf9c2ab1e96ba7fe2c00753f26a2011/compiler/rustc_errors/src/diagnostic_builder.rs#L263)

しかし、リリースビルドで消えてしまうので変わったかどうか確かめられない。そこで今回は適当なエラー文を探してそこを書き換えて、エラーをわざと出すコードを書いてstage1,2のコンパイラでビルドすることで対応した。

### std-dev-guideはRustのstdの開発に関するWIPなドキュメントっぽい

link: [Standard library developers Guide](https://std-dev-guide.rust-lang.org/)

この文書はRustのstdを開発する上でのドキュメントで、おそらくコンパイラに対する [Rust Compiler Development Guide](https://rustc-dev-guide.rust-lang.org/) のような立ち位置に相当する。おそらく Status: Stub になっているところがまだ書き途中っぽいが、std読み会をやっている身としてはかなり良さげ文章に見えるので読んでいきたい。

# 💬 いろいろ

- Rustはたくさんのドキュメントがある。rustc-dev-guideやstd-dev-guideはそういったたくさんのドキュメントを参照する大元としての役割も果たしてそうに感じた。
- 次回からkeywordsをやっていく流れで、 Goはkeywordsが少ないという話をした。
  - [Goのkeywords](https://go.dev/ref/spec#Keywords) は現時点(2023/06/04)で25個しかない。
  - それに対して [Rustのkeywords](https://doc.rust-lang.org/std/index.html#keywords) は39個。
- Goのkeywords, 演算子を眺めていた。
  - Goはtrue/falseがkeywordsではない。のでidentifierとしてtrue,falseが使える。
    - Rustはtrue/falseがkeywordsになっている
  - Goは `&^` という演算子がある。[Arithmetic operators](https://go.dev/ref/spec#Arithmetic_operators) を見ると、bit clear (AND NOT)らしい。
  - Goは単項演算子が `+`, `-` に加えて `^` がある。これは bitwise complement。

# 🖊️ 参考

- [rust-lang/rust](https://github.com/rust-lang/rust)
  - ビルド時や、エラー文を書き換える過程で読んだ
- [Rust Compiler Development Guide](https://rustc-dev-guide.rust-lang.org/)
  - rustc-dev-guide
  - 全面的に参考にした。特にcontributionのための章やビルドする章を読んだ
- [rust-lang/rustへのcode contributionをはじめからていねいに - JohnTitor](https://zenn.dev/fraternite/articles/4e11063bf05aac)
  - rustc-dev-guideはデカいので、ここを読みながらrustc-dev-guideをつまみ読みする形で参考にした

# ➡️ 次回

Unicode編は一旦終わりにします。[stdのドキュメントのページに載っているもの](https://doc.rust-lang.org/std/index.html) ならなんでも良いルールとして考えて、 `Keywords` はどうか？という話になりました。
というわけで、以下を上から順に調べます。

- ref 👈 ここから
- as 👈 できたらこっちも
- let
- dyn
- move
- async
- await
- enum
- union

現時点での僕の感覚

- `ref`: なんかパターンマッチの時コンパイラに言われてつけるやつ
- `as`: どのくらい `as` がやばいんだろう？TypeScriptの `as` との、型安全的な意味での違いを知りたい。
