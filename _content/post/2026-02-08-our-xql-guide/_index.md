---
type: "post"
title: "俺たちのxQL完全ガイド を読んだ"
draft: false
description: "Observabilityに手を動かして軽く入門できる良い本です"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2026-02-08T08:01:55.746+09:00[Asia/Tokyo]"
  - summary: typo修正
    date: "2026-02-08T09:24:52.000+09:00[Asia/Tokyo]"
---

<!-- titleは自動で入る -->
以前2024/6に[技術書典16で購入した](https://blog.uta8a.net/post/2024-06-04-techbookfest)俺たちのxQL完全ガイドという本を読みました。
主題としてはメトリクス・ログ・トレースに対応するpromql, logql, traceqlの3つを用意された環境で手を動かして学べるというものです。Observabilityに手を動かして軽く入門できる点で今の僕にはちょうどいい本でした。
ただ環境が2024年仕様ということもあるのか、僕の手元では動かなかったので、修正したよという話も載せます。正直修正して動くようにするまでが一番学びになったかもしれん。すんなり動くよりガチャガチャする方が楽しくて学びになることってあるよね。

[俺たちのxQL完全ガイド - PromQL / LogQL / TraceQL 編 -：〆のラーメンまである倶楽部](https://techbookfest.org/product/vwEgK9fAmzRphNukv4E83P?productVariantID=b6iAh0AVyEs4hCUczPiy89)

# こんな人におすすめ

- Observabilityとはメトリクス・ログ・トレースということは知っているが、まだ具体的によく知らない人
  - PrometheusとかLokiを触りたいけど...という人にはぴったりだと思います

# 新しく学んだこと

- Prometheus, Loki, Tempoのサンプルアプリとして具体的な例をイメージできるようになった
  - 以前、最小サンプルアプリとして、200とランダムな値をずっと返す `/metrics` を書いてもあまり意味を感じられませんでした(もちろん初手としては有用)
  - 次のステップとして、どういうサンプルアプリを書いたらいいか？が疑問でしたが、この本を読んでイメージがつきました
  - 具体的には、k6による継続的な負荷をかける、k6のシナリオでランダムにリクエストを作る、複数サービス用意することでObservabilityが効力を発揮するような構成にする、といった点がイメージにつながりました。
- 実際にxQLを実行できた
  - 問題が本書の中に出てくるので、それを解いていくと頭を使いながらxQLを学べてよかったです。

# ハンズオン環境を復元する

やったことは以下の通り。ただ、これでもdocker composeで立ち上げるとunhealthyがいる(なんで動いてるんだろ)
修正する時に、元のコードでバージョンが固定されているのは助かりました。`:latest` を使わないのってサンプルコードでは大事だなと思いました。

ハンズオン環境のリンク: [https://github.com/codex-odyssey/xql-perfect-guide](https://github.com/codex-odyssey/xql-perfect-guide)
minioに関しては [公式のdocker composeファイル](https://github.com/minio/minio/blob/be7800c8136eadff2ba012412dd6c2e5fdcb548a/docs/orchestration/docker-compose/docker-compose.yaml) が参考になりました。

- lokiを3台構成にした
  - `loki-read`, `loki-write`, `loki-backend` の3台構成
  - lokiのexampleを参考にした [grafana/loki](https://github.com/grafana/loki/tree/5102ed059288ccaa0e39538c45ae840ff4424a95/examples/getting-started)
- loki-readにhealthcheckを追加して、grafanaのdepends_onでloki-readを追加して起動を待つ
- lokiのバージョンを更新(v3.0.0→v3.6.3)
- loki.yamlを書き換え
  - lokiのexampleを参考にした [grafana/loki](https://github.com/grafana/loki/tree/5102ed059288ccaa0e39538c45ae840ff4424a95/examples/getting-started)
  - `join_members` をloki-read, loki-write, loki-backendにする
  - `schema_config.configs[].from` を 2023-01-01 に変更
  - compactorを追加
- promtailの`clients[].url`をloki-writeに変更
- promtailのバージョンを更新(v2.9.6→latest)
  - ここはよく分からないので最新に上げてみたというのが本音
- logcliの `LOKI_ADDR` をloki-readに変更
- minioのバージョンを更新(`RELEASE.2024-04-06T05-26-02Z` → `RELEASE.2025-09-07T16-13-09Z`)
- minioのentrypoint, commandを削除して、新しく `command: 'server /export'` を追加
- minioのhealthcheckを追加して、loki-read, loki-writeに `depends_on: minio` を追加して起動を待つ
- grafanaのdatasource.ymlのlokiのURLをloki-readに変更

2026/02/08現在、[minioがOSSにおけるDocker版の提供をやめている](https://github.com/minio/minio/issues/21647#issuecomment-3418675115)ことを考えると、minio以外に書き直すのも選択肢としては入ってきそうです。
個人的にはこういう環境をベースにして色々実験したいので、xQL完全ガイドで学んだサンプルアプリのコツを元にして自分でゼロから一連のObservabilityツールが試せる環境を書いてみるつもりです。

# 細かい気づき

p.3にある構成図がとてもよかったです。クエリ投げる時に結構参照しました。今読んでいる[オブザーバビリティ・エンジニアリング](https://www.oreilly.co.jp/books/9784814400126/)で、「昔は経験豊富なエンジニアの直観で障害対応できてたけど、これからは障害の再現性が無くなるからObservabilityツールを駆使する好奇心あふれるエンジニアが障害対応で活躍する」みたいなことが書かれています。僕はそれを読んでもほんまか？という感じだったのですが、この本での体験を踏まえると「ソースコードの中身を全く把握してなくても、p.3くらいの粒度の構成図があればObservabilityツールを用いたクエリが可能だし、その結果の意味も読み取れる」という気持ちになりました。

また、lokiで [ip関数](https://grafana.com/docs/loki/latest/query/ip/) が使えることを知って関数を調べました。
2026/02/08時点での最新の3.6.xのドキュメントを読んでいて、[文字列操作系](https://grafana.com/docs/loki/v3.6.x/query/template_functions/#string-manipulation)が豊富にあるのは面白かったです。
ただ、ip関数はかなり特殊っぽい気もしました。

他には、問題を解いていると案外愚直に書くんだと思った場面がありました。例えば以下のようなクエリを書くのですが、 `sum(count_over_time({service_name="chef-service"}...` の部分を変数化したい気持ちになります。案外愚直に書いている雰囲気を感じたので、実際計算がどうなっているのか(一度行われたクエリは同じ計算式の中ではキャッシュされるとか)気になります。

```text
sum(count_over_time({service_name="chef-service"} |= "材料を使用" | json | material="シイタケ" [5m])) / sum(count_over_time({service_name="chef-service"} |= "材料を使用" [5m]))
```

# Future work

将来的にやりたいことは以下の3つです。

- Observabilityツール各種が試せる環境を書いてみる
- [ISUCONでObservabilityを活用したmazreanさんの記事](https://trap.jp/post/2434/) を読んでから試してみたかったので、今なら試せると思います
- CNCF Observability whitepaperを読みたい

CNCF Observability whitepaperについて、見に行ったら[2025/12にリポジトリがアーカイブされていた](https://github.com/cncf/tag-observability/blob/main/whitepaper.md)ので驚きました。
cncf/tag-observabilityリポジトリには経緯が何も書かれていないので推測になりますが、おそらくObservabilityはOperational Resilience groupで扱われる範囲の一部になったようです。

- 現在[tag-observability](https://lists.cncf.io/g/cncf-tag-observability)はlockされている
- [10 Years in Cloud Native: TOC Restructures Technical Groups \| CNCF](https://www.cncf.io/blog/2025/05/07/10-years-in-cloud-native-toc-restructures-technical-groups/) でCNCFの再編が行われたこと、ObservabilityがOperational Resilience groupの一部になったことが確認できる
- [TAG Operational Resilience \| CNCF Contributors](https://contribute.cncf.io/community/tags/operational-resilience/#initiatives) で2026/02/08現在active initiativesの中に、[\[Initiative\]: Cloud Native Observability Personas · Issue #2037 · cncf/toc](https://github.com/cncf/toc/issues/2037) がある。このissueの中で「Observability Whitepaper v1.1+」への言及がある。

現在の[アーカイブされている方のCNCF whitepaper](https://github.com/cncf/tag-observability/blob/main/whitepaper.md)は2023年時点の認識だと思っておくのが良さそうです。
将来読む時はこのへんの事情も込みで、v1.1+が出てないか確認するところから始めたいですね。
