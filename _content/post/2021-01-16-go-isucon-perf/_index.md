---
layout: post
title: '読書: やってみようGoでISUCONパフォーマンスチューニングーISUCON7の予想問題を試してみる本ー'
description: 本を読んで進捗を報告し合う会をしました
draft: false
changelog:
  - summary: 記事作成
    date: 2021-01-16T17:07:46+09:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
---

- 読んだ本: https://booth.pm/ja/items/1035782
- 以前りゅーそうさんという方の [はじめての UI デザインの教科書をフロントエンジニアの方と読んだ](https://ryusou.dev/posts/beginner-uidesignbook) という記事を読み、誰かこれやりませんかと積読リストを公開したところ、 [あいのざさん](https://twitter.com/ainoz10) からリプライ頂いたので読んで感想を通話で話しました。
- アイデアの元になったりゅーそうさん、もやし丸さん、そして乗ってきてくださたあいのざさん、ありがとうございます。

## # 積読解消会の進め方

- 読む本を決めて、DM で進捗を報告しながら読み進める(今回は 30 ページほどの本だったが、環境構築など、手を動かす必要があった)
- 報告はこんな感じ: 今日は 15 ページまで進めました。環境構築で詰まったところは gist に置きました(gist のリンク)
- だいたいお互い終了したところで通話する日程を決める
- こんな感じ: discord で土曜日の 14:00-15:00 にやる(実際は 14:30-16:30 になった)
- (りゅーそうさんのブログには 2 時間とあったが、初めて話す相手なので 1 時間とっておいて、後ろは予定を入れず延長可能にしておいた)
- お話する
- 終わり

## # まとめと感想

- go なら alp と pprof
- 本体のソースコードの他に、nginx などミドルウェアにも詳しくなる必要がある。
- 最初に ISUCON に挑戦しても分からないと思うので、この本のようなチュートリアルはありがたい。得点も 10 倍になって簡単な修正で一気に点数が上がってとても楽しい
- 普段ゼロから Web アプリを書くと自分で書いたので勝手が分かるが、ISUCON のように他の人の書いたものだと勝手が分からない。経験値が必要。
- ISUCON の典型が知りたい。パフォーマンスチューニングのまずこれを疑え！的な典型集が欲しい。

## # 本書を現在(2021/01/16)やると遭遇するトラブルシューティング

## ## xbuild go-install が動かない

- Conoha では気にしなくてよいです。
- vagrant でやる場合、 https://github.com/matsuu/vagrant-isucon を使うと xbuild が失敗する。
- go の公式ページに従ってバイナリを wget/curl してインストールする

## ## pprof を実行するときに tau が必要

- pprof を入れると、tau がないと言われる
- 以下のように対応し、go tool から実行する

```shell
sudo apt-get install tau
go tool pprof localhost:8080 ~/isubata/webapp/go/src/isubata http://localhost:6060/debug/pprof/profile?seconds=60
```

## ## go-sql-driver が使えない

- go v1.9 で `go get go-sql-driver` すると、Builder 周りの v1.10 の機能をつかっているために go のビルドが通らない
- 以下のように、ライブラリ部分で git checkout して過去のタグがつけられた commit に戻ると使えるようになる。

```shell
go get github.com/go-sql-driver/mysql
cd github.com/
mkdir go-sql-driver
cd go-sql-driver
git clone https://github.com/go-sql-driver/mysql.git
git checkout v1.4
```

## # 今後やってみたいこと

- ISUCON7qual でさらなる改良をする。特に、今回は書籍に書いてあることしかしていないので、自力で考え出して(アイデアパート)自力で実装したい(実装パート)
- ISUCON の典型をまとめたい。ISUCON 慣れしたい。
- ましさんの N+1 検出ツール https://mesimasi.com/mercari_go_one/ のようなツールを試してみたい。これを使うためには go のバージョンを上げる必要があるので、ついでに Ubuntu20.04 対応をしたい。(ansible 書き換え)
- mini ISUCON 練習会を身内でやってみたい。ISUCON の運営楽しそうすぎる。(競技環境のホスティングのように、高度に厳しい状況でインフラをするの楽しそう)
