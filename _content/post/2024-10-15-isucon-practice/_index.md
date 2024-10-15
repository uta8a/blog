---
type: "post"
title: "ISUCON練習実況ログ 2024/10/14"
draft: false
description: "スコア 9521"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2024-10-15T19:03:39+09:00"
---

<!-- titleは自動で入る -->
ISUCON精進鯖で人を募って1時間バトル、1時間感想戦というのでやってみた。
今回は目新しいことはしてないので軽めに書く。

20:00 開始

# 初回ベンチ

20:01 スコア 3358

# `livestream_tags` にインデックス

`livestream_tags` テーブルの `livestream_id` にインデックスを貼った。

20:13 スコア 3934

# `icons` の改善

iconsを静的ファイルから返すようにした。last inserted idはグローバル変数として持つ。304対応はしない。

20:31 スコア 4123

# `ADMIN PREPARE` の改善

`conf.InterpolateParams = true` を追加

20:36 スコア 6664

# `themes` の改善

`themes` テーブルの `user_id` にインデックスを貼った。

20:41 スコア 7723

# `SELECT FROM users, livestreams, livecomments` の改善

`users` を消す

20:47 スコア 8532

# NGワード改善

クエリが複雑になっているのを、単純にcommentがNG wordに一致するなら消す方式に変更

20:55 スコア 7945

# `livecomments` にインデックス

`livecomments` テーブルの `livestream_id` にインデックスを貼った。

20:59 スコア 9521

# メモ

- 1時間で9回ベンチマーカーを回せたのでよかった
- ちょっと覚えゲーになっている面があるが、おかげでインデックスを貼るときとかのコマンドをソラで打てるようになった。
- `logrotate` を導入してログからtailする手間をなくしたい
- トランザクションで無駄に `commit` してる箇所の変更は結構コードの変更が必要
- 基本はスロ＝クエリの1番上から潰すが、 `COMMIT\G` についてはいったん無視するのもあり
- 今回僕はhtop→DB or APPを判断→pt-query-digestという流れで進めているが、alpもプロファイラも見て総合的にボトルネックを毎回判断すると良い
  - alpはざっくりとしか分からず、そこからpt-query-digestも見てボトルネックを特定する
- 複数台構成は早い段階でDB, APP1台ずつをやってみてもいいかも
- `pprotein` 使ってみる
