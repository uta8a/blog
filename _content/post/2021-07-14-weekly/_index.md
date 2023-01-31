---
layout: post
title: 週刊ブックマーク 7/12 - 7/18
description: 記事を読んだ記録
draft: false
changelog:
  - summary: 記事作成
    date: 2021-07-14T07:44:37+09:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
---

## 記事

- [eshiho's Blog - Segment Tree](https://shiho-elliptic.tumblr.com/post/187841789319/segment-tree) elliptic shiho さんによるセグメント木の数学的な説明。
- [うさぎ小屋 - アセンブリ言語で lifegame を書いた](https://kimiyuki.net/blog/2016/01/07/lifegame-in-assembly/) kimiyuki さんによる記事。
- [hikalium/nv](https://github.com/hikalium/nv) hikalium さんの書いた nv 言語のコンパイラ。川合さんの Essen の仕様に基づいている([wiki](https://github.com/hikalium/nv/wiki)より) Plan9 についての記述など、wiki から参考になりそうなものがありそう。
- [driftctl の紹介記事](https://zenn.dev/gosarami/articles/dd938001eac988e44d11) IaC 化されていない AWS リソースの追跡を行うツール
- [Ruby on Rails 学習ロードマップ](https://mitsuru53.github.io/ruby-roadmap/) スクール系の雰囲気が若干あるが、僕はこの記事は良い記事だと思う。かなり初心者向けのロードマップ。
- [Fuchsia development guide](https://fuchsia.dev/fuchsia-src/development) Google Nest Hub にも組み込まれている OS、Fuchsia の開発ガイド。フクシャと読むらしい。
- [LLVM tutorial](https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/index.html) Kaleidoscope という LLVM のチュートリアル。Kaleidoscope は万華鏡という意味。
- [コンピュータサイエンスをより幅広い子どもたちへ](https://japan.googleblog.com/2021/06/CS-Education.html) STEAM は STEM に Art を加えたもの。Science, Technology, Engineering, Mathematics, Art の 5 つ。記事を読む限りかなり女性のソフトウェアエンジニア育成に力をいれていると感じた。すごい。
- [Haskell で型レベルの CPU を定義して C Compiler を動かそうとする話](https://www.slideshare.net/SoheiYamaga/compile-time-type-level-c-compiler-this-may-indicate-out-of-memory) 大阪の大学の LT で発表された。ELVM を利用して型レベル CPU を作成したがメモリ不足だった(ELVM に最適化の余地がある)
- [pokemium/Worldwide](https://github.com/pokemium/Worldwide) GameBoy Color Emulator. Go 製で ebiten を使っているみたい。
- [containers/youki](https://github.com/containers/youki) Rust 製のコンテナランタイム。
- [TFHE](https://tfhe.github.io/tfhe/) Fast Fully Homomorphic Encryption over the Torus 完全準同型暗号
- [セキュリティキャンプ 2020 資料置き場](https://nindanaoto.github.io/) nindanaoto さんの資料が置いてある。

## todo!

記事を読んで、これやりたいなと思ったアイデア集。実際に手を動かしてできるのはごく一部だけど面白そうという気持ちをメモっておくのが大事。

- 基本的なデータ構造に数学的な説明をつける。ここは Coq で証明するところが近そう。この前の IPSJ PRO で確か計算量周りの証明を行っていた研究があったのでそのへんと合わせると数学的構造がある側面でバグってないことの保証に加えて計算量の保証もできそうで実用的な話になる。(証明つきコードの実現)
- アセンブリで lifegame を書く(befunge 実装もあったので esolang でもやってみたい) そもそも lifegame ってどのくらいシンプルなんだろうか
- driftctl を使ってみる。記事がハンズオンになっていたのでやってみる。まだ発展途上のようなので、go 製だし OSS コントリビュートチャンスかも
- Fuchsia で遊ぶ。機能追加にチャレンジして内部構造を学びたい。mold でリンクするのもよさそう。
- Kaleidoscope をする。LLVM フロントエンドは簡単に書いたことがあるがバックエンドはまだ触ったことがない。Inkwell を使うのもいいかも 参考になるかも: [Inkwell を使って Rust で LLVM をやっていく](https://cordx56.hatenablog.com/entry/2021/07/09/191006)
- 読んでみたいコード: pokemium/Worldwide, containers/youki
- 暗号は研究でもやる予定なので、[nindanaoto さんのシリーズ](https://qiita.com/nindanaoto/items/98335ad4d32b927effa9)を読んでいきたい。
