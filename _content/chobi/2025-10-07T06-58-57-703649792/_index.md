---
type: "chobi"
title: ""
draft: false
description: ""
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2025-10-07T06:58:57.706403072+09:00[Asia/Tokyo]"
---

# RSS読み(2025-10-07): aws-mcp release note, deno v2.5.3, 週刊AWS

⛳ 手動のメモをAI要約させたものを元に軽くチェックした文章です。

## Conventional Comments

[conventional comments](https://github.com/pullpo-io/conventional-comments)
レビュー時のコメント形式を定義するガイドライン。観点整理に役立ちそう。

## MCP Release 2025.10.20251006150229

[Release 2025.10.20251006150229 · awslabs/mcp](https://github.com/awslabs/mcp/releases/tag/2025.10.20251006150229)
AuroraDBやRabbitMQとの連携強化。
`AWS_API_MCP_STATELESS_HTTP` が追加。
[関連PR](https://github.com/awslabs/mcp/pull/1349)
Bedrock AgentCore RuntimeでMCP Serverを動かす際に使用。
`AWS_API_MCP_TRANSPORT` が `"streamable-http"` の場合に利用可能で、リクエスト間の状態を保持しないモード。

## Oxc Linter Issues

[linter: Experimental jsPlugins not loading on windows · Issue #14375](https://github.com/oxc-project/oxc/issues/14375)
WindowsでnapiのテストをCIに含める必要がある。

[linter: `unicorn/no-useless-undefined` does not respect `checkArguments` option · Issue #14368](https://github.com/oxc-project/oxc/issues/14368)
評価順序に関するバグ。
[修正PR #14369](https://github.com/oxc-project/oxc/pull/14369/files)
ルール実装とテストが1ファイルで完結しており、コントリビューションチャンス来たら取り組んてみたいな。

## PostgreSQL UUIDv7

[PostgreSQL連載始まります & v18で対応したUUIDv7とv4の比較](https://future-architect.github.io/articles/20251006a/)
UUIDv4はBtreeと相性が悪い。UUIDv7は先頭にタイムスタンプを持つためソート可能。
用途に応じてSERIALが適する場合もある。

## Grok Code Fast 1

[Grok Code Fast 1 is now available in Visual Studio, JetBrains IDEs, Xcode, and Eclipse](https://github.blog/changelog/2025-10-06-grok-code-fast-1-is-now-available-in-visual-studio-jetbrains-ides-xcode-and-eclipse/)
主要IDEでGrokが利用可能に。

## 週刊Deno 2025/10/05

[2025/09/29〜2025/10/05の最新情報 | 週刊Deno](https://uki00a.github.io/deno-weekly/articles/2025/10/05.html)
v2.5.3でpermission brokerリリース。
typeScript-go連携PRあり。
[docs PR #2602](https://github.com/denoland/docs/pull/2602/files) のようなGitHub integrationが興味深い。

## LLVM Weekly #614

[LLVM Weekly - #614, October 6th 2025](https://llvmweekly.org/issue/614)
LLVM Runtimes Workshopのトピック募集。
LNT公式サーバーが停止しており、AWS上での再構築提案あり。
Victor Camposがbaremetal stdio実装案を提示。

## EC2 C8i / C8i-flex

[Introducing new compute-optimized Amazon EC2 C8i and C8i-flex instances](https://aws.amazon.com/jp/blogs/aws/introducing-new-compute-optimized-amazon-ec2-c8i-and-c8i-flex-instances/)
新しく来たインスタンスタイプ。

## IAM Identity Center

[AWS IAM Identity Center now supports customer-managed KMS keys for encryption at rest](https://aws.amazon.com/jp/blogs/aws/aws-iam-identity-center-now-supports-customer-managed-kms-keys-for-encryption-at-rest/)
AWS managed keyに加えてCustomer managed keyでも暗号化が可能に。BYOK文脈。

## PowerSchool × SageMaker

[Responsible AI: How PowerSchool safeguards millions of students with AI-powered content filtering using Amazon SageMaker AI](https://aws.amazon.com/jp/blogs/machine-learning/responsible-ai-how-powerschool-safeguards-millions-of-students-with-ai-powered-content-filtering-using-amazon-sagemaker-ai/)
教育分野向けAIアシスタント「PowerBuddy」。
誤検出率3.75%未満、平均応答1.5秒。
導入校で有害コンテンツ抑制効果を確認。
→この規模のコンテンツフィルタはガードレール事例としてすごそう

## AWS Outposts × Dell/HPE

[Dell および HPE との AWS Outposts サードパーティーストレージ統合の発表](https://aws.amazon.com/jp/blogs/news/announcing-aws-outposts-third-party-storage-integration-with-dell-and-hpe/)
Outposts環境でサードパーティ製ストレージをEC2のブートボリュームとして指定可能に。
ISCSI SanBoot（ネットワーク経由）とLocalboot（ローカルアクセス）をサポート。
OutpostsはAWSが管理するラックをオンプレに設置するサービス。お客様のところにマシンがあるのすごいな。

## Claude Sonnet 4.5

[Amazon Bedrock での Claude Sonnet 4.5 のご紹介](https://aws.amazon.com/jp/blogs/news/introducing-claude-sonnet-4-5-in-amazon-bedrock-anthropics-most-intelligent-model-best-for-coding-and-complex-agents/)
AgentCore連携強化。最近AgentCoreよく見かけるので触っておきたい。

## 週刊生成AI with AWS 2025/9/29

[週刊生成AI with AWS – 2025/9/29 週](https://aws.amazon.com/jp/blogs/news/weekly-genai-20250929/)
Bedrock Data Automationの文字起こし機能強化。

## 週刊AWS 2025/9/29

[週刊AWS – 2025/9/29週](https://aws.amazon.com/jp/blogs/news/aws-weekly-20250929/)
ECSでIPv6スケール事例。
CloudWatch Application Map GA。
Knowledge MCP Server GA。
OpenSearch IngestionでバッチAI推論対応。

## Integral Ad Science × OpenSearch

[Integral Ad Science scales over 100 M documents with Amazon OpenSearch Service](https://aws.amazon.com/jp/blogs/industries/integral-ad-science-scales-over-100-m-documents-with-amazon-opensearch-service/)
デジタルメディア品質最適化企業。
1億件/日のドキュメントを安定処理。
Kafka → Spark → OpenSearch/Deltaのパイプライン構成。
ベクトル検索とメタデータフィルタリングを活用。
