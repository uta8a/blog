---
type: post
title: goでAPIサーバを書いた
draft: false
description: go で 1 週間くらいかけて API サーバを書きました。
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: 2020-12-20T23:45:05+09:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
  - summary: migrate to lume
    date: 2023-01-31T21:29:05+09:00
---

- go で 1 週間くらいかけて API サーバを書きました。go 以外にも学ぶことが多かったので学んだことを書きます。
- 作ったアプリは公開範囲が指定できる wiki みたいなものです。

# 気をつけたこと

- 以前 go で API サーバを書いたときは Echo や Gorm といったライブラリをふんだんに使用したため、何がなにかわからなくなって途中で挫折しました。それから時がたって、go の界隈の方々の記事、特に mercari 周辺の方々の記事を読み、go の net/http は単体で十分フレームワークなしでいけるという確信を得たので今回以下のようにしばりを決めました。

```text
- できるだけ標準ライブラリでなんとかする
(作っていくうちに、DB接続のためpostgresのドライバを、セッション管理のためcrypto/mathの2つだけは使うことにしました)
```

- また、どうしても API を生やす作業は終わりが見えなくなるので、仕様書を書いてみることにしました。今回は [OpenAPI](https://swagger.io/specification/) を使うことにしました。
- まず OpenAPI で一部の API を決める → go を書く → フロントを書く(場合によっては OpenAPI に修正を入れる)というサイクルで徐々に API の定義書と API サーバとフロントを書いていきました。

# 分かったこと

## OpenAPI で API 定義を先に書くと、フロントエンド部分を高速に実装できる

- API 定義ってどう書くのかというと、こう書きます

```yaml
"/groups":
  get:
    responses:
      "200":
        description: "userの入っているgroupを返却する"
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UserGroups"
            example:
              user_groups:
                - "public"
                - "myPrivate"
    security:
      - cookieAuth: []
```

- これは `/groups` というパスに対して get でリクエストを送ったときの API サーバの挙動を決めています。
- get なので通常パラメータはなく、response だけを定義していること、また securty の項目に決めてあるように cookie が valid でないと response を返さないことを決めています。返却する型は schema として別で記述しています。
- こういうものを書いておくと、フロントエンドとバックエンドを別々に実装できます。多くのやり取りを json で統一しておいたので、フロント側でうけとって書く処理も高速に書くことができました。

## go に慣れてなくて戸惑ったポイント

- TrimLeft の挙動が TrimPrefix のようなものを期待していたので戸惑いました。
- `http.HandleFunc`に`/route/`を渡すと`/route/a`もこれにマッチするので`/group/:group_name`みたいな可変ルーティングに対応できます。これ知らなくてかなりはまりました。

## 権限回りは設計が難しい

- 自分が作ったバグを述べます。コードを書きながら最終段階でつじつまの合わない箇所をたくさん発見して困りました。
- グループという概念を実装して、グループに記事が属していることでそのグループの人だけ記事を見られるという仕組みにしました。
- バグ 1: グループの名前だけチェックしている。
- これにより、別グループでもそのグループ名が DB に登録されていれば記事を更新できるので、自分が所属していないグループの記事を荒らすことが可能になります。id をチェックすることで解決しました。
- バグ 2: グループの名前と id だけチェックしている。
- 別のグループの名前を指定すると、自分が所属していないグループに無限に記事を送り込むことができます。これも解決しました。
- このように、権限回り、閲覧可能範囲回りで大量にヤバが発生したので QA って大事なんだなあと感じました。

# 終わりに

- とりあえず気合でいってベストプラクティスを気にしなければそれなりの速度で web サービスは作れる。大事なのはリリースしてからバグを取る、脆弱な部分があるかもしれないという不安と戦いながら見切ってリリースして継続的に修正とデプロイを繰り返す心！
- まだ怖い部分があるので、デプロイできてないです。直してリリースまで持っていきたい。
