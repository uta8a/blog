---
type: "post"
title: "入門 モダンLinux を読んだ"
draft: false
description: "Linuxの基礎部分の確認や足りない部分が分かりました"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2023-05-11T20:24:54+09:00"
---

<!-- titleは自動で入る -->

[入門 モダンLinux](https://www.oreilly.co.jp/books/9784814400218/) を読み終えました。知っていることも多かったのですが丁寧に読んだこともあり、250ページくらいを2週間くらいにわたって13時間ほどかけて読みました。

# 概要

基礎的なLinuxのトピックについて、現代的な視点から学ぶ。

- Linuxの歴史
- Linuxカーネル、カーネルコンポーネントについての概観
- シェルスクリプト周りの話題
- アクセス制御やセキュリティ
- ファイルシステム
- アプリレイヤ、パッケージ管理
- コンテナを支えるLinuxの機能
- エンドユーザ視点でのネットワーク(TCP/IP, DNSなど)
- オブザーバビリティ
- プロセス間通信
- 仮想マシン

私の事前知識として、Ubuntuを毎日使っていてdockerで開発するので、シェルスクリプト周りや、コンテナの話や、ネットワークなど、具体的なコマンドに関しては知っているものも多かったです。一方で、Linuxカーネルやファイルシステム、アクセス制御、オブザーバビリティの話題は初めて知るものが多かったです。一番ためになったものを挙げるとすれば、9章のプロセス間通信のところです。

この本の良さは、「Linuxにまつわる抑えておくべき知識を、現代的な視点で整理している」ところにあると感じました。
Linuxにある程度慣れていて `ls` とか `docker` とか `ip a` のようなコマンドを打ったことがある僕は、プロセスやネットワークを大学の情報の講義で習っていても、その知識が普段触るツールとは結びついていない状態でした。
モダンLinuxを読んだことでいくつかのLinuxの基礎的なトピックが整理されていったのがよかったです。具体的なツールや参考文献へのリンクも豊富で、気になったことを検索して探すコストが省けるのも嬉しいです。

# できるようになったこと/わかるようになったこと

- プロセス管理の用語として、セッション、プロセスグループ、プロセス、スレッド、タスクがそれぞれ説明できるようになった
- アクセス制御の文脈で、ユーザ、プロセス、ファイルという3つの要素を用いてLinuxの権限管理を理解した。
- ファイルシステムの文脈で、VFSの役割が説明できるようになった。ファイルシステムを利用できるようにするまでの流れを、ファイルシステムの作成とマウントという視点で整理した。
- initプロセスの文脈で、initd, systemdの関係を整理した
- CoW(コピーオンライト)ファイルシステムが何か説明できるようになった
- オブザーバビリティの用語として、オブザーバビリティ、テレメトリ、ログ/メトリクス/トレース、インスツルメンテーションがそれぞれ説明できるようになった
- ネットワーク用語のソケットと、IPCの文脈でのUNIXドメインソケットの違いがわかるようになった
- プロセス間通信の視点でシグナル、無名パイプ、名前付きパイプ、UNIXドメインソケットを整理した
- FirecrackerやCoreOSやBottlerocketといった最近よく聞くVMMやOSの特徴が分かった

# 今後やりたいこと

- 知らない単語がたくさんあるので気になったものは調べたい
  - AmigaOS, Plan 9, Hugepage, Cilium, Falco, TLB, ...
- ターミナルエミュレータやシェル、マルチプレクサの環境を整える
  - どこまでがターミナルエミュレータの責務で、どこまでがターミナルマルチプレクサの責務なのか考えたい
- コンテナのセキュリティに興味が出たので、[Container Security Book - mrtc0](https://container-security.dev/) や [Seccamp 2022 B6 資料](https://github.com/mrtc0/seccamp-2022) を見て学ぶ
- NixOSの思想や工夫を学ぶ

## やってみたいアイデア

- Androidを学ぶついでにLinux Kernelについて学ぶ
  - 例えばどのようにして起動からAndroidのUIが出てくるまでの処理がなされているのか気になる
- オレオレファイルシステムを作って学ぶVFSという教材を作るのはどうか
  - VFS対応したら、一人前のファイルシステム名乗れそうなので教育用に良さそう
- パッケージマネージャ面白そうなので、private registryを立ててみて遊ぶ
- DNSを立ててみる
  - Knotとか
  - 参考: [モダン実装でステキな DNS フルリゾルバ Knot Resolver を紹介するよ](https://engineers.ntt.com/entry/2021/12/23/164901)
- 個人開発でPrometheusやGrafana使って監視まで体験してみたい