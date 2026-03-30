---
type: "post"
title: "Flattのウェビナーが最近のGitHub Actions侵害のキャッチアップにちょうど良かった"
draft: false
description: "GMO Flatt Securityのウェビナー「GitHub Actions侵害 — 相次ぐ事例を振り返り、次なる脅威に備える」の感想"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2026-03-30T19:26:30.9972771+09:00[Asia/Tokyo]"
---

<!-- titleは自動で入る -->
この記事ではGMO Flatt Securityのウェビナーが良かったぞという話をします。2026/03/30時点でウェビナーの資料・動画が公開されているので見てみてください。

- 資料: [https://speakerdeck.com/flatt_security/github-actionsqin-hai-xiang-ci-gushi-li-wozhen-rifan-ri-ci-naruxie-wei-nibei-eru](https://speakerdeck.com/flatt_security/github-actionsqin-hai-xiang-ci-gushi-li-wozhen-rifan-ri-ci-naruxie-wei-nibei-eru)
- 動画アーカイブ: [https://youtu.be/TtpgsKE9itQ?si=0EStAlWk6IwnrrC4](https://youtu.be/TtpgsKE9itQ?si=0EStAlWk6IwnrrC4)
- 告知: [https://flatt.tech/takumi/event/github-actions-compromise-202603](https://flatt.tech/takumi/event/github-actions-compromise-202603)

このウェビナーはTwitterで見かけて lmt\_swallowさん が発表するというので観に行きました。lmt\_swallowさんは最近のTrivyに始まる一連のGitHub Actionsの件で記事を書いているので、以下の記事を観たことがある人もいるかと思います。僕も当時GitHub Issues, Discussionsを追いかけていたので、その参考にしていました。

- [2026年3月19日の Trivy 再侵害の概要と対応指針 – やっていく気持ち](https://diary.shift-js.info/trivy-compromise/)
- [2026年3月24日の LiteLLM 侵害の概要と対応指針 – やっていく気持ち](https://diary.shift-js.info/litellm-compromise/)
- [2026年3月27日の Telnyx 侵害の概要と対応指針 – やっていく気持ち](https://diary.shift-js.info/telnyx-compromise/)

僕は以前からlmt\_swallowさんが信頼できる技術者だと思っていたので、今回のウェビナーで何かしら有益なソフトウェアサプライチェーンに関する話が聞けるかもしれない...！と期待して聴くことにしました。

# 感想

まず僕の立場を明確にしておくと、会社ではセルフホストランナーの運用に関わっていて、GitHubに詳しい部署にいます。過去に[FindyのイベントでGitHub Actionsに関して登壇](https://www.docswell.com/s/uta8a/KYDW9P-2024-08-22-github-actions-tips)もしているので、人並みにGitHub Actionsに対して気持ちが入っています。セキュリティの専門家ではないです。(念の為断っておきますが、この記事は会社の公式見解ではなく僕の個人的な感想記事です)

GitHub Actionsとサプライチェーンセキュリティに関して少し考えたことがある人なら、巷の「GitHub Actionsはハッシュ固定しよう！」とかは耳にタコができるほど聞いていると思うので、「もっとその一歩先を教えてくれよ...」という気持ちになったことがあると思います。実際、ハッシュ固定するだけでアップデートをホイホイするのであれば侵害は防げませんし、ハッシュ固定があらゆる攻撃手段に対する防御策になるかというとそうでもないです。

今回のFlattのウェビナーではそうした一歩先に向かうために必須となる、最近の侵害の事情と考え方が示されていたように思います。もちろん万能な解決策が示されているわけではないのですが、攻撃手段を理解して、どのような考え方で対策していけば良いかが分かれば、自然と真っ当な対策を思いついたり、判断することができます。これから対応をしていく備えとしては十分でしょう。

## GitHub Actions侵害に関して、技術詳細に触れるレベルでまとまっていて良かった

[事例の振り返りパート](https://speakerdeck.com/flatt_security/github-actionsqin-hai-xiang-ci-gushi-li-wozhen-rifan-ri-ci-naruxie-wei-nibei-eru?slide=5) で、reviewdog/tj-actions/Shai-Hulud/TeamPCP(Trivy, LiteLLM, Telnyx)について紹介がされています。個人的にそれぞれ攻撃手法は把握していたのですが、ここまで丁寧に、かつ踏み込んだ解説がまとまっているのは見たことがあまりないのでキャッチアップに向いていると思いました。
こういったソフトウェアサプライチェーンセキュリティに関しては、巷でよく"`pull_request_target` が原因で攻撃された"みたいなふわっとした説明がなされますが、それでは真に理解したことにはなりません。残念ながら今のGitHub ActionsとGitHubの仕様はSecureであるとは言えないので、攻撃手法をコードレベルで理解しておいて、その亜種が起きた時でも対応できるように頭の中に事例をストックしておいた方がいいです。

その点で、このウェビナーの事例の振り返りパートは攻撃手法のうちどこに着目すべきかがまとまっていていいなと思いました。

## 備えに関して、Takumi Guard/Runnerだけでない紹介がされていて良かった

きっと会社のウェビナーなので備えパートはTakumi Guard/Runnerの宣伝になるだろうと思っていたのですが、実際は時間の都合もあって宣伝はほとんどなく、[備えパート](https://speakerdeck.com/flatt_security/github-actionsqin-hai-xiang-ci-gushi-li-wozhen-rifan-ri-ci-naruxie-wei-nibei-eru?slide=31)も考え方の部分はTakumiを使わない人にとっても役立つ内容で驚きました。

外部のSaaSを使うときはセキュリティチェックシートを使うのに、package.jsonの中身に1行足すのはそれに比べて気軽に行われているというのは確かになあと思いました。実際形式的な部分を割り引いて考えても、もっと外部の依存を減らす方向に持っていくべき/依存を足すなら精査すべきというのは正しいと思います。

また、紹介されていた4本の柱のうちDevOps系のアーキテクチャに関するものはそうだよ...！そうなんだよ...！と首がもげるくらい頷いていました。

# 終わりに

今回のFlattのウェビナーは、これまでのGitHub Actions侵害の件に関してGitHub Issues, Discussions, 各セキュリティ企業から出ていたレポートを把握している人なら新しく得るものはそれほどなく、よくまとまっている...！社内に展開したい...！みたいな気持ちになると思います。それ以外の人で興味を持たれた方はぜひ[資料](https://speakerdeck.com/flatt_security/github-actionsqin-hai-xiang-ci-gushi-li-wozhen-rifan-ri-ci-naruxie-wei-nibei-eru)を読んだり[動画](https://youtu.be/TtpgsKE9itQ?si=5zzonFSlX5h8jzW-)を視聴してみると良いと思います。

---

# さらにその先へ

あんまり外にソフトウェアサプライチェーンセキュリティの話したくないですが、書ける範囲で書きたくなったので、普段考えていることを少し書きます。
ウェビナーの話とは関連しつつウェビナーの内容から外れる話も書きます。

## 依存関係を固定するのはいいけれど...

依存関係の固定は必須で大切なのですが、それでも問題は残ります。

- 依存関係を"入れる"とき
- 依存関係を"更新する"とき
- "いつ"依存関係の更新が"どこで"走る

実際依存を減らす方向に持っていくしかないと思っています。ウェビナーで"厳しい目線と仕組み"とありましたが、個人的にはxz-utils backdoorの件などを踏まえて人間が精査するには難しい時代になっていると感じます。これはAIでも同等で、AIと人間が協力した上で強力な仕組みのサポートの元にジャッジが下せると思っています。
例えば、GitHub Actionsが更新されるときにソースコードを見ている人はいますか？では、生成された `dist/index.js` を検査する仕組みを持っている組織はどれほどいるでしょうか？真面目にGitHub Actionsを見ている人なら分かってくれると思いますが、多くのactionsにおいて `dist/index.js` の来歴がしっかりしているものは少ないです。メンテナが手元で生成してコミットしていることも多くあります。GitHubはImmutable Actionsを打ち出していましたが、それもRoadmapからなくなってしまいました。

結局のところ固定は初歩の初歩にすぎず、依存が変化する瞬間をどうセキュアにするかというところがポイントだと思っています。逆に言うと、固定すらしていない場合は、"依存が変化する瞬間という危険性"をCIを走らせるたびに受け入れているということです。

個人的には最近CIも本番環境と同様に扱うべきだと思っています。本番環境をオンコールで対応するように、CI環境もオンコールをつけるか、それができないならCIを走らせる時間帯を制限するべきです。また、技術的には "強力な仕組み" が難しいと思っていて、Flattのスライドにも書かれていますが推移的依存をどうするかはかなり難しいです。結局 [google/capslock](https://github.com/google/capslock) のようなアップデート時に権限差分を静的に評価する発想と、sandboxでの動的評価の組み合わせになると思っています。この仕組みをやるととても重いので、セキュリティ企業に頼った方がいい部分だと感じます。

## DevOpsのセキュリティは、デプロイパイプラインのセキュリティにつながっている

本質的にはCIに限らずデプロイパイプラインのうちどこが弱いんですか？という話だと思っていて、ここはTakumi Runnerのようなセキュリティソリューションを入れて完了とはできないと考えています。根本的に、コードが生まれ/外から取ってきて/ビルドして/テストして/デプロイされてお客様に届く、そういった一連のデプロイパイプラインのセキュリティ水準の最低ラインを上げていくことが必要だと思います。

そうした点で、CI/CD環境のログ・テレメトリを強化しましょうというのは完全に同意です。
