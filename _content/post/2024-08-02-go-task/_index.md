---
type: "post"
title: "タスクランナーとして go-task/task を仕事で使っている"
draft: false
description: "terraformに関わるオペレーションにタスクランナーを活用している話"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2024-08-02T14:11:57+09:00"
---

<!-- titleは自動で入る -->
<!-- 図を入れる -->

この記事は、[CYBOZU SUMMER BLOG FES '24](https://cybozu.github.io/summer-blog-fes-2024/) (生産性向上セイサンシャインビーチ Stage) DAY 1 の記事です。

# 生産性向上チームのセルフホストランナー基盤の軽い紹介

生産性向上チームは、様々な開発基盤をチーム横断で提供しています。そのうちの 1 つに、「GitHub Actions セルフホストランナー基盤」があります。

我々が社内チームに提供する GitHub Actions セルフホストランナー基盤は [philips-labs/terraform-aws-github-runner](https://github.com/philips-labs/terraform-aws-github-runner) という OSS を terraform モジュールとして拡張する形で運用されています。ざっくり言うと、実際の仕組みが AWS 上に terraform を用いて管理されていて、監視の仕組みは AWS と Datadog を使い別で構成されている、という 2 つに分かれた構成になっています。

詳細な仕組みは [philips-labs/terraform-aws-github-runner による GitHub Actions セルフホストランナーの大規模運用 | ドクセル](https://www.docswell.com/s/miyajan/ZW1XJX-large-scale-github-actions-self-hosted-runner-by-philips-terraform-module#p1) を参照してください。

# terraformに関わるオペレーション上の当時の課題

紹介で述べたように、セルフホストランナー基盤は terraform を用いて AWS 上に構築されています。terraform のコードを変更して、それをステージング環境、本番環境に適用します。最終的に `terraform apply` を打つのですが、オペレーションの内容に応じて様々な手順が発生します。

以下を前提として、当時あった課題を紹介します。

- 前提 1: terraform コマンドはローカル環境から実行している
- 前提 2: terraform で扱う AWS リソースがとても多い

## 課題: terraform state 分割をした結果、たくさんのディレクトリで同じコマンドを打つ必要が出た

本番環境の terraform の state があまりにも大きくなりすぎた結果、plan/apply の時間が非常に長くなってしまったり、AWS へのリクエスト数が多く API rate limit に当たって plan/apply が失敗するケースが常態化してきました。コードにあまり変更がない状態でも最低 10 分以上かかっていました。実際には API limit に当たって再度 plan を行なって...とすることも多く、体感ではもっと時間がかかっていたように思います。

そこで、使用している OSS の仕組みとして、Organization 数に対して AWS リソースの数が概ね比例することが分かっていたため、Organization を 10 個ずつ 1 つのグループとして state を分割しました。

その結果、state に対応する複数のディレクトリで `terraform init/plan/apply` を実行するような運用になってしまいました。これは面倒ですね。

# 課題: 手順が多くて面倒

また、別の問題として、手作業で打つコマンドが多いというものがありました。
例えば次のような出来事がありました。

- terraform plan を打つと、Renovate で aws provider や terraform のバージョンが上がっているので、結局 terraform init から実行しなくてはいけない
- philips-labs/terraform-aws-github-runner のアップデート時や、自分たちで使っているモジュールの更新時にはいくつかの作業が発生する

これらは単純に面倒というのに加えて、手順忘れによる事故も起こりやすくなってしまいます。

# 当時の解決: terragruntの導入→タスクランナーの導入

これら「state 分割によって生じた手間」と「手順の多さ」に対して次のように解決を行いました。

## 解決1: terragruntを導入して、複数ディレクトリで同じコマンドを流す

state 分割によって、複数ディレクトリで terraform コマンドを実行する必要があった箇所については、terragrunt の run-all コマンドによって解決しました。
参考: [terragruntのドキュメントのrun-all commandについての箇所](https://terragrunt.gruntwork.io/docs/features/execute-terraform-commands-on-multiple-modules-at-once/#the-run-all-command) 

現在では次のようなディレクトリ構造になっています。

```
- modules/runner-pool/ # 自分たちでOSSを拡張して作っているmodule
- self-hosted-runners/ # 実体のディレクトリ(modules/runner-poolをここで利用)
  - production/
    - ghec-group1/
    - ghes-group1/
    - ghes-group2/
    - ghes-group3/
    - ghes-group4/
  - staging/
    - group-1/
```

ここで、production/ ディレクトリで `terragrunt run-all init` と打てばその配下の `ghec-group1/` といったディレクトリそれぞれで `terraform init` 相当のコマンドが走るようになりました。
これによって、各ディレクトリで作業をする必要はなくなりました。

## 解決2: go-task/taskを使い、手順の複雑さをタスクランナーに任せる

手順が多いという課題に対しては、シェルスクリプトのようなものを自前で書けば解決しそうだったので、タスクランナーを導入しました。個人的に Makefile に馴染みがあるチームというわけでもなかったので、いくつかタスクランナーを検討してシンプル寄りの[go-task/task](https://github.com/go-task/task)を採用しました。

次のようなディレクトリ構造になっています。

```
- self-hosted-runners/
  - Taskfile.yml # ここを起点に `task stg:apply` のようなコマンドを打つ
  - production/
  - staging/
```

Taskfile の中身として `terraform plan` 相当のコマンドを簡略化すると次のようになっています。

```yaml
version: "3"

tasks:
  default:
    cmds:
      - task --list
    silent: true

  prod:init:
    cmds:
      - terragrunt run-all init
    dir: production
  
  prod:plan:
    cmds:
      - terragrunt run-all plan
    dir: production
    deps: [prod:init]
```

`self-hosted-runners/` ディレクトリに移動して、`task prod:plan` を打つと、次の順でコマンドが実行されます。

- deps にある `prod:init` コマンドが先に実行されるので、`terragrunt run-all init` が自動で実行される
  - 各ディレクトリで `terraform init` が実行される
- `terragrunt run-all plan` が実行される
  - 各ディレクトリで `terraform plan` が実行される

他にも、module 更新時の作業を Taskfile.yml に書いて、 `task stg:update_tag` で staging のモジュールのタグの更新を行うようにしました。

これにより、手作業が減って多くの作業が `task` コマンドによって実行されるようになりました。

# もっと改善

現在では、さらに改善が加えられて次のようなコマンドが go-task/task の Task 定義ファイルに書かれています。

- [GitHub deployment event](https://docs.github.com/en/rest/deployments/deployments) を用いていつどの環境に terraform apply を実行したかを記録
- deployments はコードをコミットしていないと作れないので、事前に deployments を作れるかチェックするスクリプト
- OSS のバージョンを上げる際に自動化できる手順をまとめたコマンド

また、go-task/task からは離れますが、[suzuki-shunsuke/tfcmt](https://github.com/suzuki-shunsuke/tfcmt) を使って変更差分を plan 実行時に PR にコメントとして残す、[`terraform plan -out=FILENAME`](https://developer.hashicorp.com/terraform/cli/commands/plan#out-filename) を用いて apply 時に plan 時に生成したファイルを渡す、などの工夫をしています。

# go-task/task のメリット・デメリット

メリット

- YAML とシェルスクリプトで簡単なことがしたいならとても良い

デメリット

- go-task/task の機能を使って複雑なことをしようとすると結構難しい
  - 例: terraform の並列実行数を環境変数で制御したいと思っても、すでに手元で環境変数が指定されていた場合、 `env` を使っても上書きできません(外から渡す値がファイル内に書いた値より優先される) [参考issue](https://github.com/go-task/task/issues/1038)

go-task/task は扱えるタスクの複雑さがシンプル寄りで、それ以上は別のタスクランナーの方がマッチするのかもしれません。具体的には、 `cmds` に `./hoge-task.sh` みたいなのを書く頻度が増えてきたり、go-task/task の issue を眺めてやりたいことが実現可能かどうか調査することが増えてきたら、シンプルではなくなっているという感覚になりました。

# 振り返って、当時の解決過程を評価する

go-task/task 以外にもさまざまな改善を行ってきましたが、go-task/task の導入だけに注目して当時の選択を振り返ってみます。

作業手順の複雑さをドキュメントからタスクランナーに移せたのは良いことだなと思います。自動化できたり、コードにできるものはしておいた方が良いです。また、コードにしていく過程で、ドキュメントにあるこの手順は本当に必要か？と疑って改善に繋げることができたのも良かったと思います。

一方で、当初の課題であった手順の多さの解決以降の改善によって、go-task/task が扱える範囲の複雑さを超えてきたような気もします。

ただ、これは課題のボトルネックが変わってきたということだろうと思うので、必要であれば go-task/task から別のタスクランナーへの移行や、他の手段を検討しようと思います。

# 現在も残っている課題

当時から利用チーム数も増加しました。次の問題がまだ残っています。

- terraform apply の時間が長い
- AWS のリソース数が多すぎる
  - チームではこれ以上リソース数が一気に増えるようなら API rate limit に当たって apply が失敗し続けるのでは、つまりもう上限が近いのではという感覚です

これに対する解決策としては、根本的には organization 数に対して線形にリソースが増える構造自体がまずいので、仕組みを変える必要がありそうです。
