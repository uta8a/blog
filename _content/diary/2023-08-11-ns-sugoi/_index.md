---
type: "diary"
title: "[感想] NeoShowcaseすごい"
draft: false
description: "NeoShowcaseすごいなと思ったので書きました"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2023-08-11T19:04:47+09:00"
  - summary: 見出しを修正
    date: "2023-08-11T20:21:30+09:00"
---

<!-- titleは自動で入る -->
NeoShowcase, やっぱスゲー！となったので書きました。

# 技育展予選でNeoShowcaseの発表があった

> 本日の技育展予選で、サークル内PaaS「NeoShowcase」で登壇しました！
> 大規模なプロジェクトなので、発表時間2分は全を伝えるにはあまりにも短すぎましたが、言うことを厳選して何とか2分で発表することができました！
> スライド: [https://docs.google.com/presentation/d/1m0pHPRcHGLteVl1rDGwQkTzhkDqNjhN91KHiNUXCeag/edit#slide=id.8WpuoBH5](https://docs.google.com/presentation/d/1m0pHPRcHGLteVl1rDGwQkTzhkDqNjhN91KHiNUXCeag/edit#slide=id.8WpuoBH5)
> GitHub: [https://github.com/traPtitech/NeoShowcase](https://github.com/traPtitech/NeoShowcase)
> #技育展
> -- 引用: [pikachu0310さんのツイート](https://twitter.com/pikachu0310main/status/1689904132877107200)

NeoShowcaseは東工大デジタル創作同好会traPで運用されているPaaSです。

僕は学生当時、サークルの新入生がクレカ持ってないからVPS借りれない、みたいな話を聞いて、Showcaseみたいなものを自分のサークルに作りたくて試行錯誤していた時期があります。しかし僕の取り組みはうまくいかなかったので、うまくやっているtraPにとても憧れがあります。

今回2023/8/11の技育展予選でNeoShowcaseの発表があったらしく、いや〜見たかったなという気持ちになりました。スライドが公開されていたので読んで、やっぱtraPすげえ！と思いました。2分で発表できるわけないと思うので、2時間くらいのLong Talkで聞きたい...

# SysAd班

traPはデジタル創作同好会という名の通り、Web開発以外にも様々な領域で活動しています。僕はただのファンなので実際内部のことは分からないのですが、元々ゲーム制作を中心にして、その周りで必要とされるプログラミング、イラスト、音楽などが好きな人が集まって発展してきた印象を持っています。それらは班単位で分かれて活動していて、現在だと以下の班が存在しています。

- アルゴリズム（競プロ）班
- グラフィック班
- ゲーム班
- サウンド班
- CTF班
- SysAd班

昔は シナリオを考える活動があったり(ref. [一次創作をしよう! - Komichi, 2019年](https://trap.jp/post/774/))、最近はアルゴリズム班のKaggle部が盛り上がっていたり(ref. [アルゴリズム班にKaggle部を設立し、初心者向けデータ分析体験会を開催しました！ - abap34, 2022年](https://trap.jp/post/1697/))、traP OBのNaruseJunチームがISUCON12で優勝したり(ref. [ISUCON12で優勝しました(チーム NaruseJun) - とーふとふ, 2022年](https://zenn.dev/tohutohu/articles/8c34d1187e1b21)) とかなり勢いのある団体です。

その中でSysAd班は部内の様々なクリエイターの活動を支えるインフラを担当しているそうです。例えばゲームを作って工大祭(東工大の学園祭)で展示しようと思ったらたくさんの種類のゲームを起動させる起点としてのゲームランチャーが欲しくなったり、部員が自分の作品を世に公開したい！と思った時にウェブサイトが欲しくなったり、そういうクリエイターの活動や、そもそもプログラミングの学習の一環としてサーバを使いたいという需要に応える、縁の下の力持ちのような役割を果たしている印象です。

SysAd班については [SysAd班](https://trap.jp/sysad/) の紹介を読んだり、[2021年度SysAd班を振り返る【新歓ブログリレー2021 24日目】 - temma, 2022年](https://trap.jp/post/1543/) を読むと詳しく分かります。調べるほどにやべえなという気持ちになります。ほんとすごい。

[SysAd班](https://trap.jp/sysad/) の紹介の下の方にリンクがありますが、SysAd TechBookという本も技術書典で販売されているので、もし興味あったらみてみると面白いと思います。TechBook 1とかは結構昔なんですが、運用に関して詳しい情報が書かれていて面白かったです。

# NeoShowcase激アツ

[スライド](https://docs.google.com/presentation/d/1m0pHPRcHGLteVl1rDGwQkTzhkDqNjhN91KHiNUXCeag/edit#slide=id.8WpuoBH5) を読んで、改めてスゲーという気持ちになりました。

まず500以上の作品がNeoShowcaseですでに稼働しているのがすごい。例として挙げられている[TypingWar](http://typingwar.trap.games/)とかは元々Showcaseで動いていたと思うので、ちゃんと新基盤に移行しているのが本当に偉い...

[Showcase](https://github.com/kaz/showcase) は昔調べて、kazさんの当時の [Showcaseのスライド](https://kaz.github.io/showcase/#/) を読んで、うわー！全てのクリエイターが簡単に作品を公開できる仕組みって最高だなと思って個人的にめっちゃ好きだなと感じていました。Showcaseがずっと利用されてきたこと自体にkazさんの先見の明を感じますが、さらにそれを引き継いでモダンになるという流れが激アツでめっちゃいいなあと思います。

使用技術もかなり攻めていてめっちゃいいなあという感じですね、k3sを使用しているのはちょっと意外でした。traefikはk3sにデフォルトで入っていた気がするのでその関係でしょうか。

フロントエンドでSolid.jsを使用しているところや、ArgoCD PR Generatorあたり、デザイン周りに力を入れていることとかもめっちゃいいですね... いや〜マジですごいしか言えなくなってしまった。

NeoShowcaseがどこで動かしているのかは気になりますね、Conohaで動かしているのか、別のところで動かしているのか...

あと最後の「部員が無料で簡単に使えるPaaSでサークル全体の技術力向上の土壌をつくる」もいいなと思いました。多分以前のShowcaseが出た当時よりもWeb開発周りだったり、プログラミングを学びたいからサーバを使って何かしたいという需要が高まっているんだろうなと推測しています。めっちゃ末長く盛り上がってほしい。

# 終わりに

僕も頑張りたいなという気持ちになりました。traPマジですごくて、応援しています。
