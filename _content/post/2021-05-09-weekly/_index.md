---
type: post
title: 週間ブックマーク 2021/05/09 - 2021/05/13
draft: false
description: 記事を読んだ記録や小さなメモ。
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: 2021-05-09T07:01:45+09:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
  - summary: migrate to lume
    date: 2023-01-31T21:43:59+09:00
---

記事を読んだ記録や小さなメモ。

## TypeScript

[TypeScript 練習問題集](https://gist.github.com/kenmori/8cea4b82dd12ad31f565721c9c456662) と積んでいる [type-challege](https://github.com/type-challenges/type-challenges) をしないとなあという気持ちに。

このブログは [zenn-dev/zenn-editor](https://github.com/zenn-dev/zenn-editor) をかなり参考にしていて、その過程で any を潰していたら JSON 周りと型周りでつらかった。

[tkr](https://twitter.com/kgtkr)さんに教えてもらったこと:

- [io-ts](https://github.com/gcanti/io-ts)が JSON を扱う上で役立つ
- 以下のようにして Union から Array に変換できる

```ts:sample.ts
const _dummy = { a: null, b: null, c: null }
type Union = keyof typeof _dummy
const unionArray = Object.keys(_dummy) as Union[]; // ["a", "b", "c"]
```

後は Rust の気持ちになると null, undefined などがつらかった。気持ち的に Option, Result が欲しい。ちょっと調べると [fp-ts](https://github.com/gcanti/fp-ts) がよさそう。

## rustcraft

[dskart/rustcraft](https://github.com/dskart/rustcraft) を知った。Rust の wgpu クレート(iced でも内部的に使われている低レイヤなクレート)を用いて minecraft っぽい見た目のゲームを実装。動けたりブロックを破壊できるらしい。アイテムとか細かいところはなくてほんとに基本のみ。

## [ハックの学び方、の学び方](https://speakerdeck.com/puhitaku/hatukufalsexue-bifang-falsexue-bifang)

電子辞書 Brain を改造して Linux を入れるというイケているハッカー puhitaku さんによる hack のやり方指南。
興味あるものから触ろう。コンピュータが好きな人間は大半がノリで技術を習得してきた。どこかでつながるときが来るから触り続けよう。質問するときは自分の現在地が伝わるよう、やってきたこととこうしたいということを話そう。

## [2020 年の振り返りと来年の抱負 読みたい本 magurotuna](https://zenn.dev/magurotuna/articles/f0a946e47b32ae)

maguro さんによる振り返り記事。コンピュータサイエンスの勉強を続けて OSS に貢献するという姿勢に感動して影響を受けた。

## その他

- [Windows のデバイスドライバをマイクロソフトに送って署名してもらう方法](http://nahitafu.cocolog-nifty.com/nahitafu/2021/05/post-0027a5.html)
- [9 月末で 60 歳定年退職しました](https://hyoshiok.hatenablog.com/entry/20180930/p1)
- [システム設計入門](https://github.com/donnemartin/system-design-primer/blob/master/README-ja.md#%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E8%A8%AD%E8%A8%88%E7%9B%AE%E6%AC%A1) これいいなと思った。コーディングインタビュー対策的ではあるが、これを軸にして CDN とか設計を学べそう。
- [Spanner を解説したら講義になった話](https://ubansi.com/cloud_spanner/) DB の勉強するときに読み返したい。
- [知っておきたかった Linux サーバ設計、構築、運用知識まとめ](https://thelarklife1021.hatenablog.com/entry/2021/04/30/114122) Docker より下の階層。自宅サーバとかやったらすごい役立ちそう。
- [Brainfuck の wasm ターゲットコンパイラを書いて wasm と WASI に入門](https://zenn.dev/mshaka/articles/5e2e9a0e02c93bc3d38b) wat の仕様が書いてある。cl8w と一緒に見たい。
- [ドメイン駆動設計で実装を始めるのに一番とっつきやすいアーキテクチャは何か](https://little-hands.hatenablog.com/entry/2017/10/04/231743) DDD の話。レイヤード/ヘキサゴナル/オニオン/クリーンの 4 つの概略がある。
- [CNCF Cloud Native Interactive Landscape](https://landscape.cncf.io/) クラウド周りの分類ごとの色々な選択肢が書いてあって、技術選択に役立ちそう。
- [機械学習と Human-in-the-Loop で優勝する違反検知の話](https://engineering.mercari.com/blog/entry/2020-03-25-180000/) メルカリの AI チームによる Human in the loop(HITL)の利用事例。Human 部分がうまくラベルになるよう設計されているとよい。
- [WebCodecs と WebTransport でビデオチャット](https://blog.jxck.io/entries/2020-09-01/webcodecs-webtransport-chat.html) WebRTC の中で、API の抽象度をもう少し下げてバイナリを触りたい背景から検討されている API
- [フレッツ光ライトの課金対象に関する考察](https://notoken.hatenadiary.com/entry/2021/05/10/010256) ネタ記事かと思いきや計測を行っていて面白い。PPPoE とか未だに分かっていないので調べる。
- [Ruby3 の静的型検査を活用して、新規プロダクト開発の開発効率を向上させた話](https://tech.ga-tech.co.jp/entry/ruby3-typecheck-rails) steep を利用して、妥協しながらも効果を出している例。
- [anyhow::Context を use したいが名前が被ってしまうときの解決策 -> impl-only-use](https://zenn.dev/magurotuna/articles/2c4037b75f7e51) Rust で直接使わないけど欲しいトレイトを import するときに使える
- [3D でライフゲームを試せるサイト作りました](https://qiita.com/ishishow/items/e4340a598fdfae52510a) Go Ubity React という技術スタックが珍しいので後で深く見ておきたい。
- [AWS CloudHSM](https://aws.amazon.com/jp/cloudhsm/) 暗号キーを生成するサービスらしい。
- [CTO advent calendar](https://adventar.org/calendars/5573) CTO 協会によるアドベントカレンダー。
- [REALITY 低遅延モード配信を支えるリアルタイムサーバとデータパイプライン](https://techcon.gree.jp/2020/session/Session-11) 低遅延モードというのがあるらしい。Apache Beam は知らなかった。
- [クラウドと可用性](https://heartbeats.jp/hbblog/2021/05/availability-on-cloud.html) 用語について補完できる。
- [ユーザを不正被害から守るためにやってること #3](https://inside.dmm.com/entry/2021/03/08/fraud-prevention-team-introduction-3) 不正検知、false-positive がつらそう。
- [米石油パイプライン企業へのサイバー攻撃についてまとめてみた](https://piyolog.hatenadiary.jp/entry/2021/05/12/051650) piyolog さんはセキュリティの実社会へのケーススタディに富んでいるのでこういうとき本当に助かります
- [ナイアンティックが AR 開発者キット「Niantic Lightship ARDK」のベータ版を提供開始](https://www.moguravr.com/niantic-lightship-ardk/) Ingress の時代から AR sdk を提供したいというプラットフォーム化を目指していたのでいよいよかという感じ。期待
- [React で使えるバリデーションライブラリを紹介！](https://bagelee.com/programming/react/validation-library/) Zod についての話。io-ts とも関連している。
- [2020LINE KYOTO で開催したサマーインターン、ハッカソンプログラムの様子をご紹介](https://engineering.linecorp.com/ja/blog/2020-line-kyoto-summer-internship/) LINE のクローンアプリを作るハッカソン型のインターン。Redis 使ったことないから使ってみたいな。
- [Security & Infrastructure at Fortmatic](https://medium.com/fortmatic/security-infrastructure-at-fortmatic-4a95c3688997) Formatic での取り組み。Security や Cloud HSM を使用しているところが面白い。
- [2020 年を振り返って](https://scrapbox.io/crosssceneofwin-55673688/2020%E5%B9%B4%E3%82%92%E6%8C%AF%E3%82%8A%E8%BF%94%E3%81%A3%E3%81%A6) 機械学習系の方の振り返り。英語学習の項目が参考になる。
