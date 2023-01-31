---
type: post
title: rustlings を読んだ
draft: false
description: rustlings を読み終えました
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: 2022-02-14T16:08:04+09:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
  - summary: migrate to lume
    date: 2023-01-31T21:59:45+09:00
---

[rustlings](https://github.com/rust-lang/rustlings) を読み終えました。

# 概要

主に [TRPL](https://doc.rust-lang.org/book/) に対応する演習問題集。私は TRPL を読んだ後だったのでサクサク進めることができました。

この資料の良さは、 `rustlings watch` コマンドでライブで確認しながら穴埋め形式でさまざまな Topic をサクサク学ぶことができるところにあると思います。学習体験は非常によくて、すぐに次の問題に取り掛かることができます。

# 記憶に残った問題

ネタバレを防いだ方がいいかなと思ったので、記憶に残った理由は載せません。

- [move_semantics5](https://github.com/rust-lang/rustlings/blob/cd2b5e8e3b616e769d2c17df45f813772aa81530/exercises/move_semantics/move_semantics5.rs)
- [modules2](https://github.com/rust-lang/rustlings/blob/1c3beb0a59178c950dc05fe8ee2346b017429ae0/exercises/modules/modules2.rs)
- [quiz2](https://github.com/rust-lang/rustlings/blob/101072ab9f8c80b40b8b88cb06cbe38aca2481c5/exercises/quiz2.rs)
- [errors2](https://github.com/rust-lang/rustlings/blob/ec2d4bd3ee665f2a4c79dd42c41078223074d4c1/exercises/error_handling/errors2.rs)
- [errors6](https://github.com/rust-lang/rustlings/blob/b7ddd09fab97fc96f032bc8c0b9e1a64e5ffbcdd/exercises/error_handling/errors6.rs)
- [iterators2](https://github.com/rust-lang/rustlings/blob/baf4ba175ba6eb92989e3dd54ecbec4bedc9a863/exercises/standard_library_types/iterators2.rs)
- [iterator3](https://github.com/rust-lang/rustlings/blob/c6712dfccd1a093e590ad22bbc4f49edc417dac0/exercises/standard_library_types/iterators3.rs)
- [iterators4](https://github.com/rust-lang/rustlings/blob/959008284834bece0196a01e17ac69a7e3590116/exercises/standard_library_types/iterators4.rs)
- [macros3](https://github.com/rust-lang/rustlings/blob/ec2d4bd3ee665f2a4c79dd42c41078223074d4c1/exercises/macros/macros3.rs)
- [macros4](https://github.com/rust-lang/rustlings/blob/6bb0b48b100fe4af5bddbcf639e8843350b62555/exercises/macros/macros4.rs)
- [as_ref_mut](https://github.com/rust-lang/rustlings/blob/bb5f404e35f0091b4beb691105e7ed2a94ce4a13/exercises/conversions/as_ref_mut.rs)

# 今後やりたいこと

- `move_semantics5` の理由を調べる
- Error の扱いに慣れる
- macro に慣れる

# 感想

この資料は 2022/02/13 - 2022/02/14 にかけて、4 回に分けて合計 5 時間 20 分かけて読み終えました。前半半分が 1 時間くらいでスッと終了し、後半は知らないことが多く調べたりメモして時間をかけました。

英語の問題文や指示ですがそんなに分量はないし、コードとコンパイルエラーを見れば大体分かるので苦労しませんでした。

詰まった問題を眺めてみると、Iterator, Macro, Error にまつわる Box やトレイトなどのトピックが苦手なようです。これらはあまり使ったことがないという点と、メソッドがめちゃくちゃ多くてこんな便利メソッドがあるの！みたいなことがよく起こることが理由にありそうです。

また、比較的できた問題としては `&str` と `String` の違いを問うものがありました。これは [サークルの Rust 講習会](https://docs.uta8a.net/learn-rust) でこの違いを質問されたり講義したりして裏でかなり調べていたことが実力につながっているのだと思います。ということは、人に教える資料として Iterator 編と Macro 編と Error 編を作れば万事解決ですね。人に説明できる水準で理解することは大切だと改めて思いました。
