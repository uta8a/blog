---
type: post
title: 既存言語のミニ版ぽいものまとめた
draft: false
description: MinCaml, minrubyなど色々あるので調べた
ogp: 'ogp-big.webp'
changelog:
  - summary: 見出し作成
    date: 2022-11-26T11:53:47+09:00
  - summary: 追記
    date: 2022-11-28T11:18:17+09:00
  - summary: Zoo追記
    date: 2022-11-30T22:20:16+09:00
  - summary: 関数型言語の実装のチュートリアルを追記
    date: 2022-12-02T10:43:20+09:00
  - summary: migrate to lume
    date: 2023-01-31T22:04:26+09:00
---

東大のCPU実験の記事を読んでいたらお馴染みの [MinCaml](https://esumii.github.io/min-caml/) の他にもいくつか既存言語のミニ版があり、探してみました。
他にもおすすめのミニ言語あれば [Twitter: @kaito_tateyama](https://twitter.com/kaito_tateyama) 宛、もしくは [discussionにコメント](https://github.com/uta8a/discussion/discussions/1) で教えてください。

## 概要

一般の言語処理系を意識した言語のミニ版っぽいものを挙げます。大学の講義で使用された/教育目的/自作目的など色々です。

- ML: MinCaml
- C: chibicc
- Ruby: minruby
- Swift: MinSwift
- Go: babygo
- Scala: pscala
- 追記: mal, quickjs

## 詳細

### ML: MinCaml

リポジトリ: [esumii/min-caml](https://github.com/esumii/min-caml)

東大のCPU実験の記事でお馴染みのMinCaml。これをFPGAの上で動かしてレイトレーシングを行うらしい。
型周りも実装されている教育目的の実装。だけどshift/resetがMinCamlに実装されたりとか、研究目的でも使われていた気がする。

参考資料
- [速攻MinCamlコンパイラ概説](https://esumii.github.io/min-caml/) MLのサブセット実装という説明がされている。
- [だめぽさんによるMinCaml写経日記](https://zenn.dev/mod_poppo/scraps/a01e08d7d98b9e)
- [satosさんによるセルフホストに向けた展望](https://satos.hatenablog.jp/entry/2018/12/24/235951)
- [pdf: お茶大のshift/reset実装](http://pllab.is.ocha.ac.jp/~asai/jpapers/ppl/masuko09.pdf)

### C: chibicc

リポジトリ: [rui314/chibicc](https://github.com/rui314/chibicc)

Rui UeyamaさんによるCコンパイラの再実装。
8cc, 9ccからさらに洗練された実装になっていて、さらにSQLiteなどの現実世界で使われるCのソースコードもコンパイルできる。めちゃすごい。

[低レイヤを知りたい人のためのCコンパイラ作成入門](https://www.sigbus.info/compilerbook) も良くて、少しずつ機能を増やしていくという挫折しにくい・どのステップでも面白い構成になっています。

### Ruby: minruby

リポジトリ: [mame/minruby](https://github.com/mame/minruby)

Rubyで学ぶRubyという、[ASCIIの連載](https://ascii.jp/serialarticles/1230449/) やそれをまとめた [Lambda Noteで売られている書籍](https://www.lambdanote.com/products/ruby-ruby) の中で作っていくRubyのミニ実装。

これはRubyの内部を知るというより、極限まで簡素化してインタプリタのブートストラップという概念を学べるようにした実装になっていて、一番入門に向いていると思います。逆にlexer,parser,codegeneratorみたいな一連の流れを知っている人にはものたりないところもあるかも。

### Swift: MinSwift

リポジトリ: [giginet/MinSwift-workshop](https://github.com/giginet/MinSwift-workshop)

giginetさんによる2019年に行われたCookpad Spring 1day Internshipで使用された教材。 [参考: 1日でSwiftコンパイラを作る！Swiftコンパイラインターンを開催しました](https://techlife.cookpad.com/entry/2019/04/05/110000)

LLVMとコンパイラの動作理解に焦点を当てている教育目的の実装。

### Go: babygo

リポジトリ: [DQNEO/babygo](https://github.com/DQNEO/babygo)

DQNEOさんによるgoのコンパイラの再実装。
DQNEOさんは2019年にminigoというGoコンパイラをスクラッチで書いてセルフホストを達成している。 [参考: Goコンパイラをゼロから作って147日でセルフホストを達成した - qiita](https://qiita.com/DQNEO/items/2efaec18772a1ae3c198)
minigoの経験を活かして書かれているのがbabygo.

### Scala: pscala

フランス パリにある École normale supérieure (ENS) という学校で2015年に行われた講義で使われたらしい Scala の教育目的のミニ実装 Petit Scala。元ページが消えていて、講義を受けたと思われる生徒のリポジトリから推測するしかなさそう。

言語の仕様や説明は [xuedong/mini-scalaのpdf](https://github.com/xuedong/mini-scala/blob/master/docs/sujet1.pdf) から分かる。Typerがあるので型つきASTとか吐き出してそう？

実装は今のところ [fondation451/Scala-compiler](https://github.com/fondation451/Scala-compiler) や [tobast/compil-petitscala](https://github.com/tobast/compil-petitscala) が良さそうに見える。

### 追記: mal, quickjs, The Programming Languages Zoo

このあたりの話題が好きな人には良さそうな情報です。(Twitterで教えていただきました。ありがとうございます。)

- 様々な言語によるLisp実装を集めたリポジトリ [kanaka/mal](https://github.com/kanaka/mal)
- JavaScript Engineの [quickjs](https://bellard.org/quickjs/)
- 抽象機械や関数型言語が持ってそうな性質をミニチュア実装で学べる言語集 [The Programming Languages Zoo](https://plzoo.andrej.com/)

### 追記: 関数型言語の実装のチュートリアル

[プログラミング言語処理系が好きな人の集まり](https://prog-lang-sys-ja-slack.github.io/wiki/) がまとめてくれているチュートリアルへのリンク集がとても良くて、これ見れば関数型ミニ言語実装に関しては完璧なのでは...

[関数型言語の実装のチュートリアル](https://scrapbox.io/prog-lang-sys-ja/%E9%96%A2%E6%95%B0%E5%9E%8B%E8%A8%80%E8%AA%9E%E3%81%AE%E5%AE%9F%E8%A3%85%E3%81%AE%E3%83%81%E3%83%A5%E3%83%BC%E3%83%88%E3%83%AA%E3%82%A2%E3%83%AB)

- 京都大のOCamlサブセットMiniMLを作る講義資料
- SchemeのサブセットインタプリタをHaskellで作成するチュートリアル
- RacketでRacketサブセットコンパイラ作成

## メモ: ミニ実装はどういうものが良いか？

言語のミニ実装と言った時、参考実装として一般的に使われる言語処理系が存在する。(Cならgccとか、Scala3ならDottyとか)
どこまで真似るか？どこまで既存でよく使われている実装に寄せるか？という悩みがあり、それで既存のMin-言語実装を眺めてきた。

結論としては、「処理系を作ることで何を学びたいかによって、どこまで忠実にやるかが決定される」と思う。

例えばminrubyは処理系に気軽に触り始められるという利点があり、MinCamlはバックエンドのカスタマイズによってFPGAの上に構成した自作アーキテクチャ上で動かせるというロマンがある。

例えばScala3のミニ実装をしたい！とした時に中間表現のTASTyを吐き出さなければいけないとかそういうことはなくて、学びたいものが何かをよく決めて、それに応じて簡単な構文をさらうだけの実装でも良いし、もうちょい実際に寄る方針にしてもいいし、自由なんだろうなあと思った

それはそう、という結論なのですが自分が囚われていたのでメモ。
