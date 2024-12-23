---
type: "diary"
title: "おうちk8sをはじめて2ヶ月が経過したが進捗がなく、涙"
draft: false
description: "振り返り進捗報告"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2024-11-10T20:57:34+09:00"
---

<!-- titleは自動で入る -->
おうちk8sに憧れてなんとなくマシン3台買ったんですが、だいぶ形から入ったので進捗が思ったよりないです。
これはまずいと思ったので、進捗報告を定期的に外に書こうと思いました。これは進捗報告第一弾です。

# 進捗報告

- 動かせたソフトウェア
  - nginx
  - tailscale
- 動かせなかったソフトウェア
  - mastodon
  - minecraft(ストレージちゃんとできなかった)
  - gerrit

# この2ヶ月でどう変わったか

できることに注目してみる。

## 2ヶ月前

- kindは使ったことある
- nginxのpodを立てたことがある
- Security周りはよく分からない
- 複数台の実機上でk8sを動かしたことがなく、イメージが湧かない
- 単純な概念は知っている。Pod, Deployment, ReplicaSetは知ってる
- kubectl get podとかは叩ける

## 現在

- Talos Linuxを使って実機でk8sを動かす時の手順を知っていて、詰まった時のデバッグの道筋もなんとなく分かる
  - 参考: [k8sを動かすホスト向けに特化した Talos Linux インストールバトル(実機)](https://blog.uta8a.net/post/2024-09-16-try-talos-linux)
- 複数台の実機上でk8sを動かした時、Talos Linuxではどのように1台から始めて他のマシンをクラスタに参加させていくかイメージがある
- 複数台の実機でk8sを動かしていても、kubectlを叩く視点からはマシンの違いを意識すしない、ということを把握した。
  - 規模が小さいので複数マシンへの振り分けも意識していない
- Pod Security Admissionの存在を知っている
  - 警告に対して `securityContext` でこう書けばなんとかなるっぽいという感覚を持っている
- `kubectl debug` を使える
- サービスを外に出す際に、Tailscaleを用いて外部からアクセスされない形で他のマシンからアクセスできるように設定できる
- `kubectl get pod` 以外にも、`service`, `namespace`, `ingress` なども見るようになった。
- サービスがTailscale経由でアクセスできない時に問題を切り分けられるようになった。
  - 大抵はそもそもpodが生きてるか・Tailscale側で設定間違えてないか、と両側から調査している
- その辺のhelmを使って、うまくいかないときにリポジトリをcloneしてきてYAMLを直接書き換えてなんとか通すみたいなことができる(時もある)
- namespaceごと消すときにうまくingressが消えてくれない場合、finalizerを `kubectl edit` で消してうまく消えるようにする方法を知っている

# できないこと

- PVCとかPVみたいなストレージ関連の知識がない
  - どういうものかは基礎からの新しいストレージ入門で知っているつもりだったが、実際に触ってみると思ったより何も分からない
  - 例えば、minecraftのコンテナだけが与えられていた場合に適切にVolumeを設定する、みたいなことができなかった
- helmがやってくれる範囲がどこまでなのか分からない
  - helmがブラックボックスすぎて気持ち悪い
- kubernetes operatorもよく分からん
- アプリケーション側が謎な時に何もできない
  - Gerritを動かしてみようとしたが、Gerrit自体がよく分からなくて動かせなかった

全体的に、コンテナを動かすことはできるけどボリュームが絡むと終わりみたいな感じがする。あと、既存ソフトウェアを動かして遊ぼうとしては数時間溶かしてデバッグ力は上がるけど動かせなくてやる気が消える、というパターンを繰り返している。多くはストレージ周りが原因なので、ストレージを真面目にやると良さそう。

こうしてみるとあまりにも雰囲気でソフトウェアを触っている... もっとドキュメントを真面目に読む時間を明示的に取ったりすると良さそう。

# やりたいことリスト

- k8sのバージョンアップ
  - なんか辛いと聞くので対応してみたい
  - とはいえ何も載せてなければk8sのバージョンアップは簡単な気がする
- 自分の日常生活で役に立つサービスをホストする
  - Tailscaleを使っているのでスマホからも触れるようにできる
- 色々ソフトウェアを動かしてみたい
  - Tekton
  - ArgoCD
  - Gerrit
  - GitHub Actions Self-hosted Runner
  - GitLab
  - Envoy
  - DuckDBなど、名前しか聞いたことないデータベース色々
  - 分散ビルド

せっかくおうちにある(クラウドではない)のだから、長期に渡るメンテナンスを体験したい。あとは気軽に色々デプロイしていきたい。マシンリソース結構あるのでね。
