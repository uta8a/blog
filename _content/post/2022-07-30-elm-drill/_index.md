---
layout: post
title: 'Elmドリル - jinjor/elm-drill - に取り組んでみた'
description: 良さそうなElmに慣れるためのドリルがあったのでやってみました
draft: false
changelog:
  - summary: 見出し作成
    date: 2022-07-30T18:14:30+09:00
---

# Elmドリル - jinjor/elm-drill - に取り組んでみた

## 概要

[Elmドリル](https://github.com/jinjor/elm-drill) はRustにおける [rustlings](https://github.com/rust-lang/rustlings) みたいな感じでサッと試せてテスト付きで確認できて回答もついてて詰まったら見ればいいから最高の学習教材だと感じた。

Elm Architectureとかは学べないので、アプリを作る前に文法確認のためにさっくりやっておくものという立ち位置だと思う。

## 詳細

### elmのdevcontainerを用意した

devcontainerを使いたいと考えて、elm用のコンテナを用意した。

まず [GitHub Codespaces で自前イメージを使う](https://qiita.com/kojiohta/items/378f7a9310c411fa41fb) を読んで自前で作ろうとしていたが、 [zennの執筆環境向けdevcontainerを作成した話](https://zenn.dev/bells17/articles/zenn-devcontainer) を読んで [Elm (Community)](https://github.com/microsoft/vscode-dev-containers/tree/main/containers/elm) の存在を知ってこれをそのまま使うことにした。

### 進め方

[Elmドリル / 進め方](https://github.com/jinjor/elm-drill#%E9%80%B2%E3%82%81%E6%96%B9) に書いてある。

基本的には、 `only` を付け替えてQ1から順にQ10まで進む。一つのQ当たりの問題数も多くて10くらいなので意外とサクサク終わる。僕は全部で4時間くらいかかった。(詰まったら答えを見てた)

### 学んだこと

- 関数の書き方が独特。

```elm
swap : ( a, b ) -> ( b, a )
swap ( a, b ) =
    (b, a)
```

- `|>` 演算子で関数型言語でよくみるchainができる

```elm
trimAndToUpperAndReverseLeftToRight : String -> String
trimAndToUpperAndReverseLeftToRight s =
    s
        |> String.trim
        |> String.toUpper
        |> String.reverse
```

- Elmは2019/10にv0.19.1をリリースしてから2022/7現在までリリースが出ていない [ref. github Releases](https://github.com/elm/compiler/releases) これはElmのコミュニティの独特さに起因していて、元々Elmは教育用言語として言語仕様を小さく保つために作られていて、機能追加に対するモチベーションがない。また、作者の独裁体制の元Elmは作られているので今後も機能追加される可能性は薄い。 [参考: なぜElmは0.19のままか、変化すること／しないこと](https://izumisy.work/entry/2021/11/13/181404)

## メモ

- [devcontainer一覧](https://github.com/microsoft/vscode-dev-containers/tree/main/containers) が便利。本当に色々なdevcontainer例が載っている。
- elmのCommunity devcontainerはコンテナ内からgitが使えなかったので修正チャンスかも。(.gitconfigのコピーとSSHキーのコピーが必要？普通はどうやっているんだろう)
- devcontainerでデフォルトのVS Code拡張は弱い？ので別の拡張を入れた。
- elmの態度から、学習用途に使ってstdに近いライブラリだけを使うのが良さそうだと感じた。Elm Architectureの精神を学んでそれを他の本番環境、TypeScriptなどで活かすのが良さそう。
- 以下のようなミスをすると一生再帰してそうでelm-testの結果が返ってこなくなる。elm-testの結果が返ってこない時は待たずに中断すること。

```elm
length : String -> Int
length s =
    length s -- ここは本当は String.length s
```

- 最初testを動かそうとするとこんなエラーが出た

```text
This file:

/workspaces/elm-drill-answer/elm-drill/tests/Tests.elm

…matches more than one source directory:

/workspaces/elm-drill-answer/elm-drill/tests
/workspaces/elm-drill-answer/elm-drill/tests

Edit "source-directories" in your elm.json and try to make it so no source directory contains another source directory!

Note: The tests/ folder counts as a source directory too (even if it isn't listed in your elm.json)!
```

これは以下のように elm.json を変更するとよい( `tests` を除く)

```json
"source-directories": ["src", "answers"],
```

- 他にもコメントのtypoや型がQuestionとAnswerで異なることがあったので、本家にPRを出した [Fix: typo修正とanswer/questionで型が異なっているのを修正 #9](https://github.com/jinjor/elm-drill/pull/9)


## まとめ

[Elmドリル](https://github.com/jinjor/elm-drill) はさっくりできて公式ドキュメントを読みながら演習を進められるのでおすすめ。Elmでアプリを作る前段階としてやっておくといいかも！
