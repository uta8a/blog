---
layout: post
title: Minecraftのサーバをterraformを使って立てる
description: マイクラサーバをterraformを使って立てます
draft: false
changelog:
  - summary: 記事作成
    date: 2021-02-14T13:01:23+09:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
---

- GCP で借りた GCE インスタンスを用いて Minecraft サーバを立てるときに、なるべく立てやすくするために作業をコード化する話をします。

## # Minecraft サーバをどうするか

- Minecraft をマルチで友人とするとき、問題となるのはサーバをどうするかです。
- 以下のような選択肢があります。

```text
1. ずっとサーバを可動させて、いつでも入って遊べるようにするパターン(VPS, 自宅サーバ)
2. 必要なときだけ可動させるパターン(AWS EC2, GCP GCEなどのインスタンス)
```

- VPS はいつでも遊べるという利点がある点から、たくさんの人がいるサーバに適しています。
- それに対し、遊ぶ人数が最大でも 3 人くらいでかつそんな頻繁に遊ばないのであれば、2.のように集まったときに遊び、普段はサーバを立ち上げないという方法も選択肢に入ってくるかもしれません。
- 今回は、 **2.の選択肢** の方法を説明します。

## # terraform

- (terraform のコードの説明)

## # ansible

- (ansible のコードの説明)

## # 金額

- (log に思ったより金額がかかる話)

## ## ansible に寄せる

- (ansible aws module 触ってみる)

```text
# TODO
- repoをcredential抜いて公開(dummy fileを置いておく)
- ansible周りをちゃんとやる
```
