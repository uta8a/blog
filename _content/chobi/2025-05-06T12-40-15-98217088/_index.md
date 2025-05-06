---
type: "chobi"
title: ""
draft: false
description: ""
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2025-05-06T12:40:15.990488064+09:00[Asia/Tokyo]"
---

AlpacaHackの次の回に出ようと思って、Webの勉強をしている。

Arkさんの回なので、Arkさんの過去問を解こうと思って[Authored Challenges](https://alpacahack.com/users/ark)から、solvesの多い順に3つ解いてみた

- Simple Login
  - `\` を使えばいけることに気づいてからはすぐ解けた
- Treasure Hunt
  - error based injectionに気付けず、expressのパーサー(qs)を調べていた
- CaaS
  - 一回ファイルに書き出して、それをcowfileとして指定するところまで分かった
  - でもヒアドキュメントを用いた解法にこだわって解けなかった

こんな感じで1問しか解けてない。そのためこれから2桁solvesを解いても答えを見るだけになっちゃって学習とかモチベの面であまり嬉しくない。

Arkさんの問題は、これまでのwriteupとか読んだ感じパズル要素があってそこが面白い。

- Webの基本知識
- パズル要素

の2つから構成されていると言えそう。

多分easyなものはWebの基本知識が割と自明に見えるもので、hardはWebの基本知識が高度寄りになったりするのかも？少なくとも今解いた3つはSQL Injection, Error based oracle, OS Command Injectionと高度ではなかった。
ということは先にパズル要素でつまづいていることになる。
Treasure HuntはError basedに気づけなかったので、手段として色々持っておくのが大事そう。

これからやる方針として、Arkさんの問題構成に対応して

- Webの知識をつける
  - WaniCTFやCakeCTFのupsolve
- パズルの典型視点を身につける
  - ???

がありそう。正直パズルの典型視点を身につけられる感じがあまりない。でもドキュメントをくまなく探してパズルにつかえるガジェットを探す姿勢が足りないからCaaSが解けないわけだし...

無理だ〜という気持ちになってきたので切り替えると、このままArkさんの過去問を解いてもなあという話が発端だった。

- 他のWebも解いてみてからArkさんの過去問を見る
- 過去問に挑戦し続ける

これでいくと、「ドキュメントやソースコードを読みにいく」という作業をしないままArkさんの問題を消費するのは勿体無い気持ちが先に立つ。

一旦hamayanさんの[Web list](https://speakerdeck.com/hamayanhamayan/ctfnowebniokeru-nan-yi-du-wen-ti-nituite)を眺めてみて、基本的な姿勢として必要なものを試してみることにする。

今分かっている基本姿勢

- ドキュメントを読む
  - 細かいところまで調べる
- ローカルで機械的にpayloadを試す
  - ある程度自動化した方がいいかも
- Dockerコンテナの中に入って確認
  - 想像と違う挙動はローカル実機で確かめる
