---
type: "post"
title: "Rust std読み会 ascii編"
draft: false
description: "Module std::asciiについて調べたりソースコードを読んだ"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2023-05-17T06:37:26+09:00"
---

<!-- titleは自動で入る -->
Module `std::ascii` を調べました。その過程でASCII文字についても調べました。

# 行ったこと

- 参加: [kaito_tateyama](https://twitter.com/kaito_tateyama), [いかなご](https://twitter.com/ikanag0) さん
- 時間: 5/16(火) 20:30 - 22:36 (23:30終了予定、早めに終わったので切り上げた)
- 形態: オンライン、discordで通話 + hackmdでドキュメント共有
- 内容: RustのModule `std::ascii` を眺めてASCII文字列について調べた

# 技術

## Module `std::ascii` について

link: [https://doc.rust-lang.org/std/ascii/index.html](https://doc.rust-lang.org/std/ascii/index.html)

Module `std::ascii` にはASCII文字や文字列に対しての処理が含まれる。

以下の3つの要素で構成されている

- Structs
  - `EscapeDefault`
- Traits
  - `AsciiExt`: Deprecated
- Functions
  - `escape_default`

ソースコードは主に [`rust/library/std/src/ascii.rs`](https://github.com/rust-lang/rust/blob/e77366b57b799dfa3ce1fcb850c068723a3213ee/library/std/src/ascii.rs) と [`rust/library/core/src/ascii.rs`](https://github.com/rust-lang/rust/blob/e77366b57b799dfa3ce1fcb850c068723a3213ee/library/core/src/ascii.rs) を参照した。

## `AsciiExt` に関して

### なぜDeprecatedなのか、代替は

`u8` や `str` などにメソッドとして実質的に同じものが実装されているから。

[`rust/library/std/src/ascii.rs`](https://github.com/rust-lang/rust/blob/e77366b57b799dfa3ce1fcb850c068723a3213ee/library/std/src/ascii.rs#L55-L56C7) にNOTEとして書かれている。

そのため、代替としては実質的に同じメソッドを探して使えば良い。例えば [Primitiveの `char` には `is_ascii` がある](https://doc.rust-lang.org/std/primitive.char.html#method.is_ascii)

## `escape_default` に関して

link: [https://doc.rust-lang.org/std/ascii/fn.escape_default.html](https://doc.rust-lang.org/std/ascii/fn.escape_default.html)

`u8` の引数をとって、struct `EscapeDefault` を返す。`EscapeDefault` は実質イテレータのようなものなので、以下のようなコードが書ける。

```rust
use std::ascii;

let escaped = ascii::escape_default(b'0').next().unwrap();
assert_eq!(b'0', escaped);

// ref: https://doc.rust-lang.org/std/ascii/fn.escape_default.html
```

直感的には「1つの文字しか引数に取らないのにイテレータを返したら、一個nextで消費しておしまいにならない？」という疑問が湧くが、以下のように最大長さ4のイテレータが返る。

```rust
let mut escaped = ascii::escape_default(b'\x9d');

assert_eq!(b'\\', escaped.next().unwrap());
assert_eq!(b'x', escaped.next().unwrap());
assert_eq!(b'9', escaped.next().unwrap());
assert_eq!(b'd', escaped.next().unwrap());

// ref: https://doc.rust-lang.org/std/ascii/fn.escape_default.html
```

詳しいルールはC++11やC系の言語を参考に決められていて、[ドキュメント](https://doc.rust-lang.org/std/ascii/fn.escape_default.html)に書かれている。

また一見すると、以下の2つの例は `b'\''` と `b'"'` というbackslashの有無に関して異なるものが同じような結果になっていて不思議に感じたが、これは表記上single quoteをescapeする必要があるからだということに気づいて納得した。

```rust
// ' single quote
let mut escaped = ascii::escape_default(b'\'');

assert_eq!(b'\\', escaped.next().unwrap());
assert_eq!(b'\'', escaped.next().unwrap());

// " double quote
let mut escaped = ascii::escape_default(b'"');

assert_eq!(b'\\', escaped.next().unwrap());
assert_eq!(b'"', escaped.next().unwrap());
```

実装を眺める。会の時点ではこのように直で実装されていた。
長さ4の固定長の配列をデータとして持っておいて、`len` で長さを示すという設計になっている。確かにここは小さいので可変長配列にする必要はなさそう。

```rust
#[derive(Clone)]
pub struct EscapeDefault {
    range: Range<u8>,
    data: [u8; 4],
}

pub fn escape_default(c: u8) -> EscapeDefault {
    let (data, len) = match c {
        b'\t' => ([b'\\', b't', 0, 0], 2),
        b'\r' => ([b'\\', b'r', 0, 0], 2),
        b'\n' => ([b'\\', b'n', 0, 0], 2),
        b'\\' => ([b'\\', b'\\', 0, 0], 2),
        b'\'' => ([b'\\', b'\'', 0, 0], 2),
        b'"' => ([b'\\', b'"', 0, 0], 2),
        b'\x20'..=b'\x7e' => ([c, 0, 0, 0], 1),
        _ => {
            let hex_digits: &[u8; 16] = b"0123456789abcdef";
            ([b'\\', b'x', hex_digits[(c >> 4) as usize], hex_digits[(c & 0xf) as usize]], 4)
        }
    };

    return EscapeDefault { range: 0..len, data };
}

// ref: https://doc.rust-lang.org/src/core/ascii.rs.html#91-108
```

会の後に[最新commit](https://github.com/rust-lang/rust/blob/e77366b57b799dfa3ce1fcb850c068723a3213ee/library/core/src/ascii.rs#L92-L97) を眺めると以下のように変わっていた。

```rust
#[derive(Clone)]
pub struct EscapeDefault(escape::EscapeIterInner<4>);

pub fn escape_default(c: u8) -> EscapeDefault {
    let mut data = [0; 4];
    let range = escape::escape_ascii_into(&mut data, c);
    EscapeDefault(escape::EscapeIterInner::new(data, range))
}

// escape::escape_ascii_into https://github.com/rust-lang/rust/blob/e77366b57b799dfa3ce1fcb850c068723a3213ee/library/core/src/escape.rs#L10-L27
pub(crate) fn escape_ascii_into(output: &mut [u8; 4], byte: u8) -> Range<u8> {
    let (data, len) = match byte {
        b'\t' => ([b'\\', b't', 0, 0], 2),
        b'\r' => ([b'\\', b'r', 0, 0], 2),
        b'\n' => ([b'\\', b'n', 0, 0], 2),
        b'\\' => ([b'\\', b'\\', 0, 0], 2),
        b'\'' => ([b'\\', b'\'', 0, 0], 2),
        b'"' => ([b'\\', b'"', 0, 0], 2),
        b'\x20'..=b'\x7e' => ([byte, 0, 0, 0], 1),
        _ => {
            let hi = HEX_DIGITS[usize::from(byte >> 4)];
            let lo = HEX_DIGITS[usize::from(byte & 0xf)];
            ([b'\\', b'x', hi, lo], 4)
        }
    };
    *output = data;
    0..(len as u8)
}
```

リファクタリングされて、特にルールの `Any other chars are given hex escapes of the form ‘\xNN’.` に対応する部分が分かりやすくなっている。

## `EscapeDefault` に関して

link: [https://doc.rust-lang.org/std/ascii/struct.EscapeDefault.html](https://doc.rust-lang.org/std/ascii/struct.EscapeDefault.html)

function `escape_default` の返り値として struct `EscapeDefault` が生成される。

### `Iterator` の `size_hint`

[`EscapeDefault` に対する `Iterator`](https://doc.rust-lang.org/src/core/ascii.rs.html#111-124)
を見ていると、`Item` と `next` は知っていたが `size_hint` というのを見つけた。

> size_hint() is primarily intended to be used for optimizations such as reserving space for the elements of the iterator, but must not be trusted to e.g., omit bounds checks in unsafe code. An incorrect implementation of size_hint() should not lead to memory safety violations.
> -- [`size_hint` のドキュメント](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.size_hint) より

`size_hint` は最適化周りで役に立つらしい。

### `fmt::Display` の unsafe

link: [https://doc.rust-lang.org/src/core/ascii.rs.html#137-144](https://doc.rust-lang.org/src/core/ascii.rs.html#137-144)

以下のようにunsafeが使われていたので眺めていると、`from_utf8_unchecked` を使用しているが、コメントにもあるように `escape_default` 関数の返り値は `\x9d` の `\` `x` `9` `d` のようにそれぞれUTF-8な文字なのでSafetyになる。 

```rust
impl fmt::Display for EscapeDefault {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        // SAFETY: ok because `escape_default` created only valid utf-8 data
        f.write_str(unsafe {
            from_utf8_unchecked(&self.data[(self.range.start as usize)..(self.range.end as usize)])
        })
    }
}
```

会の後で [最新commit](https://github.com/rust-lang/rust/blob/e77366b57b799dfa3ce1fcb850c068723a3213ee/library/core/src/ascii.rs#L155-L159) を眺めたところ、そもそも `EscapeDefault` の定義を変えたので以下のようにunsafeを使わない形になっていた。面白い。

```rust
impl fmt::Display for EscapeDefault {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.0.as_str())
    }
}
```

会では便利さからドキュメントから飛べるリンクを見ていいけど終わった後に最新コミット確認するようにしたら違いが分かって楽しいかも。

### `fmt::Debug` の `debug_struct` と `finish_non_exhaustive`

- [`debug_struct`](https://doc.rust-lang.org/stable/std/fmt/struct.Formatter.html#method.debug_struct)
  - structの名称を文字列として渡すと `DebugStruct` 構造体を生成する。
  - メタっぽい動きだなと思った。
- [`finish_non_exhaustive`](https://doc.rust-lang.org/std/fmt/struct.DebugStruct.html#method.finish_non_exhaustive)
  - `..` の表示ができるやつ。構造体について `debug_struct` にチェインで`field` を指定したもの以外を `..` 表示にできる。

# ASCIIについて

**`man ascii`**

man asciiのNOTES > Historyの項目について
macOSやFreeBSDは一行 `An ascii manual page appeared in Version 7 of AT&T UNIX.` とだけ書かれていたが、Ubuntu 22.04には以下のように書かれていた

```text
NOTES
History
An ascii manual page appeared in Version 7 of AT&T UNIX.

On older terminals, the underscore code is displayed as a left arrow, called backar‐
row, the caret is displayed as an up-arrow and the vertical bar has a  hole  in  the
middle.

Uppercase  and lowercase characters differ by just one bit and the ASCII character 2
differs from the double quote by just one bit, too.  That made it much easier to en‐
code characters mechanically or with a non-microcontroller-based electronic keyboard
and that pairing was found on old teletypes.

The ASCII standard was published by the United States of America Standards Institute
(USASI) in 1968.

-- man asciiより引用
```

> That made it much easier to en‐
code characters mechanically or with a non-microcontroller-based electronic keyboard
and that pairing was found on old teletypes.

これどういうこと？と思ったけどどう当時の状況を調べたらいいか分からなかった。

**キーボード的な話**

"the ASCII character 2 differs from the double quote by just one bit" → 文字の2(0x32)と"(0x22)が1bit違う
Apple II keyboard がそうかも？

[Apple II keyboard](https://github.com/jsheradin/ATT_3B1_KB_USB) を眺めていた。チルダが変なところにあったり、ReturnとEnterが別のキーで面白い。

**その他ASCIIっぽい話題**

CRは文字列先頭、LFはライン送り(改行)の役割だった

[IIJ技術研究所のASCIIについての記事](https://www.mew.org/~kazu/doc/newsletter/6.html) によると、仕様でASCIIはどこがどの役割というのはそんなに明確に決まっているわけでもなさそう。日本のJIS規格でbackslashが円マークに割り当てられるところの話とか面白かった。

DELが0x7fである理由 ([Wikipediaより](https://ja.wikipedia.org/wiki/ASCII))

> この制御文字だけ先頭部分になく最後にある理由は、パンチテープへの記録は上書きが出来ないため、削除する際には全てに穴を空けることで対応できるというところからきている（1111111は全てに穴の開いた状態を示す）

# その他

## `assert_matches` に関して

[前回のstd読み会](https://blog.uta8a.net/post/2023-02-19-rust-std-reading-pre/) と同様に [RustのstdのModules](https://doc.rust-lang.org/std/index.html#modules) を眺めたところ、[`assert_matches`](https://doc.rust-lang.org/std/assert_matches/index.html) というExperimentalなModulesを発見した。

> This is a nightly-only experimental API. (assert_matches #82775)

とあったので [Issue#82775](https://github.com/rust-lang/rust/issues/82775) を眺めた。

2023/05/16時点でのExample [Macro std::assert_matches::assert_matches](https://doc.rust-lang.org/std/assert_matches/macro.assert_matches.html)

```rust
#![feature(assert_matches)]

use std::assert_matches::assert_matches;

let a = 1u32.checked_add(2);
let b = 1u32.checked_sub(2);
assert_matches!(a, Some(_));
assert_matches!(b, None);

let c = Ok("abc".to_string());
assert_matches!(c, Ok(x) | Err(x) if x.len() < 100);
```

[Macro `std::assert_eq`](https://doc.rust-lang.org/std/macro.assert_eq.html) と似ている。

```rust
// Macro std::assert_eqのExample
// ref: https://doc.rust-lang.org/std/macro.assert_eq.html
let a = 3;
let b = 1 + 2;
assert_eq!(a, b);

assert_eq!(a, b, "we are testing addition with {} and {}", a, b);
```

`assert_eq!` は `PartialEq` を実装した2つの要素を比較できて、 `assert_matches!` はEnumを直接比較できる点が異なる。今まで `assert_eq!(x.is_some(), true);` とかやってたのが `assert_matches!(x, Some(_));` と書けるようになりそう。

## libstd？という表現

[Issue#82775](https://github.com/rust-lang/rust/issues/82775) に言及していた [murarth/assert_matches Issue#2](https://github.com/murarth/assert_matches/issues/2) を眺めていた。

> Partial implementations are in unstable libstd: rust-lang/rust#82775.

というコメントがあり、"libstd"という表現が気になった。

Rust RFCを見ると2014年に [0040-libstd-facade](https://rust-lang.github.io/rfcs/0040-libstd-facade.html) で "libstd" という表現が使用されている。

(あんまり読めてないけど) 当時libminiというprimitiveなものやliblibc, liballocなどをまとめてlibstdとして一本化する変更があったらしい？
元々 libXXX みたいなのが散らばってたのをまとめたのではないか？という結論になった。おそらくlibstdは昔の呼び方で、現在は std 呼びでいい気がする...？

## どこから読むか候補決め

- `prelude`
- `assert_matches!`
- `net`
- `pin`
- `task`
- `future`
- `ascii`, `char`
  - 文字列について予習する必要があるかも
- `simd`

非同期やるなら、順番としては `pin` -> `task` -> `future`

路線としては、

- 同期非同期の沼
- 文字列の沼　👈
- ネットワークの沼
- simdの沼

今回は相談して文字列の沼が一番趣味っぽいしこれにしようという話になった。
この機会に文字列周りの話題(UTF-8などの文字コードとか)に少し詳しくなりたい。

## 決めたこと

- お互いに文字列に対してモチベが切れたら言う。撤退して別のをしましょう。
- 撤退はちゃんとする
  - どこまで理解したか、疑問はこれ、とか振り返りはする

## 録音はした方がいいかも？

- 話した内容を忘れてしまう
- 記録は進捗のために存在すべきで、忘れないための記録は録音 + 自動での文字起こしでいいのではないか(文字起こししたものを2者間で共有)


# 追加で調べたい

- DoubleEndedIterator
  - `std::ascii::EscapeDefault` に実装されているトレイトを眺めていたら見つけた。
- Iteratorについてくる関数たち
  - Iteratorについてよく知らないので構造的にまとめたい
- shadowingは型が異なってもいける
  - このあたり実装見たい

# 次回

文字列シリーズということで、Primitiveの `char` をやろう！
文字列シリーズの目標は「UTF-8をふんわり理解する」です。
