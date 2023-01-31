---
layout: post
title: 週刊ブックマーク 5/14 - 6/28
description: 記事を読んだ記録や小さなメモ。
draft: false
changelog:
  - summary: 記事作成
    date: 2021-05-16T09:23:46+09:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
---

- [絵文字をファビコンとして表示する簡単な方法](https://zenn.dev/catnose99/articles/3d2f439e8ed161) 仕組みは SVG をファビコンに指定できるので、テキストを SVG に埋め込めばいけるという話。個人的に、開発で favicon が vercel の三角形になりがちなのでこういう手軽さはよいと思った。
- [GraphQL IDE の “GraphiQL” をカスタマイズして、開発ツールとして活用する](https://developer.hatenastaff.com/entry/2021/05/14/093000) 読み方は"ぐらふぃくる"らしい。GraphQL のクライアントをカスタマイズしてデバッグ時に使う preset などをツールバーからぽちっとするだけで初期クエリを生成できるようにしている。
- [locate と updatedb](http://www.sooota.com/locate%E3%81%A8updatedb/) mlocate パッケージと updatedb コマンドを用いて、例えば docker-compose で up したまま restart:always にしてしまったがどのフォルダで立ち上げたかわからないときに、以下のように検索を掛けられる。find を何度も回すよりも一回 DB 作ってからの方が速い。updatedb は cron で回すとよい。

```shell
updatedb # DBアップデート 時間かかる
locate -r "/.terraform$" # r - regex
locate -r "docker-compose*" # match docker-compose.dev.yml, ...
```

- [A Deep Dive Into V8](https://blog.appsignal.com/2020/07/01/a-deep-dive-into-v8.html) V8 ではコンパイル、GC の過程、シングルスレッドがポイントになる。 v5.9(2017)では Ignition コンパイラが Turbofan になっている。動的言語は実行中にオブジェクトが書き換わるので、allocate する領域をどのくらいとればいいのか分からず困る。例示として HiddenClass の話が出た。
- [WebRTC を今から学ぶ人に向けて](https://zenn.dev/voluntas/scraps/82b9e111f43ab3) 用語の意味が分かってから勉強すると早い。トラブル解析や負荷試験、コーデックにも触れられている。
- [LocalStack に向けて Terraform を実行する](https://future-architect.github.io/articles/20201113/) [LocalStack](https://github.com/localstack/localstack) という、AWS の環境のローカル環境テストとして使えるエミュレーターのようなものと terraform の組み合わせについての記事
- [2020 年の振り返りと次やりたいこと](https://shinyaigeek.dev/post/log-2020/) しにゃいさんの振り返り。開発でフロントエンドの再発明を行っている、babel/traverse で AST が扱えること(特に prefetch に関わりそうなので個人的にも CSS Animation に生かせそう)、WriteCodeEveryDay をしていることが参考になる。
- [IAM role における、混乱した代理問題についての説明](https://qiita.com/hkak03key/items/a960b7523557f03bc098) 混乱した代理問題という、arn を推測してサービスに登録することで信頼関係も含めて完了している設定を適用して権限を得る問題への ExternalID を利用した対策
- [banga/git-split-diffs](https://github.com/banga/git-split-diffs) git diff を GitHub style で terminal から見れる。
- [より安全にご利用いただけるようになった Classi のご報告と今後の取り組みについて](https://corp.classi.jp/news/2416/) インシデントの検知からその後の対策までが書かれている。メルカリなど見ていると、GitHub には侵入されるという前提で考えた方がよい。
- [「何か質問や意見ありますか」の後の無言対策](https://konifar-zatsu.hatenadiary.jp/entry/2021/05/12/232722) 出席をとります、と背景の変更、とテキストチャットを使え、が参考になる
- [Google の新しい分散型 SDN コントローラー「Orion」（パート 1）](https://www.school.ctc-g.co.jp/columns/nakai2/nakai2104.html) google のデータセンターに導入された分散型 SDN コントローラー Orion の紹介。Jupyter と B4 というネットワークシステムと、Orion のアーキテクチャの仕組みが説明されている。
