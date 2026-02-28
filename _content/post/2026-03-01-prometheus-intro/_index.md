---
type: "post"
title: "入門 Prometheus を読んだ"
draft: false
description: "exporterというやつが分かった"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2026-03-01T06:23:17.824952881+09:00[Asia/Tokyo]"
---

<!-- titleは自動で入る -->
[入門 Prometheus](https://www.oreilly.co.jp/books/9784873118772/) を読みました。10日くらいかけて、7時間程度で読みました。

元々、[Cloud Native Technology Map](https://www.cyberagent.co.jp/techinfo/info/detail/id=32029) というCyberAgentが出しているCNCFエコシステムを実際にサービスで使っているマップを読んで、これをおうちk8sに活かそうと思ったのがきっかけでした。OSSは色々あり、片っ端から試していきたい気持ちになりますが、まずは以下の2点を重視しました。

- k8sに紐づくことなく検証できる
  - kind, k3sであっても検証に1段難易度が挟まるのは初手では避けたい
  - 裏で並行してkindを使った開発環境の構想を練る
- 基盤になるものを先にする
  - 基盤がある状態だと色々試しやすくなるだろう

この2点でフィルタすると、Observabilityは結構上位に来ると思いました。というわけで優先度の高いObservability要素を回収していこうと思いました。
手元には俺たちのxQL完全ガイド、入門 Prometheus、オブザーバビリティ・エンジニアリングの3冊があったので順番に読みました。本を読みつつ、手を動かして知識を増やしておうちk8sに入れたいものの解像度を高めます。

# この本を読む前の状態

- Grafanaを使ったことがある
- exporterはよくわからないので、「exporterを自作した」とか聞くとすごい！どうやって作るんだろう...と感じる
- ログ・メトリクス・トレースを理解している
  - 俺たちのxQL完全ガイドを読んだので
- Prometheusの仕組みはよく分からない
  - 時系列DBが裏にいることは知っている
- home-k8sに入れる際に、現代的な方法を知らない
  - そもそもexporterの仕組みが分からないので、データがGrafanaで見れることと、データを対象から取得することが頭の中で結びついていない

# この本を読みながらやったこと

## 俺たちのxQL完全ガイドのチュートリアル環境とは別に、自力で一からPrometheus環境を作ってみる

[uta8a/workbench:prometheus-starter](https://github.com/uta8a/workbench/tree/6199deb9c41a79ce3fe04999060d5331512cdcd6/prometheus-starter)
go製のアプリ・grafana・k6・prometheusが立つDocker composeのセット

## exporterにおけるstateのmutexの大切さがピンと来なかったので、書いてみて理解した

先ほどのprometheus-starterを元に書いた [uta8a/playground:try-prometheus-broken-instrumentation](https://github.com/uta8a/playground/blob/f957ec894a4f5007337776eeefbceeb66d03b539/try-prometheus-broken-instrumentation/app/main.go)

以下の状況を考える。

- goのSDKで、 `prometheus.MustRegister(resourceState)` みたいにする
- resourceStateは以下のように遷移する
  - ラベルは `"starting", "running", "stopping", "terminated"` の4つ。状態はどれか一つで、これを `0,0,0,1` のようにどれかが1のフラグ立っているものとして管理する。
- (壊れた遷移) `transitionBroken(resource, nextState)` 関数内で以下の処理を行う
  - 全部のstateをまず0にする
  - (壊れやすくなるように、sleepを挟んだり、余計な処理を入れる)
  - 対象のnextStateを1にする

こうすることで、read処理がtransitionBrokenの実行中に走ると `0,0,0,0` の状態が観測されてしまう。また、処理によっては `1,1,0,0` のように1が2つあることもあり得る。これは極端なケースだけど、要はstateへのwriteをするときはmutexで書き込みの関数がstateを独占する状態にしてやる必要があります。

## PromQLを色々書いた

`without` 句を使おう。なぜならターゲットラベルは変わることが多く、更新時にクエリを更新する必要がないように、可能な限りターゲットラベルは全部残す方が推奨される。というようなことが書かれているので、そのプラクティスに沿ってPromQLを書いてみました。ここはまだカーディナリティの高い環境・ラベルの変更が起こる環境の経験がないのでプラクティスの良さを実感することはできませんでした。

# この本を読んだ後の状態

- Grafana、Prometheusの解像度がちょっと上がった
  - 環境がゼロから作れるようになった
  - prometheus-starter環境によって、手軽に実験できるようになった
  - Prometheusらしさや設計思想が学べた: Prometheusの仕組み、データ欠損を割と受け入れる、Pushgatewayは最後の手段
- exporterと `/metrics` の違いが理解できた→exporterを特別なものだと思わなくなった
  - アプリで `/metrics` を公開するのとexporterを自作することはやっていることはそんな変わらない
  - 要は観測対象の状態をPrometheusで観測可能になるようにPrometheusのテキストに変換することをしている。基本はSDK使って計装していく形
- home-k8sに入れるイメージが湧いた
  - とりあえず計装できるもののイメージが出てきた(node-exporter、アプリで `/metrics` を実装)
  - 色々試せる環境(prometheus-starter)ができたので、そこで色々試したい

# さらなる興味

- SwitchbotでCO2センサーを買ったので、これを対象にexporterを自分で書いてみる
  - 直接の計装は難しいので、間にRaspberry piを挟むpushgateway方式になる
- Health系のexporter書きたい
  - ウォッチから直接 `/metrics` を生やしたい。そういう開発が可能なスマートウォッチないかな...
- もっと大きなexporterの実装を読んでみたい
  - node-exporter、Cloudwatch exporterとか
- Grafana Alloyを調べたい
  - 高機能Agentという印象で、もっと詳しく知りたい
- 高カーディナリティ想定のTSDBが作れないだろうか？
  - 何かのトレードオフをとって、高カーディナリティに耐えるPrometheusを作りたい
