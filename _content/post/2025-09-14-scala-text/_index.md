---
type: "post"
title: "Scala学習用テキストを読んだ"
draft: false
description: "自由研究として、Future/Promiseの深掘りもしてみた"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2025-09-14T12:59:01.88159488+09:00[Asia/Tokyo]"
---

<!-- titleは自動で入る -->
Scala初学者向けの学習テキスト [scala-text](https://scala-text.github.io/scala_text/) を読み終えました。
気になったところは手を動かして問題を解いたり写経したりしました。1週間かけて約7時間くらいで読み終えました。学習目的なのでエディタは補完なしのvim、sbtをtmuxの別タブで開いてrunとかscalafmtとか打つ感じで進めました。

学習してた時のコードは[ここ](https://github.com/uta8a/playground/pull/18)にあります

# 全体的な感想

- Scalaを学ぶためのテキストではあるが、Scalaという題材を通して主にWebプログラミングで出現する話題もコンパクトにまとまっていて良い
  - 特に [エラー処理](https://scala-text.github.io/scala_text/error-handling.html) / [テスト](https://scala-text.github.io/scala_text/test.html)
- Scala2の記述がたまに出現するが、ChatGPTに質問しながら進めたのでScala3との差分に困らなかった
  - 例えば[トレイト](https://scala-text.github.io/scala_text/trait.html)で、Scala3はtrait parameterが取れるようになった(今見たら脚注に書いてあった...！)
  - 本文中にScala3についての言及もあるので大丈夫
- すごいhaskell本を読んでいたので、型クラスの話やFunctorの話はまた違った書き方から見ることができて良かった
  - この辺は一発で理解できることはないので、いろんな言語で体験してみてちょっとずつ分かっていくものだろうと思っている

## 今後理解したい

読んで理解した気になっているが、上手く扱える自信はない

- 共変、反変
- implicit
- Future/Promise
- 様々な型クラス

## 今後やってみたい

- 数学的なライブラリを作ることで拡張性を学びたい
  - アルゴリズム系のライブラリを書いてみると良さそう
  - 本文中で紹介されていたS99がちょうど良さそう
- Web開発において、Scalaの恩恵を受ける例がないか探してみる
  - 軽いWebアプリケーションを書いてみると良さそう

# 自由研究: Future/Promiseを触ってみる

ChatGPTに以下を聞きました

```txt:prompt
カウントダウンラッチのような非同期処理を行う上で練習問題になる例を挙げてください。Scala3のFuture, Promiseに習熟したいと思っています
```

色々練習問題を出してもらったので1つ解いてみます。

## カウントダウンラッチ

仕様: `AsyncLatch(n: Int)` を作る。`countDown()` が `n` 回呼ばれたら `await(): Future[Unit]` が成功する。

これはChatGPTにまずお手本として書いてもらってノリをつかむことにした。

[コード全体](https://github.com/uta8a/playground/pull/20)

`class AsyncCountDownLatch` に4つのメソッドを用意する

- `countDown()`: カウントを一つ減らす
- `getCount`: 現在の残りカウントを返す
- `await()`: 全てカウントが成功になると終わるFuture。テストで使うと失敗時に一生返ってこなくなるのでtimeout付きの方を使う
- `tryAwait()`: timeout付きの待機。

timeoutの仕組みはSchedulerを用意して、 `firstCompletedOf` でtimeoutするかdoneになるかどちらか最初のものに対して値を返す

## Barrier(全員集合したら開始)

仕様: 参加者 `m` 人が `enter()` したら全員に同じ `Future[Unit]` が解放される。

自力で解いてみる。

[コード全体](https://github.com/uta8a/playground/pull/21)

結局少しChatGPTの力を借りた

`enter()` の実装を書けば良いのだけど、`n` が `m` になった時は `gate.trySuccess(())` を返せば良いがそれ以外で何を返すと良いか分からなかった。
`gate.future` を返すと良いらしい。そうすることでノンブロッキングにできて、後からonCompleteなどで結果を得られる。
毎回別のFutureを生成して渡すと、一斉に完了ができない。そこでgateという形で持っておく必要がある。(AsyncBarrierは1つだけしか生成してない)
また、完了後にenterすると、`gate.future`は完了済みとして即座に値を返すらしい。

なるほど。

ChatGPTに聞いてなんとなく理解した気になっているが、 [Future と Promise \| Scala Documentation](https://docs.scala-lang.org/ja/overviews/core/futures.html) も読んで理解を深めたい。
