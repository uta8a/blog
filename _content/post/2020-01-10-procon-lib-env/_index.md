---
layout: post
title: 競プロ用ライブラリuta8alibの環境構築
description: 競技プログラミング用ライブラリの環境構築について書きます。
draft: false
changelog:
  - summary: 記事作成
    date: 2020-01-10T08:13:00+09:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
---

[uta8alib](https://github.com/uta8a/uta8alib)という競技プログラミング用ライブラリの環境構築について書きます。  
今回環境を作るに当たって、[ngtkana さん](https://github.com/ngtkana)の[ngtlib](https://github.com/ngtkana/ngtlib)を参考にした部分が大きいです。ありがとうございました。

# やりたいこと

- C++と Rust で競プロをする
- `example/main.rs`のように、ファイル名を`main.[rs|cpp|hpp]`で統一したい
- test を行い、CI で check する
- ライブラリのコピペを行いたいので、コードとテストは別ファイルにしたい(特に Rust)
- あとで document(html)を生成することを考えて、コメントを各ファイルとテストに書けるようにしておく
- git submodule を使ってみる(C++テストフレームワーク Catch2 の使用)

**今後の展望**

- status badge を GitHub につける
- [How to run CI on your library for competitive programming](https://online-judge-tools.readthedocs.io/en/master/run-ci-on-your-library.ja.html)を参考に、今後 Verify を導入して CI を回す
- Git-Flow を参考に、feature ブランチでライブラリ単体を開発して C++と Rust が揃ったら develop ブランチに統合、master にまとめてマージするときに CI を走らせる
- snippet の導入。コードからコメントを抜いたものを snippet ファイルとして自動生成したい。(VSCode, neovim(dein.vim, UltiSnip))
- ライブラリの種類を増やす(たくさん問題を解きましょう)

# 開発の流れ

- [やりたいこと](#やりたいこと)
- [開発の流れ](#開発の流れ)
  - [ディレクトリ構成を決める](#ディレクトリ構成を決める)
  - [自分用の競プロ CLI ツール、chan を使う](#自分用の競プロ-cli-ツールchan-を使う)
  - [git submodule を使う](#git-submodule-を使う)
  - [Rust のテスト方法を考える](#rust-のテスト方法を考える)
  - [C++のテスト方法を考える](#cのテスト方法を考える)
  - [Git の開発手順を見直す](#git-の開発手順を見直す)
  - [CI でテストを回す](#ci-でテストを回す)
  - [status badge を GitHub につける](#status-badge-を-github-につける)
  - [LICENSE を加える](#license-を加える)
- [今後の展望](#今後の展望)
  - [Logo を作ってやる気を高める](#logo-を作ってやる気を高める)
  - [Verify してみる](#verify-してみる)
  - [snippet の導入](#snippet-の導入)
  - [競プロで使うエディタの選定](#競プロで使うエディタの選定)
  - [どこでも競プロできるようにシェルスクリプトを書く](#どこでも競プロできるようにシェルスクリプトを書く)
  - [ライブラリの種類をどうやって増やすか(アルゴリズムを学ぶ)](#ライブラリの種類をどうやって増やすかアルゴリズムを学ぶ)
- [この記事を書くに当たって](#この記事を書くに当たって)
- [終わりに](#終わりに)

## ディレクトリ構成を決める

ディレクトリ構成は以下のようになっています。  
src の下に cpp と rust があり、その下にディレクトリが存在していて`example`などがライブラリの名前になります。コードはそのディレクトリの中の`main.[rs|hpp]`に書きます。  
test はテストコードです。src と同様の構成になっています。

```
❯ tree -I 'Catch2|chan|cpp-test|rust-test'
.
├── CMakeLists.txt
├── Dockerfile
├── libtest.sh
├── README.md
├── src
│   ├── cpp
│   │   ├── example
│   │   │   └── main.hpp
│   │   └── include
│   │       └── lib.hpp
│   └── rust
│       └── example
│           └── main.rs
├── test
│   ├── cpp
│   │   ├── CMakeLists.txt
│   │   ├── example
│   │   │   └── main.cpp
│   │   └── main.cpp
│   └── rust
│       └── example
│           └── main.rs
└── todo.md
```

重視したことは、少しくらい深さのある構成になっても自分が好きな方を選ぶということです。`lib-name.hpp`というような名前のファイルをフラットに`src`直下に置く方も多いですが、僕は`lib-name/main.hpp`の方が好きなのでこうしました。好みの問題ですね。  
深さができて GitHub で見るには面倒、という弱点のために、document を自動生成してブラウザで見る、というようにしたいです。コードブロックの右上にコピペボタンを用意すれば捗りそうです。

## 自分用の競プロ CLI ツール、chan を使う

競プロをするときは焦りがちなので、使うコマンドは最小限にしたいです。あと、打ちやすいほうがいい。僕は`chan`というコマンドでコンパイルして実行ファイル生成を行っていましたが、このコマンドにライブラリのテンプレート作成機能をもたせることにしました。

```
chan main.rs # rustc main.rsが走る
chan main.cpp # g++ が走る
/path/to/uta8alib$ chan generate cpp example # exampleという名前のフォルダで、C++のsrcとtestのテンプレートファイル作成。C++の場合、include/lib.hppにパスを追加する。
```

引数の数で判別しています。単純な機能ですが、Rust で 4 時間くらいかけて書いて、Python3 とかの方がこういうのは向いてるなぁと感じました。外部 crate は使いませんでしたが、[`clap-rs`](https://github.com/clap-rs/clap)を使うと高機能にできそうです。ソースコードの本体は[こちら](https://github.com/uta8a/chan/blob/171f0719af55ed7542cee27fb2ae4b11e98483d8/src/main.rs)です。  
重視したことは、色付きで出力させることです。はじめ Option なしでは色がなく、読みづらく感じていました。調べたところ、強制的に coloring を ON にする Option をつければよいと分かりました。Rust は `rustc --color=always` を、C++は `g++ -fdiagnostics-color=always` を指定しています。

## git submodule を使う

[ngtlib](https://github.com/ngtkana/ngtlib)を見て git submodule に興味が湧いていました。また、競プロに関わることは普段はなるべくひとつにまとめておきたいものです。というわけで chan を submodule として uta8alib に取り込みます。

**やること**

- [`chan`](https://github.com/uta8a/chan/tree/master)を GitHub に上げます。
- `uta8alib$ git submodule add git@github.com:uta8a/chan.git chan`で submodule を追加
- ここで、`add repo directory`の repo と directory に気をつけましょう。
- .gitmodules が自動生成されるので確認

```
[submodule "chan"]
	path = chan
	url = git@github.com:uta8a/chan.git
```

- こんな感じなら OK
- あとは chan に入って`cargo build --release`でバイナリを作り、alias で`chan`を使えるようにしておく。

**読むべき**

- [git 公式](https://git-scm.com/docs/git-submodule) submodule の後に`--help`を入れて打っておよい。

**困った時のコマンド**

- git clone してきたら submodule がない！
  - `git submodule update --init --recursive`
- submodule が更新された。新しくしたい。
  - `git submodule foreach git pull origin master`

**注意**

- `.gitmodules`を書いて`git submodule pull`みたいなことをやりたいが、それはできない。`add`で追加して、`.gitmodules`は生成物と捉えたほうがよい。

## Rust のテスト方法を考える

今回、cargo で外部 crate を入れるつもりはなかったので、cargo を使わないディレクトリ構成をしていました。しかしテストをするには cargo がよいです。そこで、テストのときに`cargo new`して`cargo test`するという方法に決めました。  
[`libtest.sh`](https://github.com/uta8a/uta8alib/blob/master/libtest.sh)の `# rust test` の箇所を見ると分かるのですが、cat で src と test のファイルを結合したものを`cargo new`で生成したディレクトリの中に入れて、`lib.rs`に追記しています。  
`cargo`を完全にテストツールとして使っていて強引な気がしますがうまく行っています。一つのファイルにまとめているので private method test ができ、わざわざ `pub` をつけずにライブラリを書くことが出来ます。

## C++のテスト方法を考える

[git submodule を使う](#git-submoduleを使う)と同じ手順で[Catch2](https://github.com/catchorg/Catch2)を導入しました。

**やること**

- google test や catch2 など、C++テストフレームワークを検討する
- catch2 の使い方を調べる
- cmake を理解する
- test を書く
- CMakeLists.txt を書く
- make を通す

細かく分けるとこんな感じでした。テストフレームワークの選定については[wikipedia のユニットテストフレームワークの記事の C++の欄](https://ja.wikipedia.org/wiki/%E3%83%A6%E3%83%8B%E3%83%83%E3%83%88%E3%83%86%E3%82%B9%E3%83%88%E3%83%BB%E3%83%95%E3%83%AC%E3%83%BC%E3%83%A0%E3%83%AF%E3%83%BC%E3%82%AF%E4%B8%80%E8%A6%A7#C++)を参考にしました。

> ヘッダ・ファイルのみからなり、外部に依存しない。(wikipedia の記事より引用)

たくさんあるので google test と Catch2 しか見れませんでしたが、違いがいまいち分からなかったので[ngtlib](https://github.com/ngtkana/ngtlib)でも使われている Catch2 を選択しました。  
CMakeLists.tst については[ngtlib](https://github.com/ngtkana/ngtlib)を参考にしたいのであまり理解できていません。以下の記事が参考になりました。

**参考**

- [CMake の使い方](https://qiita.com/shohirose/items/45fb49c6b429e8b204ac)
  - 簡単なところから説明されているので分かりやすいです
- [cmake で googletest できる環境を作ってみる](https://www.jonki.net/entry/2016/06/15/220029)
  - `ctest --verbose`を使うとデバッグが捗ります
- [シェルスクリプトで相対パスと絶対パスを取得する](https://www.task-notes.com/entry/20150214/1423882800)
  - `pwd`とシェルスクリプトに書く時の注意点です

make が通った時は嬉しかったです。

## Git の開発手順を見直す

ここまでずっと master に push してきましたが、そろそろ CI を導入するとなると、master にプルリク送ったときのみ CI が回るようにしたいです。現在は develop と master の 2 つですが、ライブラリを作る時は`feature-xxx`というブランチを作り、Rust と C++が揃った段階で develop に取り込み、master へマージして CI 回すという形にしたいです。

**参考**

- [Git-flow って何？](https://qiita.com/KosukeSone/items/514dd24828b485c69a05)

## CI でテストを回す

以前 GitHub Actions を使ったことがあったので、今回は Circle CI を使ってみました。結論の`config.yml`は[こちら](https://github.com/uta8a/uta8alib/blob/master/.circleci/config.yml)です。

```
version: 2.0

jobs:
  build_and_test:
    docker:
      - image: uta8a/circleci-rust-cmake:0.0.1
    environment:
      USER: uta8a
    working_directory: ~/work
    steps:
      - checkout
      - run: git submodule sync
      - run: git submodule update --init
      - run: ./libtest.sh

workflows:
  version: 2
  build:
    jobs:
      - build_and_test:
          filters:
            branches:
              only: master
```

**注意**

- 現在 version 2.1 まで指定できますが、local の circleci CLI ツールが 2.0 までしか対応していないので 2.0 を指定します。
- docker で 2 つ image を指定しようとしたら最初の一つしか反映されませんでした。無料枠であることが関係していそうですが原因は分かりませんでした。
  - そのため、DockerHub に自分で作ったイメージを上げました。[DockerHub へのリンク](https://hub.docker.com/r/uta8a/circleci-rust-cmake)
  - これは、`circleci/rust`をベースにして[`rikorose/gcc-make`](https://hub.docker.com/r/rikorose/gcc-cmake/)を参考に書き足しています。gcc は 8 で、cmake は 3.15 でした。
- `cargo`を docker で使おうとすると`$USER`が足りないというエラーが出ます。そのため、environment で USER を指定します。
- git submodule を使っている場合は、checkout 後に submodule も引っ張ってくるようコマンドを指定します。
- branch は master のみに設定します
- workflows の version は、全体の version が 2.1 のときは記述がいらないのですが、2.0 では必須です。
- circleci のデバッグ作業はローカルの CLI ツールを用いましょう。`circleci config validate`で yaml が正しいかどうか判定でき、`circleci local execute --job build_and_test`で特定の job を実際に回せます(docker を使います)

## status badge を GitHub につける

[公式の document](https://circleci.com/docs/2.0/status-badges/)を読むと簡単に導入できます。Different Style の方が好みだったのでそうしました。

## LICENSE を加える

加えました。MIT。

# 今後の展望

## Logo を作ってやる気を高める

## Verify してみる

## snippet の導入

## 競プロで使うエディタの選定

## どこでも競プロできるようにシェルスクリプトを書く

## ライブラリの種類をどうやって増やすか(アルゴリズムを学ぶ)

# この記事を書くに当たって

`[article](#toc)` で見出しへの anchor link が張れるのですが、これは一癖あって、hugo で生成されたものの id をみながらそれと一致するようにやっていくとよいです。例えば、 `##C++でのテスト方法を考える` は `#c--でのテスト方法を考える` に変化します。

# 終わりに

今回環境構築がメインでもう力尽きそうですがここからがスタートラインです。今年は競プロのレートに興味を持たずに、アルゴリズムに興味を持つことを目標にしていきたいです。
