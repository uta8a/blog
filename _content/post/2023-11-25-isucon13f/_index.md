---
type: "post"
title: "ISUCON13に出た"
draft: false
description: "初めて蟹を見た kofuk というチームでISUCON13に出ました。最終スコアは1万ちょいくらいです"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2023-11-25T23:43:21+09:00"
---

<!-- titleは自動で入る -->
- リポジトリ: [`uta8a/isucon13q-2023-11-25`](https://github.com/uta8a/isucon13q-2023-11-25)
- チームメンバーの書いたブログ: [ISUCONに出た - チラシの表の反対側](https://www.kofuk.org/blog/20231125-isucon/)
- ISUCON公式のページ: [ISUCON13まとめ](https://isucon.net/archives/57801192.html)

ほとんどチームメンバーが内容を書いてくれたのですが、僕もブログ書いておくか〜となったので書きます。

# 基本情報

- 言語: Rust
- チームメンバー: uta8a, kofuk
- 最終スコア: 11700点くらい

# 本番前まで

ISUCONにはこれまで以下の回で出ていますが、なんか毎年直前にちょろっと準備して本番であたふたして終わっていて、ゼロ点 or 初期スコアみたいな感じでまともな改善を入れられたことがありませんでした。向上していないのは結構恥ずかしいことだなと思っているので、あまり参加歴を言ったことはありません。

- 2019年 ISUCON9 Dancing in the turkey
- 2020年 ISUCON10 踊る七面鳥
- 2022年 ISUCON12 Metronome
  - [ISUCON12予選で0点だったので反省する](https://blog.uta8a.net/post/2022-07-30-isucon)

今年も準備をせず、やらなきゃな〜と思いつつ腰が重くて何もしてなかったんですが、唯一 [KOBA789さんのISUNARABE](https://isunarabe.org/)は少しやりました。環境構築めんどいな〜と思ってなんもしないがちなんですが、ISUNARABEを使うと一発で環境が立つので良かったです。

前日までチームメンバーと打ち合わせをしてなかったのですが、流石に前日にISUNARABEを使ってGitHubとかNotionで共有ドキュメントやるあたりとか、初動の確認をしました。

# 当日

チームメンバーとdiscordで繋ぎながら出題動画を見て、「動画配信かぁ〜！やべー！」って言ってました。実際は動画配信関係なかったです。

## 初動

- それぞれのサーバにsshできるか確かめる(2人とも)
- ブラウザでの挙動を確認。スクショも撮る。できれば重いと思うところをメモ
- ベンチ回す
- Rustへの切り替え
- ベンチ回す
- バックアップを取る(ルートからgit init)
- 計測準備
  - インストール
  - alpのためにnginxの設定変更

このあたりはスムーズにできたのですが、手動オペレーションが多かったのでスクリプト化しておきたいです。

初期スコアは3000点前後でした。

## `/api/livestream/\d+/statistics` の改善

topを眺めていた結果

- mysqlで180%
- appが20%

alpの結果

- GET `/api/livestream/\d+/statistics`
- GET `/api/livestream/\d+`
- GET `/api/user/\w+/statistics`

の順位になっていました。特に `/api/livestream/\d+/statistics` は呼び出し回数も一回あたりのレスポンスタイムも長かったです。

pt-query-digestの結果

- `SELECT IFNULL(SUM(l2.tip), 0) FROM livestreams l INNER JOIN livecomments l2 ON l.id = l2.livestream_id WHERE l.id = 1\G`
- `SELECT COUNT(*) FROM livestreams l INNER JOIN reactions r ON l.id = r.livestream_id WHERE l.id = 1\G`
- `SELECT * FROM livestream_tags WHERE livestream_id = 7550\G`

の順になっていました。

体感としても個別の配信ページを見たときに配信ランキングが出るのが異常に遅いのでこのあたりが最初に取り組むところでしょう。

結果、DBに取り組もうという話になって `get_livestream_statistics_handler` を速くしようと取り組み始めました。
kofukが手が早くて、以下のクエリを出してくれました。

このクエリはscoreとlivestream idの列をsortして返すクエリです。普通に `GROUP BY` するとスコアゼロのidが消えてしまうので `SELECT 0 score, id` からのやつでスコアゼロのidも残るようにしています。

```sql
SELECT reactions + tips score, t.id id
  FROM
  (
    SELECT COUNT(*) reactions, l.id id FROM livestreams l
      INNER JOIN reactions r ON l.id = r.livestream_id GROUP BY l.id
  ) r
  INNER JOIN
  (
    SELECT IFNULL(SUM(l2.tip), 0) tips, l.id id
      FROM livestreams l
      INNER JOIN livecomments l2 ON l.id = l2.livestream_id
      GROUP BY (l.id)
  ) t ON r.id = t.id
UNION
SELECT 0 score, id
  FROM livestreams
  WHERE id NOT IN
  (
    SELECT t.id
      FROM
      (
        SELECT COUNT(*) reactions, l.id id
        FROM livestreams l
        INNER JOIN reactions r ON l.id = r.livestream_id GROUP BY l.id
      ) r
      INNER JOIN
      (
        SELECT IFNULL(SUM(l2.tip), 0) tips, l.id id
          FROM livestreams l
          INNER JOIN livecomments l2 ON l.id = l2.livestream_id
          GROUP BY (l.id)
      ) t ON r.id = t.id
  )
ORDER BY score DESC, id;
```

その後の処理を見るとランクだけを出せば良いと分かったのでrankを出すように改善しました。(kofukの手が早い)

`COUNT` , `SUM` を `INNER JOIN` すると両方に存在するやつしか残らないので `RIGHT JOIN` にしてます。ランキングは `ROW_NUMBER` で出して、idもDESCにします。

```sql
SELECT a.ranking ranking
  FROM (
  SELECT a.score score, a.id id, ROW_NUMBER() OVER (ORDER BY a.score DESC, a.id DESC) ranking
  FROM
  (
    SELECT reactions + tips score, t.id id
      FROM
      (
        SELECT COUNT(*) reactions, l.id id FROM livestreams l
          INNER JOIN reactions r ON l.id = r.livestream_id
          GROUP BY l.id
      ) r
      RIGHT JOIN
      (
        SELECT IFNULL(SUM(l2.tip), 0) tips, l.id id
          FROM livestreams l
          INNER JOIN livecomments l2 ON l.id = l2.livestream_id
          GROUP BY (l.id)
        UNION
        SELECT 0 tips, l.id id
          FROM livestreams l
          WHERE id NOT IN
          (
            SELECT l.id
              FROM livestreams l
              INNER JOIN livecomments l2 ON l.id = l2.livestream_id
              GROUP BY (l.id)
          )
      ) t ON r.id = t.id
    UNION
    SELECT 0 score, id
      FROM livestreams
      WHERE id NOT IN
      (
        SELECT t.id
          FROM
          (
            SELECT COUNT(*) reactions, l.id id FROM livestreams l
              INNER JOIN reactions r ON l.id = r.livestream_id
              GROUP BY l.id
          ) r
          RIGHT JOIN
          (
            SELECT IFNULL(SUM(l2.tip), 0) tips, l.id id
              FROM livestreams l
              INNER JOIN livecomments l2 ON l.id = l2.livestream_id
              GROUP BY (l.id)
            UNION
            SELECT 0 tips, l.id id
              FROM livestreams l
              WHERE id NOT IN
              (
                SELECT l.id
                  FROM livestreams l
                  INNER JOIN livecomments l2 ON l.id = l2.livestream_id
                  GROUP BY (l.id)
              )
          ) t ON r.id = t.id
      )
    ORDER BY score DESC, id
  ) a
) a
WHERE a.id = ?;
```

このあたり僕も裏でSQL叩いてうーんとやってたのですがさっと動くものを出してこれるのはkofukすげーとなりました。SQL力をつけたい。

これにより 3000点 → 3800点 くらいになった気がする。

## `livestream_tags` でのインデックス貼り

計測結果が以下のように変化しました

- top
  - DB 160%
    - DB少し下がった
  - App 20%
- alp
  - GET `/api/livestream/\d+`
    - AVGが大きく下がった
  - GET `/api/user/\w+`
  - GET `/api/livestream/search`
- pt-query-digest
  - `SELECT * FROM livestream_tags WHERE livestream_id = 7551\G`
  - `SELECT image FROM icons WHERE user_id = 1066\G`
  - `SELECT content,ttl,prio,type,domain_id,disabled,name,auth FROM records WHERE disabled=0 and name='*.u.isucon.dev' and domain_id=2\G`

まだDBがボトルネックなので、DBに取り組もうという話になりました。
livestream_tagsにインデックス貼られてないんじゃね？疑惑があったので、EXPLAINしてみました。(このへんでさっきの改善で出来上がったやばいクエリ含めて色々EXPLAINしてみてた)

貼られてなかったので貼った。

```sql
ALTER TABLE livestream_tags ADD INDEX livestreamid_index (`livestream_id` DESC);
```

indexが貼られました。

```text
mysql> show index from livestream_tags;
...
| livestream_tags |          1 | livestreamid_index |            1 | livestream_id | 
...
# livestreamid_index が存在している
```

EXPLAINしてみてindex貼られてない？と焦ったのですが、WHEREつけてEXPLAINしてなかったのが原因でした。

```text
> explain SELECT * FROM livestream_tags WHERE livestream_id = 1\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: livestream_tags
   partitions: NULL
         type: ref
possible_keys: livestreamid_index
          key: livestreamid_index
      key_len: 8
          ref: const
         rows: 2
     filtered: 100.00
        Extra: NULL
1 row in set, 1 warning (0.00 sec)
```

これにより 3800点 から結構上がった気がします。(覚えてない)
index貼るだけでこんな上がるんか！と喜びました。

## icon周りの改善

計測結果が以下のように変化しました。

- top
  - DB 150%
  - App 30%
- alp
  - GET `/api/livestream/\d+`
  - GET `/api/user/\w+`
  - POST `/api/livestream/\d+`
- pt-query-digest
  - `SELECT image FROM icons WHERE user_id = 1026\G`
  - `SELECT content,ttl,prio,type,domain_id,disabled,name,auth FROM records WHERE disabled=0 and name='*.u.isucon.dev' and domain_id=2\G`
  - `SELECT IFNULL(SUM(l2.tip), 0) FROM users u INNER JOIN livestreams l ON l.user_id = u.id INNER JOIN livecomments l2 ON l2.livestream_id = l.id WHERE u.id = 42\G`

DBが下がってきて、Appが上がってきました。また、pt-query-digestでimageを取っているのでこれは画像をDBに保存しているパターンか！？となって、調べてみたらそうだったのでそこを改善します。kofukが画像をDBから出すのとnginxの担当を、僕はコード側の変更をしました。

### コード側の変更

iconsが関わるのは以下の3つのハンドラです。

- `get_icon_handler`
  - アイコン取得
- `post_icon_handler`
  - アイコンの保存、存在していればDELETEして更新
- `fill_user_response`
  - レスポンスで謎にiconのidを返している

画像は結果的に `/home/isucon/webapp/public/usermedia/$username.jpg` みたいな感じで保存しました。

kofukがnginxから直接icon画像を返すようにしてくれたので `get_icon_handler` は丸ごと消しました。

`post_icon_handler` では `req.image` が `Vec<u8>` なので、(ファイルが存在すれば消してから)ファイルを作り、 `write_all` で保存する処理を書きました。

`fill_user_response` では最初レスポンスにiconのidを返していて謎だなあと思い固定値でゼロを返しましたが、整合性チェックで落ちるので空の `vec![0]` をimageとして入れるようにして実質idだけを保存するようにしました。

```rust
let emp: Vec<u8> = vec![0]; // imageはNON NULLなのでdummyで入れる
file.write_all(&req.image).await?;
let rs = sqlx::query("INSERT INTO icons (user_id, image) VALUES (?, ?)")
    .bind(user_id)
    .bind(emp)
    .execute(&mut *tx)
    .await?;
tx.commit().await?;

let icon_id = rs.last_insert_id() as i64;
```

### 画像側の変更、nginxの変更

nginxの設定はkofukがしてくれました。

詰まったポイントとして、nginxの設定が効いてないと思っていたら、rootの `/home/isucon/webapp/public/` 以下におく必要があったみたいです。

あと、DBから画像を出してusermediaに保存、みたいなことをしていたのですが、整合性チェックで落ちました。NoImage.jpgを返すべきみたいなことを言われたので調べると、DBの初期化時点でiconsは空なので、DBから画像を出して保存する必要はないことが分かりました。

init.shでImageをusermediaから消すようにしました。

```bash
shopt -s nullglob
rm /home/isucon/webapp/public/usermedia/* || true
```

以上の改善で動くようになって、点数も上がりました。(覚えてない)

## `fill_livestream_response` のN+1改善

計測結果が以下のように変化しました。

- top
  - DB 120%
  - App 40%
- alp
  - GET `/api/livestream/\d+`
  - POST `/api/livestream/\d+`
  - GET `/api/user/\w+/statistics`
- pt-query-digest
  - `SELECT IFNULL(SUM(l2.tip), 0) FROM users u INNER JOIN livestreams l ON l.user_id = u.id INNER JOIN livecomments l2 ON l2.livestream_id = l.id WHERE u.id = 174\G`
  - `SELECT COUNT(*) FROM users u INNER JOIN livestreams l ON l.user_id = u.id INNER JOIN reactions r ON r.livestream_id = l.id WHERE u.id = 117\G`
  - `SELECT content,ttl,prio,type,domain_id,disabled,name,auth FROM records WHERE disabled=0 and name='pipe.u.isucon.dev' and domain_id=2\G`

DBが結構落ちてきていて、ボトルネックの移動を感じますね。

まだ GET `/api/livestream/\d+` が重いのでみていたら呼ばれる関数 `fill_livestream_response` がN+1になっていました。

kofukがシュッと改善してくれて、livestream idからtagsが引けるようになりました。

この改善でも点数が上がりました。このあたりで8000点くらいで、1万点超えたい〜と話していました。

## `get_user_statistics_handler` の改善

計測結果はメモしてないです...

- top
  - DB 100%
  - App 40%

GET `/api/user/\w+/statistics` のクエリが重くて構造としては `/api/livestream/\d+/statistics` の改善と似ているのでSQLをこねはじめます。残り1時間を切っていたので、これ無理ならrevertしましょう、と言っていました。

kofukがクエリを書いてくれました。

```sql
SELECT a.ranking ranking
FROM (
  SELECT a.score score, a.id id, ROW_NUMBER() OVER (ORDER BY a.score DESC, uz.name DESC) ranking, uz.name username
  FROM (
    SELECT reactions + tips score, t.id id
    FROM
    (
      SELECT COUNT(*) reactions, u.id id
        FROM users u
        INNER JOIN livestreams l ON l.user_id = u.id
        INNER JOIN reactions r ON r.livestream_id = l.id
        GROUP BY u.id
    ) r
    RIGHT JOIN
    (
      SELECT IFNULL(SUM(l2.tip), 0) tips, u.id id
      FROM users u
        INNER JOIN livestreams l ON l.user_id = u.id
        INNER JOIN livecomments l2 ON l2.livestream_id = l.id
        GROUP BY u.id
      UNION
      SELECT 0 tips, u.id id
        FROM users u
        WHERE id NOT IN
        (
          SELECT u.id
          FROM users u
            INNER JOIN livestreams l ON l.user_id = u.id
            INNER JOIN livecomments l2 ON l2.livestream_id = l.id
            GROUP BY u.id
        )
    ) t ON r.id = t.id
    UNION
    SELECT 0 score, id
      FROM users
      WHERE id NOT IN
      (
        SELECT t.id
        FROM
        (
          SELECT COUNT(*) reactions, u.id id
            FROM users u
            INNER JOIN livestreams l ON l.user_id = u.id
            INNER JOIN reactions r ON r.livestream_id = l.id
            GROUP BY u.id
        ) r
        RIGHT JOIN
        (
          SELECT IFNULL(SUM(l2.tip), 0) tips, u.id id
          FROM users u
            INNER JOIN livestreams l ON l.user_id = u.id
            INNER JOIN livecomments l2 ON l2.livestream_id = l.id
            GROUP BY u.id
          UNION
          SELECT 0 tips, u.id id
            FROM users u
            WHERE id NOT IN
            (
              SELECT u.id
              FROM users u
                INNER JOIN livestreams l ON l.user_id = u.id
                INNER JOIN livecomments l2 ON l2.livestream_id = l.id
                GROUP BY u.id
            )
        ) t ON r.id = t.id
      )
    ) a
    INNER JOIN users uz ON a.id = uz.id
   ) a
 WHERE a.id = ?
```

やばすぎる

user idを入れるとランクが帰ってきます。

この改善により1万点を超えました！ウオオ

## 最後

- 再起動してみる `sudo reboot`
- ログの出力を止める
- ベンチマークガチャを回す

以上で11700点くらいでfinishだったと思います。

# 感想

- SQL力をつけたい
  - 来年はkofukの手の早さに追いつけるようになりたい
- Rustが関わるところまで行きたい
  - 今回僕がやったのは誰でもできるような部分と、「ランクだけ必要だからランキング全部を返さなくていいな」とか「nginxのroot大事なんかな」とかチャチャを入れることだけだったので、Rustパワーが関わるところまでフェーズを進めたかったですね。
- DNSとかの面白いところに行きたかった
  - 本質の手前で終わってしまった感じがすごいです。でも去年と比べると計測→改善→計測のサイクルを回せていて、気になる箇所にいきなり飛びつくムーブをしなかったのでめちゃ良かった。純粋な実力不足なのでとってもいい気分です。
  - とはいえ本質的な面白さに辿り着きたかったですね。悔しい。

毎年来年は強くなるぞ！と思ってなんもしないので、今年から来年のISUCONに向けて準備するぞ！と思います。1週間以内に過去問でもいいのでISUCONに触って、継続していこうと思います。
