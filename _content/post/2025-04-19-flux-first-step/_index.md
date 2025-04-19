---
type: "post"
title: "Gitless GitOpsをFluxでやってみる"
draft: false
description: "OCI Repositoryにmanifestを置いて、kindでfluxを動かす"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2025-04-19T08:57:37.184066816+09:00[Asia/Tokyo]"
---

<!-- titleは自動で入る -->
[Gitless GitOpsとは何か？OCI中心のセキュアな新構成](https://zenn.dev/cadp/articles/gitless-gitops-intro) という記事を読んで、Gitless GitOpsを試してみました。今回の内容はFluxのセットアップをするまでです。

環境

- kind: v0.20.0 kind clusterに対して操作を行います
- flux: v2.5.1

# Gitless GitOpsの概要

元記事が詳しいのですが、ざっくり解説すると「Git RepositoryからOCI RepositoryにmanifestをCIでpushして、CDツールはOCI Repositoryを定期的に見に行くようにする」という内容になっています。

最近流行りのOCI Repositoryにコンテナイメージも突っ込んじゃうやつだ！と思いました。
OCI Repositoryにすることで嬉しいことは2点あり、Git Repositoryにはないもの(OCI artifactの署名、検証や脆弱性スキャン)が使えるようになってサプライチェーンセキュリティの観点でセキュアになるというのと、`git pull` をするわけではないので大規模な場合にパフォーマンスの向上が見込める、ということのようです。

個人的なモチベーションとしてサプライチェーンセキュリティに興味があるので触ってみることにしました。

# Fluxのセットアップ

[flux](https://fluxcd.io/flux/)は `flux` コマンドを使用するのが流儀っぽいのですが、`kubectl` を使いたいので、今回 `flux bootstrap` は使いません。

## 1. flux operatorのインストール

[Flux Operator Installation](https://fluxcd.control-plane.io/operator/install/#Kubectl) のkubectlのところを参照。

```console
$ kubectl apply -f https://github.com/controlplaneio-fluxcd/flux-operator/releases/latest/download/install.yaml
```

これで `kind: FluxInstance` とかが使えるようになります。

## 2. OCI Repositoryの作成

今回はghcr.ioを使用します。[GitRepositoryからOCI Repositoryへの移行ガイド](https://fluxcd.control-plane.io/operator/flux-bootstrap-migration/#publish-the-manifests-to-the-oci-repository) が参考になります。

移行ガイドではGitHub Actionsを使ってGit Repository上のmanifestをOCI Repositoryにpushする方法が書いてあります。
以下のようなworkflowになっていました。

```yaml
name: publish-artifact

on:
  workflow_dispatch:
  push:
    branches:
      - 'main'
      - 'oci-artifacts'

permissions:
  packages: write

jobs:
  flux-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Flux CLI
        uses: fluxcd/flux2/action@main       
      - name: Push immutable artifact
        run: |
          flux push artifact \
            oci://ghcr.io/${{ github.repository }}/manifests:$(git rev-parse --short HEAD) \
            --source="$(git config --get remote.origin.url)" \
            --revision="$(git branch --show-current)@sha1:$(git rev-parse HEAD)" \
            --creds flux:${{ secrets.GITHUB_TOKEN }} \
            --path="./"
      - name: Tag artifact as latest
        run: |
          flux tag artifact \
            oci://ghcr.io/${{ github.repository }}/manifests:$(git rev-parse --short HEAD) \
            --creds flux:${{ secrets.GITHUB_TOKEN }} \
            --tag latest
```

気になりポイントとして、

- `fluxcd/flux2/action@main` でmainブランチ指定しているのは個人的に好みではない
  - hash指定するのが良い
- `flux push artifact` の `path` には何を置けばいいのか
  - エントリーポイントになるところが何か分からない

1つめのmainブランチ指定については、単に `flux` コマンドを使いたいだけのようだったので [`aqua`](https://aquaproj.github.io/) で代替しました。

2つめの `path` については、[Example](https://github.com/stefanprodan/podinfo/blob/b3396adb98a6a0f5eeedd1a600beaf5e954a1f28/.github/workflows/release.yml#L140)を参考にするとkustomizeの `kustomization.yaml` を置くようだと分かりました。[ドキュメント:Generating a kustomization.yaml file](https://fluxcd.io/flux/components/kustomize/kustomizations/#generating-a-kustomizationyaml-file)によると、pathを見に行く挙動は以下のようになっているようです。

- Fluxがpathを見に行く
- kustomization.yamlがあればそれを使う
- なければそのディレクトリでkustomization.yamlを生成してそれを参照する
  - YAMLを列挙したような内容になるっぽい？

今回はJsonnet(Grafana tanka)を使っているので、以下のようにCIでYAMLにrenderingしつつ、kustomization.yamlを生成するようにしました。

コード例: [PR](https://github.com/uta8a/infra/pull/3/files#diff-a64ad2ac5a0f85f9adfd65567f0e50337afcecfbd8af41467f84b320f102afea)

```yaml
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Install aqua
        uses: aquaproj/aqua-installer@v3.1.2
        with:
          aqua_version: v2.48.3
      - name: Generate artifact
        run: |
          mkdir out
          tk export ./out environments/default
          cd out && kustomize create --autodetect --recursive
        working-directory: ./home-k8s-app/example

# flux push artifactでは `--path="./home-k8s-app/example/out"` を指定する
```

これでmainブランチ指定を回避しつつ、Jsonnetを使ってmanifestをOCI Repositoryにpushできました。

注意: 私は公開リポジトリ [uta8a/infra](https://github.com/uta8a/infra) で作業しているので、外部からワークフローをキックされないようにGitHubの設定 Settings > Actions > General から "Require approval for all external contributors" を選択してSaveしています。

## 3. FluxInstanceを作成する

これでghcr.ioにmanifestが配置されたので、手元のk8sクラスタからそれを引っ張ってきます。
ghcr.ioからpullするために認証情報が必要ですが、まずはそれ無しでFluxInstanceを作成します。

FluxInstanceはクラスタ当たり通常1つだけ作成するもので、pathを指定してマニフェストのエントリーポイントに対応するものになります。ArgoCDのApplicationに対応するような複数のAppsは、kustomizeの中のResourceとして定義するようです。なので、FluxInstanceはApplicationとは紐づかない、上位概念だと思います。

重要な部分だけ書きます。全体は[こちら](https://github.com/uta8a/infra/pull/3/files#diff-184f6ca75528902d38aa5ec60d2f61ba7ff2597ba5088429b938bf0df080d42e)

```yaml
apiVersion: fluxcd.controlplane.io/v1
kind: FluxInstance
...
  sync:
    kind: OCIRepository
    url: "oci://ghcr.io/uta8a/infra/manifests" # ghcr.ioを指定
    ref: "latest"
    path: "." # pathは必須
    pullSecret: "ghcr-auth"
```

kubectl applyすると、FluxInstanceが作成されました。

```console
$ k logs kustomize-controller-655f85f896-z6pq7 -n flux-system
{"level":"info","ts":"2025-04-18T12:05:22.948Z","msg":"Source artifact not found, retrying in 30s","controller":"kustomization","controllerGroup":"kustomize.toolkit.fluxcd.io","controllerKind":"Kustomization","Kustomization":{"name":"flux-system","namespace":"flux-system"},"namespace":"flux-system","name":"flux-system","reconcileID":"a9834208-3cf8-4fd9-bda4-3a094544d42b"}
```

source artifactが見つからないというエラーが出ていますね。これはghcr-authという名前のSecretでghcr.ioからpullできるような認証情報を与えると解決します。

GitHub classic PATで払い出した `ghp_xxx` みたいなトークンを使って以下のような `dockerconfig.json` を作成します。

```json
{
    "auths": {
        "ghcr.io": {
            "username": "username",
            "password": "ghp_xxx",
            "auth": "<base64-encode(username:ghp_xxx)>"
        }
    }
}
```

これを `cat dockerconfig.json | tr -d '\n' | base64` でbase64エンコードして、以下のようなSecretを作成します。
(この方法は秘密にしたい情報がそのままYAMLに載ってしまっているので、公開情報にはできないです)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ghcr-auth
  namespace: flux-system
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: <base64-encoded-dockerconfig.json>
```

このYAMLを `kubectl apply` すると、少し待つと無事にOCI Repositoryからmanifestをpullできました。

```json
{"level":"info","ts":"2025-04-18T12:05:52.949Z","msg":"Source artifact not found, retrying in 30s","controller":"kustomization","controllerGroup":"kustomize.toolkit.fluxcd.io","controllerKind":"Kustomization","Kustomization":{"name":"flux-system","namespace":"flux-system"},"namespace":"flux-system","name":"flux-system","reconcileID":"1980b545-2041-454b-bcec-8b4a528476c3"}
{"level":"info","ts":"2025-04-18T12:06:07.119Z","msg":"server-side apply completed","controller":"kustomization","controllerGroup":"kustomize.toolkit.fluxcd.io","controllerKind":"Kustomization","Kustomization":{"name":"flux-system","namespace":"flux-system"},"namespace":"flux-system","name":"flux-system","reconcileID":"0fa2e279-96f0-44cf-a66c-2e99b1c3d25a","output":{"Deployment/default/podinfo":"created","Service/default/podinfo":"created"},"revision":"latest@sha256:19a31ccc8ae375e0e6fcd89205bfcefd044d8a1cfc4a02c22a8930a5aa065002"}
{"level":"info","ts":"2025-04-18T12:06:07.134Z","msg":"Reconciliation finished in 168.982584ms, next run in 10m0s","controller":"kustomization","controllerGroup":"kustomize.toolkit.fluxcd.io","controllerKind":"Kustomization","Kustomization":{"name":"flux-system","namespace":"flux-system"},"namespace":"flux-system","name":"flux-system","reconcileID":"0fa2e279-96f0-44cf-a66c-2e99b1c3d25a","revision":"latest@sha256:19a31ccc8ae375e0e6fcd89205bfcefd044d8a1cfc4a02c22a8930a5aa065002"}
```

`server-side apply completed` みたいな表示が確認できます。

# その他

- FluxはPlugin機構が無さそう。今回のtankaで `tk export` してkustomizeを生成する方法よりもいい感じにやるのは難しいかも。

> Is there a Plugin support for Flux?
> [https://github.com/fluxcd/flux2/discussions/2762](https://github.com/fluxcd/flux2/discussions/2762)

> No custom plugin support so can't really use tk directly. Instead you can pre-render your manifests (save them to Git) and have Flux use those. I ended up generating via tk export and wrapping with a kustomization.yaml that Flux v2 can use natively.
> [https://github.com/grafana/tanka/discussions/483](https://github.com/grafana/tanka/discussions/483)

- Fluxはkustomizeに寄っている感じがする
  - ArgoCDにOCIサポート入ったらArgoCDに移行するかも。Jsonnetで書きたいので...

# 終わりに

Gitless GitOps, GitからのOCI移行はあったけどOCIからスタートする例は見当たらなかったのでブログとして残しておきました。
今回はkindで手元でやるだけでしたが、そのうちおうちk8sにFlux入れようと思います。複数Appを定義するためにディレクトリ構成をいい感じにしたいですね。
