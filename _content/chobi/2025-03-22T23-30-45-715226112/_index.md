---
type: "chobi"
title: ""
draft: false
description: ""
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2025-03-22T23:30:45.716116992+09:00[Asia/Tokyo]"
---

ブログをちょっと改善した

- dependencyの更新
  - prism.js, lume, github actionsを更新した。
  - `_script/cli.ts` のdate-fns依存を外してTemporal(denoのunstable)に切り替えた。
- chobiの追加
  - ちょっとした文章が書きたくてしずかなインターネットに書きがちだったのでこっちに切り替える

まだ直せてない

- RSSが壊れてる？
  - localeをGitHub Actionsのjobに追加
  - `/feed.json` 削除して `/feed.rss` のみにした
  - [`_headers`](https://developers.cloudflare.com/pages/configuration/headers/) を設定

RSSはinoreaderでダメそう、Feedlyは大丈夫そう、と挙動が違うのも気になる。謎。

あとはお便りを送る機能とお便り返信ページを作りたい。[花園シャトー107号室](https://hanazonochateau.net/posts/)リスペクト。
