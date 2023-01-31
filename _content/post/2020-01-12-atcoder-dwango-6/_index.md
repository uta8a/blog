---
type: post
title: AtCoder ドワンゴからの挑戦状 予選
draft: false
description: B 問題のみ書きます。
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: 2020-01-12T08:33:49+09:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
  - summary: migrate to lume
    date: 2023-01-31T21:10:46+09:00
---

B 問題のみ書きます。

# ドワンゴからの挑戦状 予選 B Fusing Slimes

**[問題](https://atcoder.jp/contests/dwacon6th-prelims/tasks/dwacon6th_prelims_b)**

スライムが規則に従い左から右に流れるので、スライムが移動した距離の期待値に$\(N-1\)!$を掛けたものを求めよ。

**解法**

こういう問題では、区間に注目するのが典型らしい。([けんちょんさんのブログ](http://drken1215.hatenablog.com/entry/2020/01/12/014200))  
確かに、$O\(N\)$で解こうと思うと`[xi,xi+1)`に注目して$O\(N\)$が妥当な気がする。

`[xi,xi+1)`を通るスライムの数を$c_i$とおく。このとき、`i+1`の位置にあるスライムより左側の`i`個のスライムのみ考えればよい。  
`i`の位置にあるスライムが選ばれた場合、選ばれる確率は$\frac{1}{i}$である。この後は$c_{i-1}$個のスライムが通るのと、`i`の位置にあるスライムが通るのを考えて期待値は$\frac{1}{i} \(1 + c_{i-1}\)$になる。  
残りの位置にあるスライムを選ぶと`i+1`の位置の左側には`i-1`個のスライムがあることになるので、期待値は$\frac{n-1}{n}c_{i-1}$となる。以上により、$c_i = c_{i-1} + \frac{1}{i}$となり、個数は調和級数になると分かる。  
求めるものは、$\(N-1\)! \times \sum{1\leq i \leq N-1}(x_{i+1} - x_{i}) \times c_i$となる。

**実装**

区間ごとの足し合わせで計算量は$O\(N\)$である。MOD での逆数テーブル、factorial テーブルを前計算して持っておけば区間に対し$O\(1\)$で求まる。  
前計算$O\(N\)$で全体で$O\(N\)$になる。

**コード**

[https://atcoder.jp/contests/dwacon6th-prelims/submissions/9431284](https://atcoder.jp/contests/dwacon6th-prelims/submissions/9431284)

**感想**

競技中は$x_j - x_i$について考えていて、$O(N^2)$の解法が浮かんだのでそこから計算量を落とそうとしていた。区間について考える。覚えておきます。  
ModInt ほしい。あと ModInv もほしい。
