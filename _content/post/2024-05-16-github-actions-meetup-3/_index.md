---
type: "post"
title: "GitHub Actions Meetup Tokyo #3 オンライン参加記"
draft: false
description: "Actionsの面白い話が聴けてよかったです。"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2024-05-16T20:28:21+09:00"
---

<!-- titleは自動で入る -->
# イベント概要

GitHub ActionsについてのLTが3本ありました。リアルイベントはAbema Towersで行われ、オンライン配信も同時にされました。

- connpass: [GitHub Actions Meetup Tokyo #3 - connpass](https://gaugt.connpass.com/event/317178/)
- アーカイブ動画のリンク: (TBD)

私はオンラインで参加したので各LTの内容と感想を書きます。

# JavaScript/TypeScript Action JavaScript/TypeScript でサードパーティー Action を書く / @piris314

@piris314 さんはGitHubでは [peaceiris](https://github.com/peaceiris) で活動されていて、主に静的ページのactionsで有名な方ですね。(僕も自分のブログで以前hugoを使っていたときに peaceiris/actions-hugo を使っていました！)
今回はそういったOSS活動を通して得られたActionを公開する側の知見が発表されていました。

資料: (TBD)

内容:

- GitHub Actionsを公開する際に、普通にコードを公開するのと異なるポイントは 「ビルドしたjsを `dist/` に置く必要がある」と「設定ファイルである `action.yml` を置く必要がある」の2点
  - `action.yml` もjs-yamlに食わせてテストしましょう
- [`@vercel/ncc`](https://github.com/vercel/ncc) が単一jsファイルにまとめられて便利なのでactions界隈でよく使われる
- リリース戦略
  - 現状提供しているのは semver, major, full commit hash の3つ
  - `@main` のようなブランチ指定はできないように工夫している
- js系はマージが大変
  - Renovateで依存ライブラリのバージョンタグの変更だけでなくビルド結果のdistの変更も一緒にPRに入れることで、distが変わらないなら即マージ、変わっているなら差分を精査するような運用をしている

感想やTwitter(X)の反応で知ったこと:

- `actions.yml` のテストは[ここ](https://github.com/peaceiris/actions-gh-pages/blob/main/__tests__/get-inputs.test.ts)とかが参考になるので後で見たい。
- ブランチ指定できないようにするのは優しさもあるけど、破壊的変更をした場合のOSSへのお問合せ対応が減りそうで嬉しさありそう。
- やっぱOSSで公開している人は知見や工夫が出てくるから僕もOSSで何か便利なもの作って経験積みたいと思いました。

# GitHub Actions の痒いところを埋めるサードパーティランナー / @d0ra1998

@d0ra1998 さんからGitHub Actionsセルフホストランナーを利用する際に、サードパーティランナー、いわゆるGitHub以外の会社が提供するカスタムランナーを利用する際のPros/Consが紹介されました。

資料: [GitHub Actionsの痒いところを埋めるサードパーティーランナー - Speaker Deck](https://speakerdeck.com/dora1998/github-actionsnoyang-itokorowomai-merusadopateiranna)

内容:

- 参考になるawesome: [neysofu/awesome-github-actions-runners: Save $$$ and make GitHub Actions go brrr with 3rd-party runners ⚡🤖](https://github.com/neysofu/awesome-github-actions-runners)
- サードパーティランナーの例は色々あるが、Namespaceが良さそうとのこと
- サードパーティランナーはGitHub-hostedに比べてランナーの起動時間に対する料金が半額くらい
  - ネットワーク料金はGitHub-hostedだとかからないが、サードパーティランナーについてもおそらく言及が見当たらなかったのでかからないことも多いのではとのこと
- クラウドストレージへのupload/download
  - S3を使う場合、AWS CodeBuildの方がGitHub-hostedよりも10倍早い
- ジョブのメトリクス
  - Namespaceは特に管理画面が充実している
- 起動時間がGitHub-hostedに比べてかかる
- cache, artifactはGitHub側と結びついているのでGitHub-hostedより遅い
- ランナーにツールが足りないことがある
  - Namespaceにはlessが標準で存在しない
- サードパーティランナーにリポジトリのAdministrator権限を渡すことになり、セキュリティ的に怖い

感想やTwitter(X)の反応で知ったこと:

- サイバーエージェントはmyshoesを使ってセルフホストランナーを利用しているので、サードパーティランナーを調査するモチベはあまり湧かない気がします(myshoesはMacOS runnerも提供しているはずで、かなり頑張っている印象) サードパーティランナーを調査するきっかけが地味に気になりました。myshoesで提供できないランナーとか、コスト面での話とかがあったのかな？
- 会場からの質問が盛り上がっていた。明らかにセルフホストランナー運営者が会場にたくさんいる感じで面白い。
  - 課金は1分単位？→GitHub-hostedと同じく1分単位が多い。AWS CodeBuildは細かい単位かも？ただ短い時間のジョブ目線では起動速度が遅いのでそこでサードパーティランナーのコストが上がってしまうところもある
  - GitHub Enterprise Serverでも使える？→検証してないのでわからず
  - オートスケールはうまくいく？→各社やってそう。ただスケール上限はあるのでそこに達するとそれ以上スケールしない
  - ネットワーク料金かかる？→言及がないのでGitHub-hosted同様かからないものが多いのでは
- Namespaceの管理画面、Metricsどんなものあるのか気になるから触ってみたいな

# E2Eテストワークフローを高速化・安定化させる取り組み / @r4mimu

@r4mimu さんから、FlakyなE2Eテストワークフローを、テスト以外の点で工夫して高速化・安定化する取り組みについて紹介されました。

資料: [E2Eテストワークフローを高速化・安定化させる取り組み \| ドクセル](https://www.docswell.com/s/r4mimu/ZXYR73-2024-05-16-184345)

内容:

- 他チームへの体験でプロダクトチームへ行ってE2Eテストワークフローを高速化・安定化した時の経験を元に話す
- E2Eテストワークフロー視点であり、E2Eテスト自体の話ではない
- 実行時間と安定性の2点がつらかった
  - ワークフローの実行時間に30分以上かかる
  - Flaky
- まずは計測
  - [Kesin11/actions-timeline: An Action shows timeline of a workflow in a run summary.](https://github.com/Kesin11/actions-timeline) を用いてE2Eテストの実行がボトルネックだと特定
  - [fchimpan/gh-workflow-stats: A GitHub CLI extension to calculate the success rate and execution time of workflows and jobs.](https://github.com/fchimpan/gh-workflow-stats) を用いてFlakyなのはセットアップ系も含まれることを特定
- service containerのpull rate limit
  - Docker Hubからのpullがrate limitに当たっている
  - ECRに移行して改善
- npm installが落ちる
  - キャッシュを効かせて緩和
  - リポジトリキャッシュ10GB制限を超えているので、feature branchでsaveせずmainでのみsaveするようにしている
- E2Eテストジョブのタイムアウト
  - 経験的に30分以内で成功することが多いので、長いものはタイムアウトして切る

感想やTwitter(X)の反応で知ったこと:

- 発表わかりやすい。話すことと話さないことで期待値調整をしていてその後の流れがわかりやすかった。
- やはり計測大事だなと感じた
- 原因が分からないところに対してできることで対応を打っていて成果を出していてすごい

# 終わりに

全体的にリアル会場盛り上がってそうでいいですね、Actions関連の面白い話が聴けるのは楽しい。次回開催未定とのことなので誰か頼む！
