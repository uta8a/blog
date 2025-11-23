---
type: "post"
title: "AWS re:Invent予選落ちアプデを雑に紹介(2025)"
draft: false
description: "11/15 - 11/22までのWhat's New with AWSを読みました"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2025-11-23T18:49:39.508+09:00[Asia/Tokyo]"
---

<!-- titleは自動で入る -->
寒くなってきましたね。AWS re:Invent 2025が近づいています。

re:Inventに向けた11月は、re:Inventでのお披露目よりも一足先に発表される「AWS re:Invent予選落ち」または「pre:Invent」なアップデートが楽しみな季節です。
予選落ち、とかはコミュニティ界隈の用語で公式用語ではなく、「ええっ、これがre:Inventで発表されないのか...(一体re:Inventでは何が発表されるんだ...という期待の高まり)」とか、「re:Inventよりむしろ予選落ちのアプデの方が渋いアプデ多くて好き」という人もいるそうです。

人それぞれ好きなアプデがあると思いますが、僕も書こうと思います。好きな予選落ちアプデ発表ドラゴンですね。

# 概要

## 調査方法と範囲

[What's New with AWS](https://aws.amazon.com/new/) を11/15 - 11/22まで、216個のアップデート情報を眺めました。

調査に当たって、ChatGPT(ChatGPT 5.1)を補助として使いました。以下のプロンプトを使っています。

```text
以下、URLが渡されます。それはAWSのアップデート情報です。
- 日本語で回答
- 以下を含める
  - サービスの説明と、概要
  - どこが新しくなったのか、従来との変更差分の解説
```

## 所感

雑な感想を書きます。

### 耐量子計算機暗号(PQC)対応の話題が多い

通信保護は通信ログを保存して後の時代に復号されたりしないように先手を打って対応する必要があり、量子コンピュータでも解読できないような暗号の対応が入っていました。

- [AWS Payments Cryptography](https://aws.amazon.com/about-aws/whats-new/2025/11/aws-payments-cryptography-post-quantum-data-transit/)
- [ALB, NLBのTLS key exchange](https://aws.amazon.com/about-aws/whats-new/2025/11/network-load-balancers-post-quantum-key-exchange-tls/)
- [S3 endpoint](https://aws.amazon.com/about-aws/whats-new/2025/11/s3-post-quantum-tls-key-exchange-endpoints/)

### データ分析やAI系アプデ多い

SageMaker系を列挙してみました。それだけでもこんなにある...
個人的には強いマシンやGPU利用時のObservability向上みたいな話もあって、GPUを使って生成AIモデルをカスタムするような人向けに充実してきている感覚を持ちました。

- [Athena for Apache SparkとSageMaker notebook統合](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-athena-apache-spark-sagemaker-notebooks/)
- [SageMakerのワンクリックオンボーディング](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-sagemaker-one-click-onboarding-existing-datasets/)
- [SageMakerにAI Agent](https://aws.amazon.com/about-aws/whats-new/2025/11/notebooks-built-in-ai-agent-amazon-sagemaker/)
- [AIアクセラレーター基盤HyperPodとNotebookを一つのクラスタにまとめる](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-sagemaker-hyperpod-ides-notebooks-ai/)
- [ログインし直しを減らせる長時間セッションサポート(企業IdP使う)](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-sagemaker-studio-long-running-sessions/)
- [SSOでEMR on EKSをSageMakerから利用可能に](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-sagemaker-emr-eks-sso/)
- [SageMaker Catalogでビジネス用語をpublish前に強制](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-sagemaker-catalog-metadata-rules-glossary-terms/)
- [SageMaker Catalogの列レベルメタデータ付与](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-sagemaker-catalog-column-level-metadata-forms/)
- [SageMaker Catalogでconsumer書き戻しサポート](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-sagemaker-catalog-read-write-access-amazon-s3/)

### Image Builderがworkflowみが増している

Image Builderがどんどん進化している... なんかGitHub Actionsのworkflowみたいなものを感じます。

- [Image Builderでバージョンの自動採番](https://aws.amazon.com/about-aws/whats-new/2025/11/ec2-image-builder-auto-versioning-infrastructure/)
- [AMIの配布時に、作成プロセスをshareしたり承認待ち処理を入れたりできるように](https://aws.amazon.com/about-aws/whats-new/2025/11/announcing-flexible-ami-distribution-ec2-image-builder/)
- [Image Builderでworkflow内でlambdaやstep function呼び出しが可能に](https://aws.amazon.com/jp/about-aws/whats-new/2025/11/ec2-image-builder-lambda-step-functions/)

### WAFやCloudFrontのアプデもある

この辺って枯れた技術、安定しているものを感じていたのですがまだまだアプデがあるんですね。すごい
感覚的にはWebの先進的な仕組みを先回りしてサポート、みたいに見えます。

- [Web Bot Authをサポート](https://aws.amazon.com/about-aws/whats-new/2025/11/aws-waf-web-bot-auth-support/)
- [CloudFront Functionsの強化 - エッジロケーションが取れたり、クエリ文字列のrawが取れたり](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-cloudfront-3-functions-capabilities/)
- [CBOR Web Tokens, Common Access Tokensサポート](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-cloudfront-cbor-tokens/)
- [CloudFront→origin間をTLS1.3に](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-cloudfront-tls13-origin/)
- [CloudFrontの定額利用プラン](https://aws.amazon.com/jp/about-aws/whats-new/2025/11/aws-flat-rate-pricing-plans/)

### IPv6サポート増えた

IPv6サポートが増えました。なかなかIPv6 onlyに踏み切るのは難しいですが、こうして増えてくると場合によっては検討できるようになってきそうで嬉しいですね。

- [STS](https://aws.amazon.com/jp/about-aws/whats-new/2025/11/aws-sts-ipv6/)
- [Workspace Applications](https://aws.amazon.com/jp/about-aws/whats-new/2025/11/amazon-appstream-2-0-supports-ipv6/)
- [Route53 DNSサービスエンドポイント](https://aws.amazon.com/jp/about-aws/whats-new/2025/11/amazon-route-53-dns-service-ipv6-api-endpoint/)
- [IoT](https://aws.amazon.com/about-aws/whats-new/2025/11/aws-iot-services-vpc-endpoints-ipv6-connectivity/)

# 特に印象に残ったアップデートの紹介

個別紹介をしていきます。

## これが予選落ちなんですか...？シリーズ

[S3が属性ベースアクセスコントロールをサポート](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-s3-attribute-based-access-control/)

これデカすぎる。これまではbucket policy, IAM policyに対するbucket ARNで制御していたところを、bucket, user, roleのタグベースで判定できるようになった。

[API Gatewayでレスポンスストリーミングがサポート](https://aws.amazon.com/about-aws/whats-new/2025/11/api-gateway-response-streaming-rest-apis/)

これAIでchunk送ってる人たちみんな嬉しいのでは...？payload sizeが10MB超えられるらしくてアツい。デカい。

## ロール管理を減らす取り組み

[Invoice PDFの入ったS3 presigned URLがAPIで取得可能に](https://aws.amazon.com/about-aws/whats-new/2025/11/get-invoice-pdf-api/)

Invoiceを扱うチームにPDFを渡す時に、特定ロールつけて取りに行ってもらう必要がなくなりそう。ロール管理が減らせるのでは。

[Partnerに対して一時的に権限を委任できるIAM Temporary delegation](https://aws.amazon.com/about-aws/whats-new/2025/11/streamline-integration-partner-products-iam-delegation/)

これすごい。外部の人が支援に入る時は専用ロールが必要だったりするはずなんだけど、それが要らなくなる。

## 運用観点で未来を感じる

[Cloudwatch Logs Insightsでクエリを定期実行可能に](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-cloudwatch-scheduled-queries/)

ちょっと気になる現象を毎日クエリして短期的に継続して調査したいなって時に使えそう。ログ分析の定期的な実行ができるのは嬉しい。

[Cloudwatch Application Signalsの改善](https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-cloudwatch-application-signals-adds-github-action-mcp-server-improvements/)

GitHub Actionsとのintegration？まだ分かってないけど、GitHub Actionsを使って `@awsapm` とかメンションをIssueやPRですると調査を対話的に開始できる、というのはAWS画面を見に行かないで済むので未来の開発体験という感じがする。

## IaC系のアプデ

[CloudFormationのchagesetの早期検証が入った & 失敗原因の調査がdescribe-events APIで可能に](https://aws.amazon.com/jp/about-aws/whats-new/2025/11/cloudformation-dev-test-cycle-validation-troubleshooting/)

これ後半のOperation IDを使ったdescribe-events APIでデプロイ失敗原因の調査ができるやつ嬉しい。CloudTrailを見に行く必要のあるデプロイ失敗も割とあるので、その前に解決できる範囲が広くなると嬉しい。

[CloudFormationの構成ドリフトに対するdrift-aware change sets](https://aws.amazon.com/jp/about-aws/whats-new/2025/11/configuration-drift-enhanced-cloudformation-sets/)

三者比較（テンプレート／前回デプロイ状態／実リソース状態） が可能に。revert drift modeが追加。このへんのドリフトの処理がやりやすくなりそうで嬉しい。

# 終わりに

普段はRSSでなんとなく興味のある範囲を追っているだけなのですが、本腰を入れてAWS Newsを眺め続けるのもいいなと思いました。
今年のre:Inventが楽しみになりました。来週のアプデ、そしてre:Inventが楽しみですね〜！
