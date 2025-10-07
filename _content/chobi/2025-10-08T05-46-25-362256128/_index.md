---
type: "chobi"
title: ""
draft: false
description: ""
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2025-10-08T05:46:25.363849216+09:00[Asia/Tokyo]"
---

# RSS読み(2025-10-08): AgentKitとNova Act, CloudFormation Guard Hooks, Codex GA

⛳ 手動のメモをAI要約させたものを元に軽くチェックした文章です。

## AI・エージェント

### [Agent Builder のクイックスタート](https://note.com/npaka/n/n31196e2aa04f)

Difyのようなインターフェースを持つエージェント構築ツール。マルチエージェントにも対応。

### [AgentKit の概要](https://note.com/npaka/n/n778ab510cf10)

Evals: エージェントの評価や改善を行うための仕組み。
MCPとGuardRailsを組み合わせると堅牢な構成にできる。

### [Apps in ChatGPT ・ Apps SDK の概要](https://note.com/npaka/n/nce50143f6064)

ChatGPT内でアプリを展開できる新しい仕組み。アプリのインターフェースがチャット形式になっていきそう。

### [Codex の新機能 - Codex in Slack ・ Codex SDK ・ 新しい管理ツール](https://note.com/npaka/n/n0d25ea8156f1)

CodexがGAになり、Slack連携やCLIツールが提供されました。特に[GitHub Actions用Codex CLI](https://github.com/openai/codex-action)に興味がある。

---

## 生成AI・クリエイティブ

### [Sora 2 プロンプトガイド](https://note.com/npaka/n/n754187f14a03)

Sora 2でのプロンプトテクニックを詳しく解説しています。映像生成における言語化は、絵を描く際の発想にも役立ちそう。

### [Sora 2 API の概要](https://note.com/npaka/n/n819703d6d854)

Sora 2のAPIを紹介しています。特に動画をリミックスできる機能が特徴的。

---

## AWS・クラウドガバナンス

### [Moeve: Controlling resource deployment at scale with AWS CloudFormation Guard Hooks](https://aws.amazon.com/jp/blogs/devops/moeve-controlling-resource-deployment-at-scale-with-aws-cloudformation-guard-hooks/)

CloudFormation Guard Hooksは、リソースの作成前に設定を検証し、組織ポリシーに違反するデプロイを防ぐ仕組みです。OU単位でルールを適用できる。

### [Beyond Bootstrap: Bootstrapless CDK Deployments at GoDaddy](https://aws.amazon.com/jp/blogs/devops/beyond-bootstrap-bootstrapless-cdk-deployments-at-godaddy/)

CDKのブートストラップ処理を不要にするデプロイ手法です。組織で管理されたS3バケットを使い、CI経由でアセットをアップロードしてデプロイします。

### [New AWS whitepaper: Security Overview of Amazon EKS Auto Mode](https://aws.amazon.com/jp/blogs/security/new-aws-whitepaper-security-overview-of-amazon-eks-auto-mode/)

EKS Auto Modeのセキュリティ概要をまとめたホワイトペーパーです。AWS側がノード運用を担当し、VPC統合など安全性の高い設計になっています。

### [AWS re:Invent 2025 におけるクラウドガバナンスの必須ガイド](https://aws.amazon.com/jp/blogs/news/your-essential-guide-to-cloud-governance-at-aws-reinvent-2025/)

re:Invent 2025で注目のクラウドガバナンストラックの紹介。

---

## AWS・データ統合と可観測性

### [Seamlessly Integrate Data on Google BigQuery and ClickHouse Cloud with AWS Glue](https://aws.amazon.com/jp/blogs/big-data/seamlessly-integrate-data-on-google-bigquery-and-clickhouse-cloud-with-aws-glue/)

BigQueryとClickHouse CloudをAWS Glueで統合する手法を紹介しています。マルチクラウドデータ分析を容易にする構成です。

### [Monitor Amazon Timestream for InfluxDB performance using the Timestream for InfluxDB Metrics dashboard](https://aws.amazon.com/jp/blogs/database/monitor-amazon-timestream-for-influxdb-performance-using-the-timestream-for-influxdb-metrics-dashboard/)

Timestream for InfluxDBのパフォーマンス監視を行うダッシュボードです。Managed Grafanaを利用してメトリクスを可視化します。

### [Amazon CloudWatch Application Signals new enhancements for application monitoring](https://aws.amazon.com/jp/blogs/mt/amazon-cloudwatch-application-signals-new-enhancements-for-application-monitoring/)

CloudWatch Application Signalsに新機能が追加されました。依存関係のグルーピング、SLI違反検出、デプロイ時刻の表示などが可能になり、トラブルシュートが容易になります。

### [Automate Amazon QuickSight data stories creation with agentic AI using Amazon Nova Act](https://aws.amazon.com/jp/blogs/machine-learning/automate-amazon-quicksight-data-stories-creation-with-agentic-ai-using-amazon-nova-act/)

QuickSightのData StoriesをNova Actで自動生成する方法を紹介しています。Nova Actはチャット型ではなく、実際の操作を行うエージェントのように動作します。

---

## GitHub・開発ツール

### [Enterprise access restrictions now supports multiple enterprises - GitHub Changelog](https://github.blog/changelog/2025-10-06-enterprise-access-restrictions-now-supports-multiple-enterprises/)

GitHub Enterprise Access Restrictionが複数エンタープライズをサポートしました。複数組織を跨ぐアクセス制御が容易になります。

### [linter: Add support for scoped packages in `extends` keyword inside configuration files · Issue #14413 · oxc-project/oxc](https://github.com/oxc-project/oxc/issues/14413)

oxlintの共有設定でscoped packageが使えるようになる改善提案です。monorepoでのsharable config利用がしやすくなります。

### [language_server: warning log will be output to the language server · Issue #14402 · oxc-project/oxc](https://github.com/oxc-project/oxc/issues/14402)

言語サーバーでの警告出力に関する修正です。既に対応済みとのことです。

### [language_server: disable comments are not respected by type aware rules · Issue #14396 · oxc-project/oxc](https://github.com/oxc-project/oxc/issues/14396)

linterでのdisableコメントがtype awareルールで反映されない問題です。VS Codeでは反映されない場合があるようです。
