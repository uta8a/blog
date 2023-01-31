---
layout: post
title: 入門インフラリンク集を読んで、今後の方針を固めました
description: インフラ領域の勉強方針
draft: false
changelog:
  - summary: 記事作成
    date: 2021-02-18T10:57:25+09:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
---

- [【入門】インフラやるなら知っておきたいトピックのリンク集](https://qiita.com/tomoyk/items/ece0beed9c174c66ee6a) でおすすめされていたリンクを一通り目を通し、疑問に思ったことや、さらに読みたいことをメモしたものになります。
- awesome-x などのリンク集は、雑多に集められていて読み切る時間が無理で詰んでしまいがちですが、このリンク集は初心者向けに軽いものが多く、概観を掴んだり、インフラの聞いたことあるけど...みたいなトピックを勉強する手がかりが得られたので、全体量がちょうどよいまとめだと思います。
- それでは、各トピックについて僕の感想とかこれから勉強したいことを書きます。

# # HTTP

## ## まとめ

- ブラウザで URL を打ち込んでからページがレンダリングされてユーザに届くまで何が起きているか、ネットワーク視点での話
- HTTP/2.0 の最終ドラフトが 2015 年に承認されたの最近だなと感じた。

## ## これから

- CSP 周り、ブラウザの挙動: [Web ブラウザセキュリティ ― Web アプリケーションの安全性を支える仕組みを整理する](https://www.lambdanote.com/collections/frontpage/products/wbs)
- Keep-Alive などの HTTP Header について知りたい: [MDN HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) と RFC を適宜読みに行くとよさそう
- サーバプッシュの現在の主なやり方、仕組みの理解(WebSocket だろうか？)
- HTTP/3 って今どうなっているんだろう: [flano-yuki/my-quic-spec-translation](https://github.com/flano-yuki/my-quic-spec-translation) や [flano-yuki/http3-note](https://github.com/flano-yuki/http3-note)
- [Burp](https://portswigger.net/burp/communitydownload) や [Zap](https://github.com/zaproxy/zaproxy) を入れて OWASP などのやられアプリで遊ぶ
- [websecacademy](https://portswigger.net/web-security) で Web セキュリティ学ぶ

# # REST

## ## まとめ

- URL と URI の違いってなに
- https://tools.ietf.org/html/rfc3986#section-1.1.3
- RFC3986 によると、URI はでかい概念で、URL(location)と、URN(name)を含む大きな集合。
- また、スキーム http は URL に含まれる(RFC1738 3.1 https://tools.ietf.org/html/rfc1738#section-3.1 )
- url は変更されても良くて、urn は名前なので一意で変更されないことを前提としている。
- 個人的な感想として、時代的には URL も変更されてほしくない感じがあるけど...

## ## これから

- よむ: Roy Fielding の論文 REST についても触れられている https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm

# # キャッシュ/KVS

## ## まとめ

- RDB に比べてシンプルで、高い性能とスケーラビリティを実現するために KVS
- KVS、単なる Map だと思っていたがそうでもなかった。複雑で面白い。
- 記事では KVS が Facebook や Amazon のもののような印象を受けたが、現在では Redis が普通に使われている気がするので、大規模データでなくても KVS が嬉しい理由がある気がする。

## ## これから

- Redis を触ってみる
- KVS は大量のサーバに分散させたほうが力技ができるということは、大量データがなければ嬉しさがあまりないのだろうか？つまり、小さな規模では RDB で十分なのか？(それとも小さくても KVS が嬉しい時があるのか)

# # CDN

## ## まとめ

- 規模が大きくてネットワーク周りわからないことが多かった。

## ## これから

- サーバを介すという点で proxy と CDN サーバは似ているが決定的に違う気がする。これに明確な説明を与えたい。
- Netflix の CDN が SoTA らしいので、調べてみる
- 専門用語調べる(ショートセッション、ラウンドロビン、BGP)
- やる: [Linux で動かしながら学ぶ TCP/IP ネットワーク入門 Kindle 版](https://www.amazon.co.jp/dp/B085BG8CH5/)
- よむ: [マスタリング TCP/IP シリーズ](https://www.ohmsha.co.jp/tbc/text_series_0201.htm)
- ルーター実機で通信したりパケットの中身を見て遊ぶ
- やる: [trap インターネットを作ってみよう](https://trap.jp/post/1152/)
- やる: Cisco の資格本

# # ネットワーク

## ## まとめ

- トラブルシューティングができるようになって、ネットワークを知っておけば問題の切り分けができるようになる
- [Docker で始めるネットワーク実験入門 2020-5-30 C-4](https://youtu.be/_gaeI56vmPI) がよかった。

## ## これから

- よむ: BGP in the data center https://foobaron.hatenablog.com/entry/bgp-in-the-data-center-01
- Docker でネットワーク構成して実験する
- k8s でも手で作るとネットワークへの理解が深まると聞いたことがあるので調べる

# # NAT/プロキシ

## ## まとめ

- DHCP の仕組み、NAT の仕組みと NAT ルータの実現

## ## これから

- ゲートウェイという概念があまり良くわかっていない
- iptables を使って NAT ルータが Raspberry pi とかで作れるんじゃないか？調べてみる

# # Firewall

## ## まとめ

- ファイアウォールの方式は IP/port のパケットフィルタ方式以外にも、アプリケーションゲートウェイのように中身のデータを見るものもある。

## ## これから

- GCP だとファイアウォールをリソースとして指定するけど、あれは実質 iptables なんだろうか？
- firewalld, iptables, ufw, netfilter の関係を明確に答えられるようにしておきたい
- アプリケーションゲートウェイは中身のデータを見るからプライバシーとか暗号化周りで問題が起きそう。どういうケースで使われるんだろう。

# # Git

## ## まとめ

- `git show`, `git stash` はじめて知った

## ## これから

- 東工大のシステム開発 Youtube https://www.youtube.com/channel/UCJx-rgFp80y-x7_JeBJ35yA めちゃいいな。開発に必要なものが詰まってそうなので、開発の速度を上げるためにも見たい。
- build your own git やらないとなー

# # SDN

## ## まとめ

- はじめて聞く概念が多くて分からなかった。XDP, eBPF は聞いたことあるくらい

## ## これから

- 読み返す。どうしたらこのあたりの話題が身近に感じられるんだろうか。 https://qiita.com/hichihara/items/d6ede5ec8ad0ae35b9e1

# # 認証・認可

## ## まとめ

- 二要素認証と二段階認証の違い
- リスクベース + 二要素がセキュアで可用性もよい
- FIDO と WebAuthn

## ## これから

- リバースブルートフォース攻撃って何がリバースなんだろう
- FIDO はサーバに生体情報を送らないのでネットワーク上には結果のみが乗るという点で改ざんしやすそうだけど対策どうするんだろう
- 個人的に生体認証は変えが効かないのと、生体の変形に耐えられないので、偽造リスクは許容した上でハードウェアトークンがいいかなと思う。

# # OAuth/SAML/OpenID

## ## まとめ

- Cognito は AWS のフェデレーションサービス

## ## これから

- 流れ的には OpenID -> OAuth -> OAuth2.0 -> OpenID Connect なのかな
- よむ https://www.slideshare.net/kura_lab/openid-connect-id
- よむ https://www.slideshare.net/matake/idit-2014
- よむ https://www.slideshare.net/AmazonWebServicesJapan/aws-black-belt-tech-2015-amazon-cognito

# # SSO

## ## まとめ

- 代理人には認可を渡す

## ## これから

- サークルでウェブサービス基盤や SNS を作って SSO できるようにしたい。

# # 仮想化

## ## まとめ

- 見せかけの意味で vCPU, vNIC と言っている

# # コンテナ

## ## まとめ

- 開発サイクルの高速化によるデプロイ時間のコストからコンテナが登場したという文脈は抑えておきたい

## ## これから

- namespace と cgroup には詳しくなっておかないとなあ
- k8s の復習しないとなあ
- よむ https://speakerdeck.com/fujiihda/considering-kubernetes-security-while-attacking
- kubectf https://blog.ssrf.in/post/kubectf/
- kubernetes とセキュリティ https://speakerdeck.com/mrtc0/kubernetes-security-for-penetration-testers
- kCTF(kubernetes を利用した CTF フレームワーク) https://github.com/google/kctf

# # ロードバランサ

## ## まとめ

- パーシステンスという、トランザクションが終わるまでクライアントとリアルサーバのつながりを保持するよう振り分け先を固定する機能がすごいと感じた。

## ## これから

- パーシステンスどうやって実現しているんだろう
- おうちでインターネットを作ると LB について詳しくなれそう

# # データベース

## ## まとめ

- loop をなくすというコッドの思想が RDB の偉大なところ

## ## これから

- 調べたり、復習しておきたい
- 正規化
- インデックス、EXPLAIN
- SQL Injection, prepared statement
- トランザクション、ACID

# # DNS

## ## まとめ

- リソースレコードの意味

## ## これから

- DNS RFC すべて読むの大変そうだけど、すこしは読んでみたい
- よむ DNS RFC 歩き方 https://www.slideshare.net/ttkzw/dns-rfc?next_slideshow=1
- DNS の作り方ガイド https://github.com/EmilHernvall/dnsguide

# # SSL/TLS

## ## まとめ

- 国家による盗聴が背景となって HTTPS が進んだという文脈は抑えておくべきっぽい
- 0-RTT は知らなかった

## ## これから

- よむ: [プロフェッショナル SSL/TLS](https://www.lambdanote.com/products/tls)

# # Linux

## ## まとめ

- ログの仕込み方が分かった
- シェル芸、並列化など大規模データを扱うときの Tips を習得しておくと良さそうと思った。

## ## これから

- プロセス、ジョブなどの概念の比較と正確な理解
- 手を動かして読み直す https://eh-career.com/engineerhub/entry/2019/10/17/103000
- [［試して理解］Linux のしくみ](https://gihyo.jp/book/2018/978-4-7741-9607-7) 初期の頃に読んですっかり忘れたのでもっかい読み直したいな
- [ptrace 本](https://www.amazon.co.jp/dp/B07X2PCH7K) をやらないとなあ
- [greymd/teip](https://github.com/greymd/teip)のような、シェル芸の効率よい処理の補助をするやつ調べておきたい

# # 監視

## ## まとめ

- ポストモーテムの意味を知った
- SLI/SLO
- ログのフォーマット

## ## これから

- カオスエンジニアリングはエラーインジェクションの発想から出てくるのかな？

# # ログ

## ## まとめ

- ログにはビジネス上のもの、UI のものも含まれる
- slow query log 知らなかった

# # 高可用性

## ## まとめ

- 複数台でのクラスタリングの話だったが、馴染みのない話でわかりにくかった。

# # DevOps

## ## まとめ

- 高速リリースと安定運用の両立
- WIP は完了していないので顧客に提供する価値はゼロ
- CI/CD は各環境での開発をマージするときに起こる不具合を小さな単位で解決するために行う
- 最初から CI を入れるのがおすすめ

## ## これから

- ブルーグリーンデプロイ、カナリアリリースなど復習しておかないとな
- [google の SRE 本](https://sre.google/books/)を読まないとなあ

# # アルゴリズム

## ## これから

- https://github.com/TheAlgorithms/Python
- Rust だとテストもあってわかりやすい
- 螺旋本
- AtCoder
- けんちょん本
- アルゴリズム検定本
- 慣れてきたら Introduction to Algorithm (MIT) や みんなのデータ構造

# # トランザクション

## ## まとめ

- 専門用語が多く、スッと入ってこなかった

## ## これから

- トランザクションの話は CPU の命令のアトミック性とか Out of Order 実行の話と似ている

# # バックアップ

## ## まとめ

- バックアップはデータやファイルのコピーのこと

## ## これから

- terraform や ansible、シェルスクリプトとセットでバックアップしておきたいね

## # 終わりに

- よく知っている分野は積み本や資料が即座に思い浮かぶが、知らない分野はついていけなかったりイメージできなかったり写経になりがち。まとめを読んだときの反応で自分の理解度が把握できそう。
- ネットワークと認証周りと Web セキュリティでやることが多いかな？特にネットワークが分からなくてついていけない話題が多かったのでこのあたり腰を据えて勉強したい。
- 他によさげなリンク集として、SRE やクラウドエンジニアが読むと良さげな本まとめ https://qiita.com/tmknom/items/67dbfcf5194aee5c6e61 があったのでこれも見ていきたい。
