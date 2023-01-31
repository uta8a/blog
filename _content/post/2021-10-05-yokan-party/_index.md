---
type: post
title: '[writeup::procon] Yokan Party'
draft: false
description: Yokan Partyを解いた記録
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: 2021-10-05T16:44:38+09:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
  - summary: migrate to lume
    date: 2023-01-31T21:53:14+09:00
---

## link

- problem - https://atcoder.jp/contests/typical90/tasks/typical90_a
- editorial - https://github.com/E869120/kyopro_educational_90/blob/main/editorial/001.jpg

## 問題概要

長さ $L$ に対し予め切れ目 $A_i$ が与えられている。この切れ目 $N$ 個から $K$ 個をうまく選ぶことで、連続する長さの最小値を最大化する。

## 考察

普通にやると $\binom n k$ になり $O(n!)$ の雰囲気が出るので明らかに無理。
方針としては、以下を思いついた。

- dp - $L$ から切れ目をひとつ確定させて $L-A_j$ で切れ目を $K-1$ 個選ぶ問題に小さくできる
- diff を考える - 見た目がしゃくとりや累積和っぽい
- 最小値の最大化っぽい - 調べたら二分探索が鉄板らしい

## 解答

解けずに解説を読んだ。二分探索らしい。まだ慣れていないので疑似コードを思い浮かべる。
コードを書く。

```rust
fn check() -> bool {
  true
}
fn binary_search() -> usize {
  0
}
```

のように適当に用意して埋めていった。
過程でめぐる式二分探索を用いるとバグりにくいことを知った。下のグループの最大値が low(left), 上のグループの最小値が high(right)になるので、今回は小さい値たちの中で一番大きいものを選びたいので low を返せばよい。

```rust
fn check(a: &[usize], m: usize, key: usize) -> bool {
    let mut k = 0;
    let mut tmp = 0;
    for aa in a {
        if aa - tmp >= m {
            tmp = *aa;
            k += 1;
        }
    }
    k >= key // trueならもっとmを大きくしてもいい余裕がある
}
fn binary_search(a: Vec<usize>, key: usize, mut low: usize, mut high: usize) -> usize {
  while high - low > 1 {
    let mid = low + (high - low) / 2;
    if check(&a, mid, key) {
      low = mid;
    }else{
      high = mid;
    }
  }
  low
}
fn main() {
    input! {
      n: usize,
      l: usize,
      k: usize,
      a: [usize;n],
    }
    let k = k + 1;
    let mut a = a;
    a.push(l);
    dbg!(&a);
    let ans = binary_search(a, k, 0, l);
    println!("{}", ans);
}
```

indent がずれている。rustfmt で indent space 2 にするやつ整備しておかないとな〜
よくみたら dbg 消し忘れている... Oh...

[提出コード](https://atcoder.jp/contests/typical90/submissions/26365878)

## ref

- [めぐる式二分探索](https://qiita.com/drken/items/97e37dd6143e33a64c8c)
