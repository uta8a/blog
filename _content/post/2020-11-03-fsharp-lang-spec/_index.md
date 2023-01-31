---
type: post
title: 'F#でちょっと遊ぶ - 1 - 単純な電卓'
draft: true
description: F#って言語機能が強くて、Haskell のような、言語処理系界のスーパーカーに見えます。(個人の感想です。)
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: 2020-11-03T07:29:55+09:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
  - summary: migrate to lume
    date: 2023-01-31T21:22:31+09:00
---

- F#って言語機能が強くて、Haskell のような、言語処理系界のスーパーカーに見えます。(個人の感想です。)
- 今回は「F#の言語機能を使うためにコードを書く」という本末転倒の目標を掲げて、初心者が F#をおそるおそる触ってみる記事です。間違いや、「こうすればもっと面白いよ！」といった指摘やアドバイスがもしあれば、 [Twitter: @kaito_tateyama](https://twitter.com/kaito_tateyama) へリプライか DM で連絡いただけると嬉しいです。

# F#の導入

- 必要なものは以下の通りです。

```text
dotnet # .NET Core CLI
fantomas # formatter
```

- インストール方法です。まず dotnet を入れていきます。Ubuntu だと https://docs.microsoft.com/en-us/dotnet/core/install/linux-debian を見ておくとよさそうです。
- 今回は言語機能が知りたいだけなので、現時点での最新である dotnet 5.0(preview)を入れます。(私が使っている OS は Ubuntu20.04 です)

```shell
$ dotnet-sdk.dotnet --version
5.0.100-rc.2.20479.15
# https://github.com/dotnet/core/blob/master/release-notes/5.0/preview/5.0.0-rc.2-install-instructions.md
```

- 次に formatter を入れます

```shell
$ dotnet-sdk.dotnet tool install -g fantomas-tool
$ fantomas Program.fs # format
```

- F#ではプロジェクトという単位を作り、その中にファイルをいくつかおいて実行します。(ファイル単体でスクリプトのようにも扱えるらしい？)
- new, run といったコマンドを覚えるのが面倒なので Makefile を作っています。

```makefile
arg = "default"
target = "Program.fs"
new:
	@dotnet-sdk.dotnet new console -lang="F#" -o ./${arg}
	@cp .gitignore ./${arg}/.gitignore
run:
	@dotnet-sdk.dotnet run --project ./${arg}
fmt:
	@fantomas ./${target}
```

- 以下のようにしていきます

```shell
$ make arg=Name new # make project
$ make arg=Name run # run project
$ make target=Name/Program.fs fmt # format project
```

- 以下を実行すると、ハローワールドできると思います

```shell
make arg=minilang new
make arg=minilang run
# Hello world from F#
```

# ディレクトリ構成

- ディレクトリ構成を見ていきます。

```text
minilang/
├── bin/
├── minilang.fsproj
├── obj/
├── Program.fs
├── .gitignore
└── README.md
```

- bin/と obj/は gitignore します。
- Program.fs がスタート地点になります。(ファイルの中を見ると、`[<EntryPoint>]`があります。ここが開始地点です)
<!-- ファイル分割のときの話 -->

# ファイルの中身を出力する

- ここでの目標は「Either を使う」ということです。
<!-- ファイル読み込みと、エラーを出して確認 -->

# test?そろそろテスト駆動にしたい

- ここでテストのためのパッケージを入れる必要があるので、Makefile を見直して、テストが入っているプロジェクトが生成されるようにしようと思います。

# その他

- Ionide

```
$ code --install-extension ionide.ionide-fsharp
```

- https://github.com/OmniSharp/omnisharp-vscode/issues/3077#issuecomment-498880626

```
$ sudo ln -sv /snap/dotnet-sdk/current/dotnet /usr/local/bin/dotnet
```

- もし apt で 3.1 入れてたらそれは消す。
- 上 2 つで dotnet コマンド(dotnet5.0)を ionide が認識できるようになり、補完や静的チェックが効くようになる。
- paket

```shell
dotnet-sdk.dotnet tool -g install paket
```

- paket は今回はだめだった。
