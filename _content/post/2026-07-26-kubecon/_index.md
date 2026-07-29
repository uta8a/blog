---
type: "post"
title: "[参加記] kubecon Japan 2026 Day 0: Japan Community Day"
draft: false
description: "CNCJによるkubeconプレイベントに参加してきたよ"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2026-07-28T19:20:01.284389893+09:00[Asia/Tokyo]"
---

<!-- titleは自動で入る -->
CNCJが主催する[Japan Community Day](https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/co-located-events/japan-community-day/)に参加してきました。このイベントはkubecon Japan 2026のCo-locatedイベントで、クラウドネイティブに関心を持つ日本のローカルコミュニティが一堂に会する感じの楽しいイベントです。

セッションを色々聞いてきたので、学んだことを書きます。

# [XDPerf: A High-Performance Traffic Generator Built with WASM and eBPF](https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/co-located-events/japan-community-day-schedule/?id=1261494)

[takemio](https://x.com/takemioIO)さんの発表。
スライド: [XDPerf: A High-Performance Traffic Generator Built with WASM and eBPF - Speaker Deck](https://speakerdeck.com/takehaya/xdperf-a-high-performance-traffic-generator-built-with-wasm-and-ebpf)

僕はXDP周辺は以前takemioさんのスライドを読んでちょっと知っているくらいでした。なので発表の要約や感想は頓珍漢なこと言ってるかも...

モチベーションとしては、まず高速なパケット処理ができると嬉しくて、そのためにeBPFを用いたNICドライバレベルでの動作をする高速なパケット処理系XDPというのがある。既存の高速なパケット処理生成器としてはsocketベースで処理が遅いか、NICに寄っていて準備が大変なものの2つのクラスタに分かれているので、socketベースより高速で、準備が簡単なツールをXDPを用いて作ったというもの。
アーキテクチャが面白くて、遅くても良い部分(初回に1回生成すると良いもの)はwasm pluginでポリシーを書いて、高速であるべき部分(パケットごとに動くもの)はXDPを用いている。最初、wasmが最初に遅い部分を担当と聞いてwasmのメモリに静的に直接パケットが書かれるのかな？それだとパケット処理中にパケットを細工したい時にどうするのかな？と思っていたのだが、takemioさんに質問したところ、wasmに書いてあるのはポリシーで、パケット処理中にパケットを変化させる処理も可能なようだった。この辺はTemplate engineと言っている意味っぽいな〜と理解した。あとから考えてみると、ここの抽象化は全然想像がつかない...(ネットワークに疎いのもあるけど)ので、ちょっと中身を調べてみたいところ。

あとchecksumの計算が大変のパートも面白かった。checksumをパケット全体で計算すると重いので `bpf_loop` でworkaroundを入れているとか、差分計算させようとして前回の値を保持する必要が出てきたりとか。この辺ってchecksumの計算アルゴリズムがもっと賢かったら便利に使えたりするとかもありそうな気がしました。

# [There Are No Containers in the Kernel — How Tetragon Identifies Containers with eBPF Description](https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/co-located-events/japan-community-day-schedule/?id=1261497)

[Kohei Hayama](https://x.com/hymaaa_k)さんの発表。スライドは↑のDownload slidesから見れる。

`kubectl exec nginx -- cat /etc/passwd` した時にTetragonのログを見たら、コンテナログとして `runc` のログが出ていたのでなんで？という疑問を持ってTetragonがどこからコンテナとして扱うのかを調べてみたという話。確かにコンテナって一口に言う時、人によって話すレイヤが違ったりどこからをコンテナとして扱っているのか曖昧だったりすることあるなあと思ったので面白かった。

内容としては、namespaceとcgroup周辺知識を紹介した後に `kubectl exec` のライフサイクルを紹介し、setnsはコンテナではなくて、cgroup joinからがコンテナとして扱われているよ、という内容だった。このへんの詳細な部分まで踏み込んだことがなく、Deep diveとして面白かった。

質問できなかったけれど、p.17のプロセスIDだとkubectl execでは区別できないので、Tetragonがcgroup idを使っているというところはそうなのかと思った。そういう仕組みだとすると、Tetragonは同一プロセスIDかつ同一cgroup idの時に区別できないということだろうか...？cgroup idがどういうのかまで詳しく追えてないけど、プロセスID + 生成時刻ベースとかの方がIDとしては適切な気がした。

# [Discovering Cilium: What eBPF Enabled in K8s Networking](https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/co-located-events/japan-community-day-schedule/?id=1261603)

[logica](https://x.com/logica0419)さんの発表。
スライド: [Discovering Cilium: What eBPF Enabled in K8s Networking - Speaker Deck](https://speakerdeck.com/logica0419/discovering-cilium)

CiliumはeBPFを使っている、ということについて深く学べるセッションだった。確かにCiliumはeBPFを使っているのは知っているけど、どういう感じで使っているのかまでは知らなかった...
内容としては、通信方法の違いを、FlannelのLinux Bridgeを使った通信、Calicoのstatic routing, kube-proxyのDNAT、kube-proxy+CNIのHost NSを介するものと紹介していった後に本命のCiliumについてソースコードを追いつつ紹介するという話でした。eBPFを使っているパートとしては、Podが作成された時にHost NSのNICにeBPFプログラムがアタッチされる点、パケットがNICに飛んできた時に `bpf_redirect_peer()` で別PodのNICにルーティングするときで、要はHost NSのNICでの処理を担当し、kube-proxyの代替みたいなことをしているようでした。

前のtakemioさんの発表でも思っていたのですが、僕がネットワークに疎くてNICにeBPFプログラムをアタッチ、がよく分かってないな...？と感じました。後で調べてみたら、単にeBPFプログラムをeth0等で処理してねと登録することを指すみたいです。`ip link set` で `.o` ファイルを登録とかもできるみたいで、ちょっとやってみたい。

あと、この機会に昔のFlannelを調べてみたところ、初期(2017年くらい)のCNIの役目はPod間の通信のみで、network policyはiptablesでやっていたらしい？です。iptablesが増えるとnetworkのポリシー解決が重くなったり運用が辛くなりそうなので、そこにeBPFを投入するのは筋が良さそう。

# [OpenTelemetry Past and Future](https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/co-located-events/japan-community-day-schedule/?id=1261567)

Grafana Labsの方の発表。スライドは見つけられませんでした...。
内容としてはこれまでのOpenTelemetryの歴史と、日本のコミュニティに対する話でした。
2026/05/21にOpenTelemetryがCNCF Graduatedになった🎉 という話から、OpenTelemetry以前のOpenTracing + OpenCensusや、Semantic Conventions + ECSの話からOpenTelemetry + Prometheusに繋がる話がされました。

個人的に、この辺りの歴史の話は事実としてはオライリーから出てるオブザーバビリティ・エンジニアリング等の本を読んで知っていたのですが、当時のコミュニティの雰囲気(仲悪かったよ、とか)が聞けたのが収穫でした。

また、Graduated後の話や将来の話も面白かったです。今はOTAP(Rust)やNative Instrumentationが熱いらしい。OTAPは知らなかったのですが、OpenTelemetry Arrow Protocolの略で、Apache Arrowの列指向形式でデータパイプラインでの処理を行う一連のプロトコルを指すようです。OTLPと比較すると、OTLPは通信の標準化を行なっているのに対して、OTAPはそこに列指向を入れて圧縮して効率化しようとしている？印象を受けました。(OTAPの方が手広い感じがする)

あと、日本コミュニティに関心を持っているのも面白かったです。CNCF Slack channelの #otel-japan があるの知らなかった... 日本でもObservabilityCONとか開かれてたり、Grafana Meetupがあったりとちらほら盛り上がっている印象がある。SREコミュニティみたいに各地で開かれている感じはまだないかも？

# [Building AI Agent Observability with OpenTelemetry](https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/co-located-events/japan-community-day-schedule/?id=1278454)

LayerXの方の発表。
スライド [Building AI Agent Observability with OpenTelemetry - Speaker Deck](https://speakerdeck.com/yuzujoe/building-ai-agent-observability-with-opentelemetry-819b5933-28ae-4cc5-8fe5-bf93cdaf69c1)

内容としては、AI AgentのObservabilityのつらみ(各社で出ているものをOtel Collectorでよしなに標準形式っぽく直す)の話と、標準形式っぽく直したデータを蓄積してどう活用するか(自己学習に近い話)でした。
Claude CodeやCodexといった身近なコーディングエージェントにも応用できる話でもあり、かつproductionとして運用する場合の難しさとして機密データの扱いについても触れられていて、とても面白かったです。

個人的な話ですが、ちょうど最近Codexで1タスク終えたらCodexから出力されるTool Callなどのログや、入力プロンプトのやり取りを集めてきてreportを生成させて、定期的にそれらのreportを元にLLM wikiを更新するというフローを組んだので、似たことをしているなと感じました。ただLayerXの方の方がTracingとして構造を用いている分より賢そう。

質問できなかったのですが、App/Coding Agentごとの改善指標をどうしているかが気になりました。僕はtoken数の消費量しか見ていないので、もっと賢い指標があったら知りたい。あとGenAI Semantic Conventionsは追っておきたい。

# [How WebAssembly Enhances Edge AI Operations](https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/co-located-events/japan-community-day-schedule/?id=1267749)

ainnoさんとSazaさんの発表。
スライド [How WebAssembly Enhances Edge AI Operations - Speaker Deck](https://speakerdeck.com/sazaku/how-webassembly-enhances-edge-ai-operations)

去年の [KubeCon + CloudNativeCon Japan 2025: Breaking Limits: Highly-Isolated and Low...](https://kccncjpn2025.sched.com/event/1x70x/breaking-limits-highly-isolated-and-low-overhead-wasm-container-soichiro-ueda-kyoto-university-ai-nozaki-the-university-of-tokyo) の発表をされていたお二人。去年のkubecon 2025 Japanで出ていたMewzの活用方法として、k3sと組み合わせてEdgeデバイスで活用するみたいな話があったのだけど、その系としてIoT分野でのwasm活用の提案をしていると感じた。

今回の話はwaiotが中心で、これはrunc - containerdみたいな感じでwamr - waiotみたいな関係を作ったと理解した。が、Sazaさんainnoさんに質問したところrunc - containerdのinterfaceは特に意識しているわけではないようなので、もうちょっと別の捉え方をした方がいいかもしれない。

今回対象としている環境の難しさにheterogeneousなアーキテクチャ群でfirmware updateをどうするか(=オーケストレーションの例)というところがあり、そのための抽象化度合いを探っている印象を受けた。あんまりIoTデバイスに詳しくないけれど、実際のところデバイスを大量に扱う時ってheterogeneousになることってあるんだろうか...？研究室とかだとありそうだけど... 問題設定にちょっと不思議な点がある気がするけれど、挙げられている課題はとてもチャレンジングで面白いと感じた。wasmである必要性もあるし。

終わった後にSazaさんainnoさんに質問できて良かった。特に、[kuasar-io/kuasar](https://github.com/kuasar-io/kuasar)との違いを質問したら理解できたので、満足。

# [Learning Container Privilege Control by Building My Own Low-Level Container Runtime](https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/co-located-events/japan-community-day-schedule/?id=1265961)

[ternbusty](https://x.com/ternbusty)さんの発表。
スライド [Japan Community Day at Kubecon + CloudNativeCon Japan 2026: Learning Container Privilege Control by Building My Own Low-Level Container Runtime - Speaker Deck](https://speakerdeck.com/ternbusty/cncj-container-runtime-privilege)

個人的にはこの発表が一番楽しみで、ternbustyさんのkontainer-runtimeを予習してから臨んだので楽しめました。
予習で読んだスライド [CloudNative Days Winter 2025: 一週間で作る低レイヤコンテナランタイム - Speaker Deck](https://speakerdeck.com/ternbusty/cloudnative-days-winter-2025-zhou-jian-dezuo-rudi-reiyakontenarantaimu)

今回の発表は前半でJava + GraalVM構成でコンテナランタイムを作る時の難しさの話で、runc internalっぽい話題でした。後半はPrivilege Controlの話で、Capability, AppArmor, Seccompの適用順番の話が難しい！という話題でした。

これめっちゃ面白かったです。前半のmulti-threading problemの話は以前の発表資料にもあったので把握していたので、後半の権限管理の難しさの話にもついていけました。予習してて良かった〜。Capability, App Armor, Seccomp単体では理解していたのですが、そのつながりとかコンテナ立ち上げ時のpivot_root後の遷移という形の整理は新鮮だったので、すごい面白かったです。

あと会場で出てた次にコンテナランタイム作るならどの言語がいいですか？はウケました。

# その他

- logicaさんは英語がうまかった...
  - 言語の壁は減りつつも、Grafanaの方の発表にもあったように海外の方からすると日本コミュニティはまだまだ世界に出ていける余地があって、外から見ると「言語の壁があるのかな？」と思われたりするんだな〜と感じたので英語が話せる(というか、コミュニケーションができる)ことってすごいよなと思いました
- takemioさんとかマジですごいと思っているので、すごい人に直接質問できるJapan Community Day、すごい。
- 個人的にはDeep Dive系の発表好きなんですが、自作した人のDeep Diveはすごいなと思いました。ternbustyさんの発表とか、やっぱ細部まで把握しきっている人の発表がすごい面白いと感じるし、僕もそういうのやってみたいなと思いました。
