---
type: "chobi"
title: ""
draft: false
description: ""
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2025-10-09T06:14:00.162021888+09:00[Asia/Tokyo]"
---

# RSS読み(2025-10-09): ChatGPT Apps SDK, Opal Update, StackSets戦略

⛳ 手動のメモをAI要約させたものを元に軽くチェックした文章です。

## AIプラットフォーム・アプリ開発

### [Opal のクイックスタート｜npaka](https://note.com/npaka/n/ncde2447c74f0)

Google系の自然言語基盤でDifyのようにAIミニアプリを作成できる。概念実証やカスタムアプリに適する。

### [Opal のアップデート - 2025年10月7日｜npaka](https://note.com/npaka/n/nb4ed3d8fce10)

ノーコードでアプリを作成できる基盤として進化中。

### [ChatGPTのアプリのデザインガイドライン｜npaka](https://note.com/npaka/n/nd4671b4475b1)

ChatGPT内でユーザーが会話を中断せずにタスクを実行できる価値を重視。

### [Apps SDK](https://developers.openai.com/apps-sdk/?utm_source=chatgpt.com)

ChatGPT Apps向けSDK。プレビュー公開中で、年内にアプリ投稿が可能予定。

### [Gemini 2.5 Computer Use の概要｜npaka](https://note.com/npaka/n/n3104d25dae88)

UI操作可能なエージェントモデル。E2Eテストのデバッグやカンバン操作などに応用できそう。現状はWeb対応、モバイル最適化は今後。

---

## 開発ツール・言語

### [About Symlink on windows · Issue #14442 · oxc-project/oxc](https://github.com/oxc-project/oxc/issues/14442)

Windowsでテストが通らない問題報告。

### [formatter: Missing parens for `PrivateInExpression` · Issue #14437 · oxc-project/oxc](https://github.com/oxc-project/oxc/issues/14437)

括弧が抜けるformatterのバグ。

---

## クラウド・セキュリティ・インフラ

### [KubeCon + CloudNativeCon North America 2025 Co-Located Event Deep Dive: Open Source SecurityCon – Open Source Security Foundation](https://openssf.org/blog/2025/10/08/kubecon-cloudnativecon-north-america-2025-co-located-event-deep-dive-open-source-securitycon/)

クラウドネイティブとオープンソースセキュリティの最新動向。
関連: [Open Source SecurityCon セッション一覧](https://colocatedeventsna2025.sched.com/overview/type/Open+Source+SecurityCon?iframe=no)

### [StackSets Deployment Strategies: Balancing Speed, Safety, and Scale to Optimize Deployments for Different Organizational Needs | AWS DevOps & Developer Productivity Blog](https://aws.amazon.com/jp/blogs/devops/stacksets-deployment-strategies-balancing-speed-safety-and-scale-to-optimize-deployments-for-different-organizational-needs/)

CloudFormation StackSetsの展開戦略を解説。逐次展開・並行展開・段階展開の3パターンで規模やリスクに応じて最適化する。

### [Implement a secure MLOps platform based on Terraform and GitHub | Artificial Intelligence](https://aws.amazon.com/jp/blogs/machine-learning/implement-a-secure-mlops-platform-based-on-terraform-and-github/)

TerraformとGitHub ActionsでセキュアなMLOps基盤を構築。

### [AWS Common Runtime で Amazon S3 のスループットを高速化 | Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/improving-amazon-s3-throughput-for-the-aws-cli-and-boto3-with-the-aws-common-runtime/)

AWS SDKやCLIに導入されるCommon RuntimeによりS3転送速度を向上。

### [New general-purpose Amazon EC2 M8a instances are now available | AWS News Blog](https://aws.amazon.com/jp/blogs/aws/new-general-purpose-amazon-ec2-m8a-instances-are-now-available/)

M8aインスタンス登場。M7a比でCPU性能30%、メモリ帯域45%向上。

---

## AI・機械学習応用事例

### [Vxceed builds the perfect sales pitch for sales teams at scale using Amazon Bedrock | Artificial Intelligence](https://aws.amazon.com/jp/blogs/machine-learning/vxceed-builds-the-perfect-sales-pitch-for-sales-teams-at-scale-using-amazon-bedrock/)

複数のエージェントで営業用ピッチを自動生成。店舗情報から説得力あるストーリーを構築。

---

## データベース・分析

### [PostgreSQL18でのEXPLAINの更新を見る、あわせてEXPLAINを振り返る | フューチャー技術ブログ](https://future-architect.github.io/articles/20251008a/)

PostgreSQL 18でバッファ使用量自動表示などEXPLAINの改善。パフォーマンス分析が容易に。

---

## その他のAWS関連

### [AWS でのデジタル資産決済の処理 | Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/processing-digital-asset-payments-on-aws-jp/)

ブロックチェーンベースの決済処理。確認完了後に資金アクセス可能だが速度面に課題あり。

---

## GitHub関連ニュース

### [Upcoming deprecation of Claude Sonnet 3.5 - GitHub Changelog](https://github.blog/changelog/2025-10-07-upcoming-deprecation-of-claude-sonnet-3-5/)

Claude Sonnet 3.5の非推奨化。

### [GitHub now supports social login with Apple - GitHub Changelog](https://github.blog/changelog/2025-10-07-github-now-supports-social-login-with-apple/)

GitHubでAppleによるソーシャルログインが可能に。

# Next Action


- [ ] ChatGPT Apps SDKを眺める
- [ ] 検証したい
	- [ ] S3 Common Runtimeによる高速化設定を入れる
- [ ] 読みたい
	- [ ] CloudSecurityConの一覧
	- [ ] PostgresqlのEXPLAINの用語調べる
