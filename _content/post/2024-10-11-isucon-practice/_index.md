---
type: "post"
title: "ISUCON練習実況ログ 2024/10/10"
draft: false
description: "isunarabe使ってISUCON13の練習をした際のログ"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2024-10-11T07:48:02+09:00"
---

<!-- titleは自動で入る -->
2024/10/10にISUCON13の練習をisunarabeを使って行った時のログを記録する

- 友人と勉強会でやったので時間がなく以下をskip
  - gitの導入とGitHubへのバックアップ
  - ブラウザ動作確認
  - エディタ周りの環境設定
- ファイル編集は何も入れてないvimを使い、コード検索はfindやgrepを使った。

# セットアップ

[isunarabe](https://isunarabe.org/) でISUCON13 v1.0を選択してAWS CloudFormationを使って環境を立てた。

2024/10/10現在、isunarabeのAMIに含まれる証明書が古くベンチマークが失敗する。そのため以下の手順で更新する。

```bash
手元のマシン $ ssh isu1 # EC2の画面から確認したpublic ipに対してsshする。鍵はGitHubに登録しているものを使う
ec2 $ vim update-certs.sh
# --- 以下の内容を書き込む ---
#!/bin/bash

sudo curl -L -s -o /etc/nginx/tls/_.t.isucon.pw.crt https://github.com/KOBA789/t.isucon.pw/releases/latest/download/fullchain.pem
sudo curl -L -s -o /etc/nginx/tls/_.t.isucon.pw.key https://github.com/KOBA789/t.isucon.pw/releases/latest/download/key.pem

sudo chmod 0600 /etc/nginx/tls/_.t.isucon.pw.crt
sudo chmod 0600 /etc/nginx/tls/_.t.isucon.pw.key

sudo systemctl reload nginx
# --- 内容終わり ---
ec2 $ bash update-certs.sh
# これで証明書が更新され、ベンチマークが通るようになる
```

初回ベンチマークは 3183 点

# 計測ツールを入れる

インストール

```bash
cd /usr/bin
curl -L https://github.com/tkuchiki/alp/releases/download/v1.0.21/alp_linux_amd64.tar.gz | sudo tar -xz
sudo apt-get update -y
sudo apt-get install -y percona-toolkit dstat
```

有効化

## htop

元から入っている。htopと打てばOK

## alp

`/etc/nginx/nginx.conf` を編集

```diff
-	access_log /var/log/nginx/access.log;
 	error_log /var/log/nginx/error.log;
 
+	log_format ltsv "time:$time_local"
+                "\thost:$remote_addr"
+                "\tforwardedfor:$http_x_forwarded_for"
+                "\treq:$request"
+                "\tstatus:$status"
+                "\tmethod:$request_method"
+                "\turi:$request_uri"
+                "\tsize:$body_bytes_sent"
+                "\treferer:$http_referer"
+                "\tua:$http_user_agent"
+                "\treqtime:$request_time"
+                "\tcache:$upstream_http_x_cache"
+                "\truntime:$upstream_http_x_runtime"
+                "\tapptime:$upstream_response_time"
+                "\tvhost:$host";
+	access_log /var/log/nginx/access.log ltsv;
```

nginxをリロード

```
sudo nginx -t
sudo systemctl reload nginx
```

# pt-query-digest

`/etc/mysql/mysql.conf.d/mysqld.cnf` を編集

```
[mysqld]
slow_query_log=1
slow_query_log_file=/var/log/mysql/mysql-slow.log
long_query_time=0
```

確認

```
$ sudo mysql
mysql > show variables like 'slow%';

+---------------------+-------------------------------+
| Variable_name       | Value                         |
+---------------------+-------------------------------+
| slow_launch_time    | 2                             |
| slow_query_log      | ON                            |
| slow_query_log_file | /var/log/mysql/mysql-slow.log |
+---------------------+-------------------------------+
3 rows in set (0.01 sec)
```

ONになっていてよさそう

`/var/log/mysql/mysql-slow.log` にログがある

これで pt-query-digest や alp が使えるようになった。pprofはまだ使い方が分からず入れてない。

# `livestream_tags` へのインデックス

htopをみると以下のようになった。DBが重い。

- DB: mysqld 140%
- APP: isupipe 30%
- 水責め: pdns_server 10%

pt-query-digestをみる。

ベンチ回した後に末尾1000行を取得

```bash
$ mkdir ~/result
$ cd ~/result
$ sudo tail -n 1000 /var/log/mysql/mysql-slow.log > ./slow-1.log
$ pt-query-digest ./slow-1.log
```

pt-query-digestの結果

```
#    1 0xF7144185D9A142A426A36DC... 119.4592 26.4%   5143 0.0232  0.01 SELECT livestream_tags
#    2 0x84B457C910C4A79FC9EBECB...  56.6751 12.5%   9354 0.0061  0.01 SELECT icons
#    3 0xDA556F9115773A1A99AA016...  45.7546 10.1% 125402 0.0004  0.00 ADMIN PREPARE
```

重いやつ

```
SELECT * FROM livestream_tags WHERE livestream_id = 7524\G
```

mysqlでEXPLAINする

```
mysql> EXPLAIN SELECT * FROM livestream_tags WHERE livestream_id = 7524;
+----+-------------+-----------------+------------+------+---------------+------+---------+------+-------+----------+-------------+
| id | select_type | table           | partitions | type | possible_keys | key  | key_len | ref  | rows  | filtered | Extra       |
+----+-------------+-----------------+------------+------+---------------+------+---------+------+-------+----------+-------------+
|  1 | SIMPLE      | livestream_tags | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 11017 |    10.00 | Using where |
+----+-------------+-----------------+------------+------+---------------+------+---------+------+-------+----------+-------------+
1 row in set, 1 warning (0.00 sec)
```

rowsが11017で、`livestream_tags` の数をみると、だいたい同じ数

```
mysql> SELECT COUNT(*) FROM livestream_tags;
+----------+
| COUNT(*) |
+----------+
|    11343 |
+----------+
1 row in set (0.00 sec)
```

というわけで `livestream_id` にインデックスを貼る

```
mysql> SHOW INDEX FROM livestream_tags; # インデックスがないことを確認
mysql> desc livestream_tags; # スキーマ確認
+---------------+--------+------+-----+---------+----------------+
| Field         | Type   | Null | Key | Default | Extra          |
+---------------+--------+------+-----+---------+----------------+
| id            | bigint | NO   | PRI | NULL    | auto_increment |
| livestream_id | bigint | NO   |     | NULL    |                |
| tag_id        | bigint | NO   |     | NULL    |                |
+---------------+--------+------+-----+---------+----------------+
3 rows in set (0.00 sec)
mysql> ALTER TABLE livestream_tags ADD INDEX livestream_idx(livestream_id); # インデックス貼った
```

ベンチ回してみたらボトルネックが移動した。

# reaction改善

DBがまだ重いのでpt-query-digestを見る

```
#    1 0xDB74D52D39A7090F224C4DEEAF3...  0.0977 47.2%     1 0.0977  0.00 SELECT users livestreams reactions
#    2 0x84B457C910C4A79FC9EBECB8B10...  0.0458 22.1%     2 0.0229  0.00 SELECT icons
#    3 0xDA556F9115773A1A99AA0165670...  0.0184  8.9%    26 0.0007  0.01 ADMIN PREPARE
```

対象クエリ

```sql
SELECT COUNT(*) FROM users u
        INNER JOIN livestreams l ON l.user_id = u.id
        INNER JOIN reactions r ON r.livestream_id = l.id
        WHERE u.id = 242\G
```

クエリは SELECT COUNT... みたいな感じだったので、コード検索

```bash
find ./ -type f -print | xargs grep -A 3 -B 3 "COUNT"
```

スキーマを見ると、以下のようになっている

```
mysql> desc users;
+--------------+--------------+------+-----+---------+----------------+
| Field        | Type         | Null | Key | Default | Extra          |
+--------------+--------------+------+-----+---------+----------------+
| id           | bigint       | NO   | PRI | NULL    | auto_increment |
| name         | varchar(255) | NO   | UNI | NULL    |                |
| display_name | varchar(255) | NO   |     | NULL    |                |
| password     | varchar(255) | NO   |     | NULL    |                |
| description  | text         | NO   |     | NULL    |                |
+--------------+--------------+------+-----+---------+----------------+
5 rows in set (0.00 sec)

mysql> desc livestreams;
+---------------+--------------+------+-----+---------+----------------+
| Field         | Type         | Null | Key | Default | Extra          |
+---------------+--------------+------+-----+---------+----------------+
| id            | bigint       | NO   | PRI | NULL    | auto_increment |
| user_id       | bigint       | NO   |     | NULL    |                |
| title         | varchar(255) | NO   |     | NULL    |                |
| description   | text         | NO   |     | NULL    |                |
| playlist_url  | varchar(255) | NO   |     | NULL    |                |
| thumbnail_url | varchar(255) | NO   |     | NULL    |                |
| start_at      | bigint       | NO   |     | NULL    |                |
| end_at        | bigint       | NO   |     | NULL    |                |
+---------------+--------------+------+-----+---------+----------------+
8 rows in set (0.00 sec)

mysql> desc reactions;
+---------------+--------------+------+-----+---------+----------------+
| Field         | Type         | Null | Key | Default | Extra          |
+---------------+--------------+------+-----+---------+----------------+
| id            | bigint       | NO   | PRI | NULL    | auto_increment |
| user_id       | bigint       | NO   |     | NULL    |                |
| livestream_id | bigint       | NO   |     | NULL    |                |
| emoji_name    | varchar(255) | NO   |     | NULL    |                |
| created_at    | bigint       | NO   |     | NULL    |                |
+---------------+--------------+------+-----+---------+----------------+
5 rows in set (0.00 sec)
```

userに紐づくlivestreamを全部撮ってきて、それぞれに紐づくreactionの数を数えている。user idは固定値として与えられるので、usersを連結させる必要がない。
以下のように書き換えられる。

```sql
SELECT COUNT(*) FROM livestreams l
        INNER JOIN reactions r ON r.livestream_id = l.id
        WHERE l.user_id = ?
```

ベンチ回してみたらボトルネックが移動した。

# iconsをDBから静的ファイルとして返す

まだDBが重い

```
#    1 0x84B457C910C4A79FC9EBECB8B10...  0.0425 44.6%     4 0.0106  0.00 SELECT icons
#    2 0xDA556F9115773A1A99AA0165670...  0.0147 15.5%    22 0.0007  0.00 ADMIN PREPARE
#    3 0xFFFCA4D67EA0A788813031B8BBC...  0.0084  8.8%     1 0.0084  0.00 COMMIT
```

対象クエリ

```sql
SELECT image FROM icons WHERE user_id = 1049\G
```

iconsのスキーマ

```
mysql> desc icons;
+---------+----------+------+-----+---------+----------------+
| Field   | Type     | Null | Key | Default | Extra          |
+---------+----------+------+-----+---------+----------------+
| id      | bigint   | NO   | PRI | NULL    | auto_increment |
| user_id | bigint   | NO   |     | NULL    |                |
| image   | longblob | NO   |     | NULL    |                |
+---------+----------+------+-----+---------+----------------+
3 rows in set (0.00 sec)
```

longblobで画像がそのままDBに入っている。

iconsに関わるところを抜き出す

```
isucon@ip-192-168-0-11:~/webapp/go$ find ./ -type f -print | xargs grep -A 3 -B 3 " icons"
./user_handler.go-    }
./user_handler.go-
./user_handler.go-    var image []byte
./user_handler.go:    if err := tx.GetContext(ctx, &image, "SELECT image FROM icons WHERE user_id = ?", user.ID); err != nil {
./user_handler.go-        if errors.Is(err, sql.ErrNoRows) {
./user_handler.go-            return c.File(fallbackImage)
./user_handler.go-        } else {
--
./user_handler.go-    }
./user_handler.go-    defer tx.Rollback()
./user_handler.go-
./user_handler.go:    if _, err := tx.ExecContext(ctx, "DELETE FROM icons WHERE user_id = ?", userID); err != nil {
./user_handler.go-        return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete old user icon: "+err.Error())
./user_handler.go-    }
./user_handler.go-
./user_handler.go:    rs, err := tx.ExecContext(ctx, "INSERT INTO icons (user_id, image) VALUES (?, ?)", userID, req.Image)
./user_handler.go-    if err != nil {
./user_handler.go-        return echo.NewHTTPError(http.StatusInternalServerError, "failed to insert new user icon: "+err.Error())
./user_handler.go-    }
--
./user_handler.go-    }
./user_handler.go-
./user_handler.go-    var image []byte
./user_handler.go:    if err := tx.GetContext(ctx, &image, "SELECT image FROM icons WHERE user_id = ?", userModel.ID); err != nil {
./user_handler.go-        if !errors.Is(err, sql.ErrNoRows) {
./user_handler.go-            return User{}, err
./user_handler.go-        }
grep: ./isupipe: binary file matches
```

GETが2件、DELETEとINSERTが1件ずつある。
`c.File(fallbackImage)` みたいに返したい。

GETについては以下のようにした

```go
image_path := fmt.Sprintf("../icons/%s.jpg", user.ID)
if _, err := os.Stat(image_path); err != nil {
    return c.File(fallbackImage)
} else {
    return c.File(image_path)
}
```

```go
image_path := fmt.Sprintf("../icons/%d.jpg", userModel.ID)
if _, err := os.Stat(image_path); err != nil {
    return User{}, err
}
image, err := os.ReadFile(image_path)
```

みたいなコードを書いた(後にuser.IDがint64なことに気づき `%d.jpg` に修正)

DELETE, INSERTの時はlastInsertIdが必要だったので、以下のようなコードを書いた(記録がなくてうろ覚え)

```go
var user_id int64 = 0 // globalに宣言

// DELETE, INSERT
image_path := fmt.Sprintf("../icons/%d.jpg", userID)
var f *os.File
if _, err := os.Stat(image_path); err == nil {
  f, err = os.Open(image_path)
  if err != nil {
    return echo.NewHTTPError(http.StatusInternalServerError, "failed to open user icon: "+err.Error())
  }
} else {
  f, err = os.Create(image_path)
  if err != nil {
    return echo.NewHTTPError(http.StatusInternalServerError, "failed to create user icon: "+err.Error())
  }
}
_, err = f.Write(req.Image)
if err != nil {
  return echo.NewHTTPError(http.StatusInternalServerError, "failed to write user icon: "+err.Error())
}
user_id++
```


iconsディレクトリを作ってベンチ

これでDB 120%、APP 45%になった。
まだDBが重いが、ボトルネックが移動した。

# 初期化失敗

`icons/*` を消す処理をinitializeに追加

```bash
rm /home/isucon/webapp/icons/*
```

整合性チェック通るようになった。

# `ng_words` にインデックス

```
#    1 0x64CC8A4E8E4B390203375597CE4...  0.0388 42.0%     1 0.0388  0.00 SELECT ng_words
#    2 0xDA556F9115773A1A99AA0165670...  0.0109 11.9%    30 0.0004  0.00 ADMIN PREPARE
#    3 0xFFFCA4D67EA0A788813031B8BBC...  0.0091  9.9%     3 0.0030  0.00 COMMIT
```

```
SELECT id, user_id, livestream_id, word FROM ng_words WHERE user_id = 1088 AND livestream_id = 7555\G
```

EXPLAINの結果、 `user_id` にとりあえずインデックスを貼ることにした(本当は `livestream_id` もインデックス貼った方がいいけど、一旦1つだけの変更を入れることに)

ボトルネックが移動した

# ADMIN PREPARE

```
#    1 0xDA556F9115773A1A99AA0165670...  0.0161 30.0%    28 0.0006  0.00 ADMIN PREPARE
#    2 0x38BC86A45F31C6B1EE324671506...  0.0084 15.7%     4 0.0021  0.00 SELECT themes
```

よく分からんが検索したら以下の記事を見つけた

[ISUCON10予選で12位になり本選進出を決めました - Gマイナー志向](https://matsuu.hatenablog.com/entry/2020/09/13/131145)

`main.go` をいじる

```go
        conf.DBName = "isupipe"
        conf.ParseTime = true
        conf.InterpolateParams = true // 追加
```

この改善で スコア: 7871
ボトルネックが移動


# `reservation_slots` にインデックス

```
#    1 0x7F9C0C0BA9473953B723EE16C08...  0.0845 39.3%     1 0.0845  0.00 SELECT reservation_slots
#    2 0xC3F9945902750E1ADB88136F895...  0.0569 26.5%     2 0.0284  0.00 SELECT livestreams reactions
#    3 0xF1B8EF06D6CA63B24BFF433E06C...  0.0168  7.8%     2 0.0084  0.00 SELECT users livestreams livecomments
```

クエリ

```
SELECT * FROM reservation_slots WHERE start_at >= 1701648000 AND end_at <= 1701651600 FOR UPDATE\G
```

start_at, end_at にインデックスを貼る

スコア: 8607
ボトルネックが移動

# livecomments のクエリ改善

```
#    1 0xF1B8EF06D6CA63B24BFF433E06C...  0.0926 42.9%     3 0.0309  0.02 SELECT users livestreams livecomments
#    2 0xC3F9945902750E1ADB88136F895...  0.0417 19.3%     3 0.0139  0.00 SELECT livestreams reactions
#    3 0xFFFCA4D67EA0A788813031B8BBC...  0.0274 12.7%     3 0.0091  0.00 COMMIT
```

クエリ

```
SELECT IFNULL(SUM(l2.tip), 0) FROM users u
        INNER JOIN livestreams l ON l.user_id = u.id
        INNER JOIN livecomments l2 ON l2.livestream_id = l.id
        WHERE u.id = 111\G
```

これもよく見るとusersがいらない。以下のように書き換える

```
SELECT IFNULL(SUM(l2.tip), 0) FROM livestreams l
        INNER JOIN livecomments l2 ON l2.livestream_id = l.id
        WHERE l.user_id = ?
```

ボトルネックが移動
スコア 8558

# `livestream_id` インデックス

以下の2つが25%ずつで重い。まだDBが重いけど、正直alpとか他のやつ見た方がいい気もしてくる。どこでDBから離れるべきか分からない...

```
SELECT IFNULL(SUM(l2.tip), 0) FROM livestreams l
        INNER JOIN livecomments l2 ON l2.livestream_id = l.id
        WHERE l.user_id = 109\G
```

```
SELECT COUNT(*) FROM livestreams l
        INNER JOIN reactions r ON r.livestream_id = l.id
        WHERE l.user_id = 76\G
```

よく見ると、 `l2` や `r` にインデックスが貼られてない。

livecommentsの方

```
mysql> show index from livecomments
    -> ;
+--------------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| Table        | Non_unique | Key_name | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Visible | Expression |
+--------------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| livecomments |          0 | PRIMARY  |            1 | id          | A         |        1520 |     NULL |   NULL |      | BTREE      |         |               | YES     | NULL       |
+--------------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
1 row in set (0.01 sec)
```

`alter table livecomments add index livestream_id_idx(livestream_id);`
を入れたらボトルネックが移動

`alter table reactions add index livestream_id_idx(livestream_id);`
でreactionも対応

ここでスコアが10000を超えた。ボトルネックが移動

# themeにインデックス

```
#    1 0x38BC86A45F31C6B1EE324671506...  0.0361 28.6%    10 0.0036  0.00 SELECT themes
#    2 0xF7144185D9A142A426A36DC55C1...  0.0189 15.0%     6 0.0032  0.00 SELECT livestream_tags
#    3 0x4ADE2DC90689F1C4891749AF54F...  0.0142 11.3%    11 0.0013  0.00 DELETE SELECT livecomments
```

```
SELECT * FROM themes WHERE user_id = 1135\G
```

`user_id` にインデックスを貼る

ボトルネックが移動

# 切り上げる

```
#    1 0x4ADE2DC90689F1C4891749AF54F...  0.0298 51.4%    41 0.0007  0.00 DELETE SELECT livecomments
#    2 0xFD38427AE3D09E3883A680F7BAF...  0.0100 17.2%    17 0.0006  0.00 SELECT livestreams livecomments
#    3 0xC499D81D570D361DB61FC43A94B...  0.0084 14.4%    16 0.0005  0.00 SELECT livestreams reactions
```

```
DELETE FROM livecomments
            WHERE
            id = 551 AND
            livestream_id = 7626 AND
            (SELECT COUNT(*)
            FROM
            (SELECT '***' AS text) AS texts
            INNER JOIN
            (SELECT CONCAT('%', '***', '%')    AS pattern) AS patterns
            ON texts.text LIKE patterns.pattern) >= 1\G
```

厳ついクエリ

```go
        // NGワードにヒットする過去の投稿も全削除する
        for _, ngword := range ngwords {
                // ライブコメント一覧取得
                var livecomments []*LivecommentModel
                if err := tx.SelectContext(ctx, &livecomments, "SELECT * FROM livecomments"); err != nil {
                        return echo.NewHTTPError(http.StatusInternalServerError, "failed to get livecomments: "+err.Error())
                }

                for _, livecomment := range livecomments {
                        query := `
                        DELETE FROM livecomments
                        WHERE
                        id = ? AND
                        livestream_id = ? AND
                        (SELECT COUNT(*)
                        FROM
                        (SELECT ? AS text) AS texts
                        INNER JOIN
                        (SELECT CONCAT('%', ?, '%')     AS pattern) AS patterns
                        ON texts.text LIKE patterns.pattern) >= 1;
                        `
                        if _, err := tx.ExecContext(ctx, query, livecomment.ID, livestreamID, livecomment.Comment, ngword.Word); err != nil {
                                return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete old livecomments that hit spams: "+err.Error())
                        }
                }
        }
```

ここの箇所だと分かったけどここまでで切り上げた。

スコア: 12173

# まとめ

- DBがどれくらい下がったらpt-query-digestから離れていいんだろうか。分からん
- 去年のISUCONではメンバーが強くて何してるか分からんけどスコアが上がっていくという状態だったので、なかなかそのスコア(11000点くらい)を超えられず困っていた。でも今回は超えられて嬉しい(友人と一緒にやってはいるが、全部の改善点を理解している点で成長した)
- インデックス貼るの慣れてきた。次の手札が欲しい。
- コードがっつり改善とか、複数台構成とか、まだやれてない
