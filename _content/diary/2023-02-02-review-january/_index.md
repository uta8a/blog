---
type: "diary"
title: "2023/01を振り返る"
draft: false
description: "今月はドキュメント周りが楽しかったです。"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2023-02-02T16:02:31+09:00"
---

<!-- titleは自動で入る -->
今月はdeno製の静的サイトジェネレータ [lume](https://lume.land/) が楽しかったので気軽に出力できるように足回りを整えていました。

# 概要



# 抱負に対しての戦略

22pt/5050ptなので進捗度0.4%

2月はVTuberとして動画を出すための準備(56pt)、自作キーボード(RustyKeys)(61pt)に注力する。分かったこととして、一つの月に対して500ptとるつもりでやるとなると50pt以下を無視して50ptより大きな目標に取り組むと良い。

# 技術

1月は体調が良かったので技術に楽しく取り組めた。

## RISC-V

[Visionfive 2に関する記事](https://zenn.dev/uta8a/articles/87262048da5327) を書いた。
この記事の後はgccがaptで入った(！？)のでCコンパイラを書き始めた。
また、ディスプレイに接続する方法が分かったので4KディスプレイにFullHDとして接続して作業できるようになった。

あと、現在の僕のRISC-Vに対する気持ちを整理した。

原義叫び: **「RISC-V DesktopでSKK使って自作GUIで最強環境で最先端の星座になりてえ！！！」**

これは本当に満たしたい気持ち3つに分解することができる。

- Linux DesktopでSKKとかNeovimとかのパソコンカタカタオタク風最強環境作りてえ
  - これは正確に捉えると、Linuxに対する環境構築オタクが発動しているので現状x86のLinux Desktop(Arch, Ubuntuなど)で叶える。
- Desktop EnvironmentやGUI環境への気持ちの高まり
  - これは正確に捉えられていないが、Elm ArchitectureやSwiftUI周りの話題に触れて、これをnativeアプリやDesktop Environmentに活かせたら楽しそうという気持ち。
  - これもRISC-Vでなくても満たせるので、まずは積んでいる記事を読んで試して、自分の満たしたい気持ちを発見する。
- RISC-Vに対する気持ち
  - Firmware, OSに対しての気持ち。これはUART通信できる点で現環境ではRaspberry piかVisionfive 2が適任なので、これを頑張ると良い。
  - OpenSBI, RustSBIや、U-Bootに取り組むと良さそう。

本当に満たしたい気持ちにジャストで当たる作業に集中したい。

## lume

lumeで6つほどサイトを建てた。シュッと気持ちが続く間に勢いだけで静的サイトが作れて良かった。

感想

- 後発だから色々シンプルに整備されている。
- Blogシステムは結局JavaScriptと親和性が高い方が有利で、Denoが合う
- Cloudflare Pagesへのデプロイはcurlでdenoを入れるところからビルドコマンドが始まるのが渋い。GitHub Actionsとかでキャッシュかけられた方がいいかも。

# 音楽

spotifyはリンクを貼ります。

<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/6cSCJQcTMWpFPfBZg1gl3h?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

**Astray Life / Rooftops**
JYOCHOとか好きな人は好きかも。僕も好きです。

<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/3Maaef6FsP0s65ZlyKIL9L?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

**potage / tricot**
tricotのカラカラを聴いてtricotにどハマりしてしまって、助けて〜

<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/1DKv7Hq1hGJab5phHG3MKq?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

**あふれる / tricot**
tricotの中でこの曲が一番好きです。1月はこの曲をめちゃくちゃ聴いていた。

**グッバイ宣言 / 市瀬るぽREMIX**
めちゃくちゃいい。低音と打ち込み超絶ピアノが好き。

**AMUNOA - Bright (Mikeneko Homeless remix)**
人間の声ネタこういうの好きなんだよな。

**Сrуsтаl Кау - Тhiпк Оf Yоц (тоуо яемıж)**
良い。イントロから心を掴まれてそこからの展開も完璧。

**JACK GUY - Heart こころ**
映画のような、イメージセットできたら〜の疾走感で中毒になります。

# その他

- イベントを2つ開いた。オープンでくだらないインターネットが好きなので負担にならない程度に機会を作りたい。
  - 新春ワクワク無賞品ビンゴ大会@Twitter Space
  - 記事読み会@discord
- RaycastにAlfredから乗り換えた。ISO形式で現在時刻を出すのが便利
- 新年の抱負くじ、というのを作ったら人々が結構遊んでくれて良かった
- サークルでUH(大学名モニュメントを裏側からみるとこれになる)、通称「ｳｰ!」を定点観測して写真を投稿していた。
- 食堂でカツ丼を連打。
- お絵描きをした。
- ぼざろに狂う毎日
- TeXで推論規則の図を書く方法を知った。
  - TeX環境周りは型理論系は [住井研究室の素敵なTeXファイルたち](https://github.com/fetburner/sumiilab-tex) が、環境的には [texlive-full-devcontainer](https://github.com/tbistr/texlive-full-devcontainer) が参考になった。

# Stats

ツイート数: 500以上
GitHub commit数(private込み): 394
Spotifyでいいねした楽曲数: 47
Youtubeでお気に入りした動画数: 66本

