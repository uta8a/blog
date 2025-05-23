---
type: "post"
title: "感想文: つくって、壊して、直して学ぶ Kubernetes入門"
draft: false
description: "手を動かしながら学べる良い本でした"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2025-04-28T22:42:20.536208896+09:00[Asia/Tokyo]"
---

<!-- titleは自動で入る -->
[つくって、壊して、直して学ぶ Kubernetes入門（高橋 あおい 五十嵐 綾）｜翔泳社の本](https://www.shoeisha.co.jp/book/detail/9784798183961) を読みました。
2024年9月に購入して、8ヶ月経ってようやく読み終えました。
実際に読んだ時間は10時間くらいだったと思います。

本を買ってすぐはちょっと読んでいたのですが、k8sモチベが[Talos Linuxに向かったり](https://blog.uta8a.net/post/2024-09-16-try-talos-linux)、[シンプルな例でVolumeを理解しようとしたり](https://blog.uta8a.net/post/2024-11-20-learn-volume-of-k8s)と色々な方向に発散しているうちに本へのモチベが下がっていました。ただそれ自体は悪いことだと思っていなくて、こうしてふと積んである本を読みたくなって一気に手を動かしながら読めたので、やっぱり時が来たら読むのが一番いいなと思います。

# 内容

Deployment, Podとかの概念がふんわりあるくらいのkubernetes初心者向けが、手を動かして具体的なイメージをつかみながら学ぶのに最適という印象です。

ページ数は360ページほどで、手を動かしながら読んでも30分で30ページくらいのノリで読めました。

# 本を読む前の自分の状況

- Volumeは理解している
- Pod, Deployment等の基本的なことはわかっているつもり
- カスタムコントローラーは書いたことがない
- k8sの上で動くアプリのデバッグ、特にネットワークトラブル周りはどう手をつけたらいいか分からない

# 本を読んだ後の自分の状況

- アプリに繋がらない時の切り分け手法を学んだ
  - ただやみくもに見に行くのではなく、 `kubectl logs` を見て、Pod内疎通を見て、クラスタが同一でServiceを通さない状態で疎通確認して、Service通して疎通確認して...という流れを体験できた
- Pod affinityの感覚を図でイメージできるようになった
  - schedule周りのいくつかの用語が整理できた。Taint, affinityなど
- カスタムコントローラはまだ書けないけど、教材やどういう時にカスタムリソースを書いたらいいかは分かった

# 感想

- k8sのRelease Stage(alpha, beta, GA)の機能を追跡できるようにRSS見たいな
- kubernetesのうまく行かないやつを原因切り分けするの楽しかったので、sad serverとかICTSC的な問題集が欲しい
- krewプラグイン便利すぎる
  - ctx, nsはすごいお世話になっています
- ネットワークの切り分けがちょっと分かるようになってきた
- jsonpathとかcustom columnsで指定する `.hoge.fuga.piyo` みたいなやつ、覚えられる気がしない
  - YAML構造が頭に入ってないときつそう。補完が欲しい。
- ConfigMapはVolume理解の時に調べたので良い復習になった
- `kubectl describe` って情報量多くない？必要な情報見つけるのむずい
- maxSurgeを理解した
  - AWSのECSでもこういうやつある
- Jobのおうちk8sでの具体例が思い浮かばなかったけど、AIに教えてもらった
  - データバックアップ、バッチ処理、システムチェックとからしい
- Jobは使ったことなかったので、手を動かして具体的なイメージが湧いてよかった
- Probeも使ったことなかった。
- Resource requests, Resource limitsも理解できた
  - これおうちk8sでも設定しておきたい
- Affinityは結構難しい概念だなと感じた
  - 望んだ通りにPodを配置させる、というモチベーションに対してアプローチの仕方が多い
- hpaのところ面白かった
  - wgetで負荷をかけて、あんまりすぐにスケールが反応しないところとか意外だった
- 最後の総集編は難しかった
  - 自力で最初取り組んだら最初にconfigmap見に行ってそこ変更しちゃったから、切り分けづらくなってしまった。
  - CrashLoopBackOffだと `kubectl debug` が使えないことがある。辛い
  - こういう、この手法が使えないときはこれみたいなのはあるので手札を増やして状況別に整理したい
- Talos Linuxのおうちk8sで作業しているとPod Security Admissionみたいなやつで怒られが発生しがちで困っているので、そういったセキュリティ的な制限によって動かないのをどうする？みたいな方向性の作って壊してネタもありそう

# 終わりに

おうちk8sに監視入れるモチベが上がりました。(Grafanaとか)
理解の補助となる図がふんだんにあるのもいいなと思いました。対象となるPodもNodeも複数あるので、テキストだけでは理解できないから図を使って認知負荷を下げていくスタイルいいな〜と思いました。
