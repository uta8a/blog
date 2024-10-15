---
type: "post"
title: "ISUCON練習実況ログ 2024/10/13"
draft: false
description: "スコア 11540"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2024-10-14T19:11:13+09:00"
---

<!-- titleは自動で入る -->
2024/10/13にISUCON13の練習をisunarabeを使って行った時のログです。
参考: [前回のログ](https://blog.uta8a.net/post/2024-10-11-isucon-practice)

- VS Code Remote SSHを使用
  - 拡張機能としてGoの拡張機能を入れた

# セットアップ

- [isunarabe](https://isunarabe.org/) ISUCON13 v1.0を選択
- AWS CloudFormationで環境を立てた。
- `update-certs.sh` を流して証明書更新

20:13 初回ベンチ 2353

# 計測セットアップ

alp, pt-query-digest, dstatを入れた。htopは元々入っていた。

pt-query-digest のためのスロークエリ有効化で、 `/etc/mysql/mysql.conf.d/mysqld.cnf` を編集しても以下のように反映されてなかった。`slow_query_log` が `OFF` のままになっている。

```
mysql> show variables like 'slow%';
+---------------------+-----------------------------------------+
| Variable_name       | Value                                   |
+---------------------+-----------------------------------------+
| slow_launch_time    | 2                                       |
| slow_query_log      | OFF                                     |
| slow_query_log_file | /var/lib/mysql/ip-192-168-0-11-slow.log |
+---------------------+-----------------------------------------+
3 rows in set (0.01 sec)

mysql> ^DBye
```

mysqlを `systemctl restart mysql` で再起動したら反映された

```
mysql> show variables like 'slow%';
+---------------------+-------------------------------+
| Variable_name       | Value                         |
+---------------------+-------------------------------+
| slow_launch_time    | 2                             |
| slow_query_log      | ON                            |
| slow_query_log_file | /var/log/mysql/mysql-slow.log |
+---------------------+-------------------------------+
3 rows in set (0.00 sec)
```

計測セットアップ完了

# ログ周り

前回はログの後ろ1000行を取得していたが、そもそも一回のベンチでログはどのくらい追記されるのだろう？

以下の手順でログを出すことにした。

1: ベンチ回す直前にログの長さを確認

```sh
$ sudo cat /var/log/nginx/access.log | wc -l
2748
$ sudo cat /var/log/mysql/mysql-slow.log | wc -l
24
```

2: ベンチを回す

3: ベンチを回した直後にログの長さを確認

```sh
$ sudo cat /var/log/nginx/access.log | wc -l
6415
$ sudo cat /var/log/mysql/mysql-slow.log | wc -l
3010185
```

4: 引き算して、増えた行数だけ `tail -n` で取得して別ファイルに書き出す

```sh
# /home/isucon/result/ にログを貯める運用
sudo tail -n 3010161 /var/log/mysql/mysql-slow.log > ./slow-1.log
sudo tail -n 3667 /var/log/nginx/access.log > ./access-1.log
```

これでalpやpt-query-digestの解析に `slow-N.log` や `access-N.log` を渡せば良い。

# `livestream_tags` にインデックスを貼る

htopの様子 DB 150%, APP 25%, pdns server 15% なので、DBをまずは軽くする。

```
#    1 0xF7144185D9A142A426A36DC... 137.0045 29.1%   5610 0.0244  0.01 SELECT livestream_tags
#    2 0x84B457C910C4A79FC9EBECB...  64.6100 13.7%   9896 0.0065  0.01 SELECT icons
#    3 0xDA556F9115773A1A99AA016...  38.1828  8.1% 117016 0.0003  0.01 ADMIN PREPARE
#    4 0xF1B8EF06D6CA63B24BFF433...  26.7850  5.7%   2953 0.0091  0.02 SELECT users livestreams livecomments
```

1番重いクエリ

```sql
SELECT * FROM livestream_tags WHERE livestream_id = 7528\G
```

EXPLAINの結果、rowsが11012と多いのでインデックスを貼る。

```
mysql> EXPLAIN SELECT * FROM livestream_tags WHERE livestream_id = 7528;
+----+-------------+-----------------+------------+------+---------------+------+---------+------+-------+----------+-------------+
| id | select_type | table           | partitions | type | possible_keys | key  | key_len | ref  | rows  | filtered | Extra       |
+----+-------------+-----------------+------------+------+---------------+------+---------+------+-------+----------+-------------+
|  1 | SIMPLE      | livestream_tags | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 11012 |    10.00 | Using where |
+----+-------------+-----------------+------------+------+---------------+------+---------+------+-------+----------+-------------+
1 row in set, 1 warning (0.00 sec)
```

```sql
ALTER TABLE livestream_tags ADD INDEX livestream_id_idx(livestream_id);
```

インデックスが貼られたことを確認

```
mysql> SHOW INDEX FROM livestream_tags;
+-----------------+------------+-------------------+--------------+---------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| Table           | Non_unique | Key_name          | Seq_in_index | Column_name   | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Visible | Expression |
+-----------------+------------+-------------------+--------------+---------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| livestream_tags |          0 | PRIMARY           |            1 | id            | A         |       10640 |     NULL |   NULL |      | BTREE      |         |               | YES     | NULL       |
| livestream_tags |          1 | livestream_id_idx |            1 | livestream_id | A         |        7390 |     NULL |   NULL |      | BTREE      |         |               | YES     | NULL       |
+-----------------+------------+-------------------+--------------+---------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
2 rows in set (0.00 sec)
```

20:48 スコア 3768

# `icons` を軽くする

ここでGoのVS Code拡張機能を入れた。(Remote SSHなので、向こうのサーバにLSPが入った)

htopでまだDBが重い

```
#    1 0x84B457C910C4A79FC9EBECB... 79.1512 20.3%  12425 0.0064  0.01 SELECT icons
#    2 0xDA556F9115773A1A99AA016... 50.8827 13.1% 147232 0.0003  0.00 ADMIN PREPARE
#    3 0xF1B8EF06D6CA63B24BFF433... 32.2053  8.3%   3043 0.0106  0.02 SELECT users livestreams livecomments
```

1番重いクエリ

```sql
SELECT image FROM icons WHERE user_id = 1021\G
```

`icons` には画像がlongblobで入っているので、これを静的に返す。

ここで `/` で `git init` している影響で `make build` が失敗することに気づく

```sh
isucon@ip-192-168-0-11:~/webapp/go$ make build
CGO_ENABLED=0 GOOS=linux GOARCH=amd64  go build -o ./isupipe -ldflags "-s -w"
error obtaining VCS status: exit status 128
        Use -buildvcs=false to disable VCS stamping.
make: *** [Makefile:16: build] Error 1
```

`BUILD=go build -buildvcs=false` のようにMakefileを修正したらビルドできた

修正内容: `user_handler.go`

グローバルでlast inserted id相当のものを保持

```go
var user_id int64 = 0
```

`c.File` で画像を返す

```go
	image_path := fmt.Sprintf("../icons/%d.jpg", user.ID)
	if _, err := os.Stat(image_path); err != nil {
		return c.File(fallbackImage)
	} else {
		return c.File(image_path)
  }
```

DELETEは無視してファイルの上書きで代替する

```go
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
```

`os.ReadFile` でiconHashに渡す

```go
  var err error
	image_path := fmt.Sprintf("../icons/%d.jpg", userModel.ID)
	if _, err := os.Stat(image_path); err != nil {
		image, err = os.ReadFile(fallbackImage)
	} else {
		image, err = os.ReadFile(image_path)
	}
	if err != nil {
		return User{}, err
  }
  iconHash := sha256.Sum256(image)
```

21:11 スコア 6567
結構バグらせてしまった。

# `ADMIN PREPARE` を軽くする

このあたりで行数を出すスクリプトを `/home/isucon/count-log-lines.sh` に作った。正直ログの末尾を出す作業を自動化したい。

```sh
#!/bin/bash
sudo cat /var/log/nginx/access.log | wc -l
sudo cat /var/log/mysql/mysql-slow.log | wc -l
```

htopでまだDBが重い

```
#    1 0xDA556F9115773A1A99AA016... 52.1469 16.4% 164209 0.0003  0.00 ADMIN PREPARE
#    2 0x38BC86A45F31C6B1EE32467... 36.1570 11.4%  15278 0.0024  0.00 SELECT themes
#    3 0xF1B8EF06D6CA63B24BFF433... 24.9528  7.9%   3558 0.0070  0.01 SELECT users livestreams livecomments
```

1番重いクエリ

```sql
administrator command: Prepare\G
```

`main.go` で以下の修正

```
conf.InterpolateParams = true
```

21:21 スコア 7189

# `themes` にインデックスを貼る

htopでまだDBが重い

```
#    1 0x38BC86A45F31C6B1EE324671... 52.3956 14.6% 19449 0.0027  0.00 SELECT themes
#    2 0x4ADE2DC90689F1C4891749AF... 39.3800 11.0% 45807 0.0009  0.00 DELETE SELECT livecomments
#    3 0xF1B8EF06D6CA63B24BFF433E... 32.7476  9.2%  3763 0.0087  0.02 SELECT users livestreams livecomments
```

1番重いクエリ

```sql
SELECT * FROM themes WHERE user_id = 1039\G
```

```
mysql> EXPLAIN SELECT * FROM themes WHERE user_id = 1039;
+----+-------------+--------+------------+------+---------------+------+---------+------+------+----------+-------------+
| id | select_type | table  | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra       |
+----+-------------+--------+------------+------+---------------+------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | themes | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 1403 |    10.00 | Using where |
+----+-------------+--------+------------+------+---------------+------+---------+------+------+----------+-------------+
1 row in set, 1 warning (0.00 sec)
```

rowsが1403

```
mysql> SHOW INDEX FROM themes;
+--------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| Table  | Non_unique | Key_name | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Visible | Expression |
+--------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| themes |          0 | PRIMARY  |            1 | id          | A         |        1403 |     NULL |   NULL |      | BTREE      |         |               | YES     | NULL       |
+--------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
1 row in set (0.00 sec)
```

`user_id` にインデックスはなし

```sql
mysql> ALTER TABLE themes ADD INDEX user_id_idx(user_id);
Query OK, 0 rows affected (0.03 sec)
Records: 0  Duplicates: 0  Warnings: 0
```

確認

```
mysql> SHOW INDEX FROM themes;
+--------+------------+-------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| Table  | Non_unique | Key_name    | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Visible | Expression |
+--------+------------+-------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| themes |          0 | PRIMARY     |            1 | id          | A         |        1403 |     NULL |   NULL |      | BTREE      |         |               | YES     | NULL       |
| themes |          1 | user_id_idx |            1 | user_id     | A         |        1403 |     NULL |   NULL |      | BTREE      |         |               | YES     | NULL       |
+--------+------------+-------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
2 rows in set (0.00 sec)
```

21:27 スコア 7917

# `DELETE FROM livecomments` を軽くする

htopでまだDBが重い

```
#    1 0x4ADE2DC90689F1C4891749AF... 39.1518 11.2% 47709 0.0008  0.00 DELETE SELECT livecomments
#    2 0xF1B8EF06D6CA63B24BFF433E... 38.1143 10.9%  3886 0.0098  0.02 SELECT users livestreams livecomments
#    3 0xDB74D52D39A7090F224C4DEE... 37.0023 10.6%  3888 0.0095  0.02 SELECT users livestreams reactions
```

1番重いクエリ

```sql
DELETE FROM livecomments
			WHERE
			id = 517 AND
			livestream_id = 7532 AND
			(SELECT COUNT(*)
			FROM
			(SELECT '次の周年も一緒に祝いたい' AS text) AS texts
			INNER JOIN
			(SELECT CONCAT('%', '意識深層視', '%')	AS pattern) AS patterns
			ON texts.text LIKE patterns.pattern) >= 1\G
```

```sql
// EXPLAINするなら
select * from  livecomments
			WHERE
			id = 517 AND
			livestream_id = 7532 AND
			(SELECT COUNT(*)
			FROM
			(SELECT '次の周年も一緒に祝いたい' AS text) AS texts
			INNER JOIN
			(SELECT CONCAT('%', '意識深層視', '%')	AS pattern) AS patterns
			ON texts.text LIKE patterns.pattern) >= 1\G
```

rowsの数を見たい

```
mysql> EXPLAIN select * from  livecomments WHERE id = 517 AND livestream_id = 7532 AND (SELECT COUNT(*) FROM (SELECT '次の周年も一緒に祝いたい' AS text) AS texts INNER JOIN (SELECT CONCAT('%', '意識深層視', '%')AS pattern) AS patterns ON texts.text LIKE patterns.pattern) >= 1;
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-----------------------------------------------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra                                               |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-----------------------------------------------------+
|  1 | PRIMARY     | NULL  | NULL       | NULL | NULL          | NULL | NULL    | NULL | NULL |     NULL | Impossible WHERE                                    |
|  2 | SUBQUERY    | NULL  | NULL       | NULL | NULL          | NULL | NULL    | NULL | NULL |     NULL | Impossible WHERE noticed after reading const tables |
|  4 | DERIVED     | NULL  | NULL       | NULL | NULL          | NULL | NULL    | NULL | NULL |     NULL | No tables used                                      |
|  3 | DERIVED     | NULL  | NULL       | NULL | NULL          | NULL | NULL    | NULL | NULL |     NULL | No tables used                                      |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-----------------------------------------------------+
4 rows in set, 1 warning (0.00 sec)
```

よく分からない感じになっている

クエリもよく分からないので、以下のように部分を実行したりしてた

```
mysql> SELECT '次の周年も一緒に祝いたい' AS text;
+--------------------------------------+
| text                                 |
+--------------------------------------+
| 次の周年も一緒に祝いたい             |
+--------------------------------------+
1 row in set (0.00 sec)
```

コードを読む

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
			(SELECT CONCAT('%', ?, '%')	AS pattern) AS patterns
			ON texts.text LIKE patterns.pattern) >= 1;
			`
			if _, err := tx.ExecContext(ctx, query, livecomment.ID, livestreamID, livecomment.Comment, ngword.Word); err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete old livecomments that hit spams: "+err.Error())
			}
		}
	}
```

以下の処理をしてそう

- NGワードのリストをforで回す
- `livecomments` を全件取得
- それぞれのライブコメントに対して、コメントにngwordが含まれていたら削除

これは以下で同じことができる

```go
  for _, ngword := range ngwords {
    query := `
		DELETE FROM livecomments
    livestream_id = ? AND
    comment LIKE CONCAT('%', ?, '%')
		`
		if _, err := tx.ExecContext(ctx, query, livestreamID, ngword.Word); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete old livecomments that hit spams: "+err.Error())
    }
  }
```

結局入力は `ngword` と `livestream_id` だけでよく、あとはlivecommentsがヒットしたら消せば良い

21:53 スコア 7759

# `SELECT FROM ng_words` を軽くする

DB 100, APP 50くらいになってきた

```
#    1 0x64CC8A4E8E4B390203375597... 33.2685  9.5%   635 0.0524  0.01 SELECT ng_words
#    2 0xF1B8EF06D6CA63B24BFF433E... 33.1687  9.5%  3504 0.0095  0.02 SELECT users livestreams livecomments
#    3 0xDB74D52D39A7090F224C4DEE... 31.4546  9.0%  3507 0.0090  0.02 SELECT users livestreams reactions
```

1番重いクエリ

```sql
SELECT id, user_id, livestream_id, word FROM ng_words WHERE user_id = 1013 AND livestream_id = 7524\G
```

インデックスは `id`, `word` に貼られている。

```
mysql> SHOW INDEX FROM ng_words;
+----------+------------+---------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| Table    | Non_unique | Key_name      | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Visible | Expression |
+----------+------------+---------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| ng_words |          0 | PRIMARY       |            1 | id          | A         |       14488 |     NULL |   NULL |      | BTREE      |         |               | YES     | NULL       |
| ng_words |          1 | ng_words_word |            1 | word        | A         |       13690 |     NULL |   NULL |      | BTREE      |         |               | YES     | NULL       |
+----------+------------+---------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
2 rows in set (0.00 sec)
```

`livestream_id` と `user_id` にインデックスを貼る

```sql
ALTER TABLE ng_words ADD INDEX user_id_idx(user_id);
ALTER TABLE ng_words ADD INDEX livestream_id_idx(livestream_id);
```

22:01 スコア 8606

# `SELECT FROM users, livestreams, livecomments` を軽くする

```
#    1 0xF1B8EF06D6CA63B24BFF433E... 46.2941 14.0%  4030 0.0115  0.02 SELECT users livestreams livecomments
#    2 0xDB74D52D39A7090F224C4DEE... 40.8759 12.3%  4035 0.0101  0.02 SELECT users livestreams reactions
#    3 0xFBC5564AE716EAE82F20BFB4... 29.1511  8.8% 82637 0.0004  0.00 SELECT tags
```

1番重いクエリ

```sql
SELECT IFNULL(SUM(l2.tip), 0) FROM users u
		INNER JOIN livestreams l ON l.user_id = u.id	
		INNER JOIN livecomments l2 ON l2.livestream_id = l.id
		WHERE u.id = 45\G
```

usersが消せる

```sql
query := `
SELECT IFNULL(SUM(l2.tip), 0) FROM livestreams l
INNER JOIN livecomments l2 ON l2.livestream_id = l.id
WHERE l.user_id = ?`
```

22:08 スコア 7910
DB 100, APP 50でDBが下がらない

# まだ `SELECT FROM livestream, livecomments` が重い

```
SELECT IFNULL(SUM(l2.tip), 0) FROM livestreams l
		INNER JOIN livecomments l2 ON l2.livestream_id = l.id
		WHERE l.user_id = 368\G
```

さっき改善したとこが重い
インデックスのせいだった

```
ALTER TABLE livecomments ADD INDEX livestream_id_idx(livestream_id);
ALTER TABLE livestreams ADD INDEX user_id_idx(user_id);
```

22:24 スコア 8172

# `SELECT FROM users, livestreams, reactions` を軽くする

```
#    1 0xDB74D52D39A7090F224C4DEE... 67.0881 24.0%  5851 0.0115  0.01 SELECT users livestreams reactions
#    2 0xFBC5564AE716EAE82F20BFB4... 28.6523 10.2% 93486 0.0003  0.00 SELECT tags
#    3 0x59F1B6DD8D9FEC059E55B3BF... 23.6685  8.5%  1078 0.0220  0.01 SELECT reservation_slots
```

1番重いクエリ

```sql
SELECT COUNT(*) FROM users u
		INNER JOIN livestreams l ON l.user_id = u.id
		INNER JOIN reactions r ON r.livestream_id = l.id
		WHERE u.id = 94\G
```

さっきと似た構造で、usersを消してインデックスを貼ればOK

22:44 スコア 9952

DB 90, APP 60 くらいになってきた

# `tags` をインメモリにする

```
#    1 0xFBC5564AE716EAE82F20BFB... 26.0775 12.5% 100075 0.0003  0.00 SELECT tags
#    2 0xFFFCA4D67EA0A788813031B... 22.4545 10.8%   5370 0.0042  0.01 COMMIT
#    3 0x59F1B6DD8D9FEC059E55B3B... 20.6600  9.9%   1262 0.0164  0.01 SELECT reservation_slots
```

```
SELECT * FROM tags WHERE id = 44\G
```

idだからインデックスは貼られているはず

```
mysql> EXPLAIN SELECT * FROM tags WHERE id = 44;
+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
| id | select_type | table | partitions | type  | possible_keys | key     | key_len | ref   | rows | filtered | Extra |
+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | tags  | NULL       | const | PRIMARY       | PRIMARY | 8       | const |    1 |   100.00 | NULL  |
+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
1 row in set, 1 warning (0.00 sec)
```

rowsも1になっているので不思議なところはない。ただ、calls 100075 なのでめちゃ呼び出されてる？

`tags` テーブルを眺めていると、SQLのスキーマ定義の方に `-- ライブストリームに付与される、サービスで定義されたタグ` とあるので、更新されないのではと考えた。実際tagsを含むSQLクエリはどれもSELECTのみで、INSERTはない。

ということは、インメモリで持っておけば高速になる？

と考えて、mapに詰めることにした。以下のようにinitialize時にmapに詰め込んで、

```go
var tagMap map[int64]string = make(map[int64]string)

// initialize 関数
	ctx := c.Request().Context()
	tx, err := dbConn.BeginTxx(ctx, nil)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to initialize: "+err.Error())
	}
	var tagModels []*TagModel
	if err := tx.SelectContext(ctx, &tagModels, "SELECT * FROM tags"); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to initialize: "+err.Error())
	}
	for _, tagModel := range tagModels {
		tagMap[tagModel.ID] = tagModel.Name
	}
```

mapから引き出して使う (`SELECT * FROM tags WHERE id = ?` を代替)

```go
    if _, ok := tagMap[livestreamTagModels[i].TagID]; !ok {
			return Livestream{}, err
		}

    tags[i] = Tag{
      ID:   livestreamTagModels[i].TagID,
			Name: tagMap[livestreamTagModels[i].TagID],
		}
```

DB 85, APP 65 みたいになってきた

23:10 スコア 11540

# (未改善) `COMMIT\G` 改善

```
#    1 0xFFFCA4D67EA0A788813031B8... 24.0409 12.9%  6173 0.0039  0.01 COMMIT
#    2 0x59F1B6DD8D9FEC059E55B3BF... 21.5274 11.6%  1285 0.0168  0.01 SELECT reservation_slots
#    3 0x22279D81D51006139E0C7640... 17.1941  9.2% 29766 0.0006  0.00 SELECT domains domainmetadata
```

`COMMIT\G` が重い

トランザクションよく分からないのでお手上げ

# その他

[織時屋のログ](https://github.com/oribe1115/isucon13/blob/7630967631fb9e11a41df8bfb78ed08635ab45e9/webapp/go/top_handler.go#L28-L41)を見たら、Commitを消してそう。もしかしてCOMMITは結構消せるのか？

10/14にISUCON精進鯖でSazaさんに `COMMIT` 周り教えていただいた

- トランザクションについて、 `SELECT` のみなら消せる
- 1回までなら `INSERT`, `DELETE` も消せる
- 2回以上の `INSERT`, `DELETE` なら消せない
- ISUCON13については、トランザクションの構造体を引数として受け取っている箇所など、コード的にがっつり変更を入れる必要がある
- また、自明なトランザクション外しをしても、`COMMIT` は上位から簡単に落ちてくれるわけではない
  - 他のクエリを改善することで `COMMIT` も改善されることがある

このあたりはDBの仕組みを少し勉強したほうがいいなと感じました。Sazaさんありがとうございます。

# まとめ

- 前回とは違う改善を入れられてよかった
- 特にNGコメントの削除、`tags` テーブルのインメモリ化は取り組めてよかった
- 複数台構成、N+1の改善はまだやれてないので引き続き探求していく
