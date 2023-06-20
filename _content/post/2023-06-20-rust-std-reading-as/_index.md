---
type: "post"
title: "Rust std読み会 as編"
draft: false
description: "asのドキュメントを読んで、関連しそうなissueを眺めました。"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2023-06-20T22:41:16+09:00"
---

<!-- titleは自動で入る -->
第6回です。`as` を調べたり、関連するissueを眺めました。

# 🦀 会の流れ

- 参加: [kaito_tateyama](https://twitter.com/kaito_tateyama), [いかなご](https://twitter.com/ikanag0) さん
- 時間: 6/17(土) 20:30 - 22:38
- 形態: オンライン、discordで通話 + hackmdでドキュメント共有、必要に応じてRust playgroundを画面共有してコード書く
- 内容: [`as`](https://doc.rust-lang.org/std/keyword.as.html) keywordのドキュメントを読んで、The Rust Referenceの [Type cast expressions](https://doc.rust-lang.org/reference/expressions/operator-expr.html#type-cast-expressions) を読み、`as` に関連するissueを眺めた。
- 流れ:
  - 初めにkaitoから [rust-lang/rust#74617](https://github.com/rust-lang/rust/issues/74617) に取り組んで分かったことの話
  - `as` のDocsを読む
  - 実装を眺める
  - `as` 関連issueを眺める
  - 2人とも疲れてきたので切り上げ

# 💻 技術

## [rust-lang/rust#74617](https://github.com/rust-lang/rust/issues/74617) に取り組んでいる

[前回の `ref` 編](https://blog.uta8a.net/post/2023-06-12-rust-std-reading-ref/) で眺めたissueの2つめが#74617。

**分かったこと**

- rust-analyzerを動かすには、`rustup default nightly` して `./x.py setup vscode` すると良い
  - 今回はCargo.tomlを読みに行くためにnightlyが必要だったみたい。
- このissueは2つに分割できる
  - 一見すると `ref mut s` と `&mut arg.field` の2つをsuggestするべきでこれが理想。だけど、`&arg.field` や `mut s` にしてもdiagnosticsはおかしいので、そちらから取り組むとよさそう。
- [helpとして2つのsuggestが出るdiagnosticsの例](https://github.com/rust-lang/rust/blob/cf2dff2b1e3fa55fa5415d524200070d0d7aacfe/tests/ui/nll/move-errors.stderr#L168-L187) を読むと、2つのhelpのどちらかですよ〜というdiagnosticsが出せそう。
- テストは `tests/ui` の下を見ると良い。今回だとテスト追加のために `tests/ui/borrowck/issue-***.rs` と `tests/ui/borrowck/issue-***.stderr` を作るといい気がする？
- 検索で本体のコードを探すなら `src/tools` と `tests` を除外すると良い
  - また、所有権周りでテストを探すなら、includeで `tests/ui/borrowck` とする
- issueでは `String` だけど、`Vector` でも起きるので広範囲にCopy traitを実装していないmoveが起こる型に対してのissueっぽい。
- `&`, `mut` を両方つけると正常系っぽい `ref mut s` を提案してくる(が、`&` を取り除く指示は出ないし、そもそもワンパスで正しいhelpが出て欲しい)
- [`add_move_error_suggestions`](https://github.com/rust-lang/rust/blob/114fb86ca08cfa6a99087e0f0bc264d03590dc37/compiler/rustc_borrowck/src/diagnostics/move_errors.rs#L490-L538) と、 [`add_borrow_suggestions`](https://github.com/rust-lang/rust/blob/114fb86ca08cfa6a99087e0f0bc264d03590dc37/compiler/rustc_borrowck/src/diagnostics/move_errors.rs#L469-L488) が関連する関数
- 修正方針が2つあると思う。
  - 1 `move_errors.rs` の中でワークアラウンドを実施
  - 2 大元がおそらく [`do_mir_borrowck`](https://github.com/rust-lang/rust/blob/114fb86ca08cfa6a99087e0f0bc264d03590dc37/compiler/rustc_borrowck/src/lib.rs#L339) なので、ここのロジックに変更を入れる
- estebankさんがdiagnostics関連を担当されているみたい？`move_error.rs` 関連のcommit logを眺めているとたくさん貢献されていた。
- おそらくエラーの段階でmoveとmutable両方の情報が取れているので、現在のパスに大きく変更を加えることなく正しいdiagnosticsは可能と推測できる。

**現在の状況**

- `do_mir_check` が理解できてない
- 広範囲に及びそうなので、draft PRを作成して相談したい(Zulipで相談も考えたが、コードがないと僕の英語力的に会話できそうにないのでまずは改善案を作るとこまで行きたい)

引き続きissueに取り組みたいが、重そうなのでここらでrustc-dev-guideを読み通す方が効率いいかも。

## borrow operatorsでは `&&` はBNF上 `&` 2つと区別されるが、実際の意味は同じ

The Rust Referenceの [Borrow operators](https://doc.rust-lang.org/reference/expressions/operator-expr.html#borrow-operators) を読むと書いてある。
おそらく `&&` はLazy boolean operatorsと表記がかぶるので、parser側の都合だろうか。

## Type cast expressions

> Any cast that does not fit either a coercion rule or an entry in the table is a compiler error.

- coercion rule
- 挙げられている表

のどちらでもなければ `as` による変換はできない。今回は挙げられている表を眺めた。

### closure to address

以下のコードでclosure のアドレスをとれる
[Rust playground link](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=2ab6128de0ae7ee7f12609223441e25d)

```rust
fn main() {
    let c = |x: i32| {
        x
    };
    let p = c as fn(i32) -> i32;
    let a = p as usize;
    dbg!(a);
}
```

### u32 to i8

u32をi8にキャストしてマイナスにできた

```rust
dbg!(0b110000000_u32 as i8); // -> 0b110000000_u32 as i8 = -128
```

同様に、以下のコードは上のビットを切り捨てるのでマイナスになる。

[rust playground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=c73ed0b3613a994d9abcce808e88828c)

```rust
fn main() {
    let a: u32 = (2_i32.pow(10) -1) as u32;
    println!("{}", a as i8);
}
// これは `-1` になる(0b111111111 -> 0b11111111 = -1)
```

### bool to char (invalid)

[rust playground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=16312b995ca3a1104a8d326420e31a18)

```rust
   Compiling playground v0.0.1 (/playground)
error[E0604]: only `u8` can be cast as `char`, not `bool`
 --> src/main.rs:2:13
  |
2 |     let a = true as char;
  |             ^^^^^^^^^^^^ invalid cast

For more information about this error, try `rustc --explain E0604`.
error: could not compile `playground` (bin "playground") due to previous error
```

エラーメッセージ `invalid cast` で検索をかけて、実装を眺めた。

## `as` の実装を眺める

色々眺めたので雑多に記録

- [`compiler/rustc_hir_typeck/src/cast.rs` の `CastToChar`](https://github.com/rust-lang/rust/blob/114fb86ca08cfa6a99087e0f0bc264d03590dc37/compiler/rustc_hir_typeck/src/cast.rs#L349-L378) がbool to char(invalid)の処理に相当する。
- コメントを眺めていて、[ここのTODOっぽさのあるコメント](https://github.com/rust-lang/rust/blob/114fb86ca08cfa6a99087e0f0bc264d03590dc37/compiler/rustc_hir_typeck/src/cast.rs#L470-L472) が気になった。

> // Very crude check to see whether the expression must be wrapped
> // in parentheses for the suggestion to work (issue #89497).
> // Can/should be extended in the future.

- [`PointerKind`](https://github.com/rust-lang/rust/blob/114fb86ca08cfa6a99087e0f0bc264d03590dc37/compiler/rustc_hir_typeck/src/cast.rs#L69-L84) を眺めると、pointer同士の変換はpointerのtypeによって決まってそうな雰囲気がある
  - Trait objectはVTableなんだ〜知らなかった
- `as` のできる・できないはもしかしてLLVMの都合とか、メモリにどうオブジェクトが配置されるかに依存しそう？
- castはHIRの段階なんだ
  - SRC -> AST -> HIR -> MIR -> LLVM IR
- [`do_check`](https://github.com/rust-lang/rust/blob/114fb86ca08cfa6a99087e0f0bc264d03590dc37/compiler/rustc_hir_typeck/src/cast.rs#L752-L873) にcastの実際のチェッカーがありそう。

## issueを眺める

GitHubで `is:issue is:open in:title as` で検索をかけた。

### [Compiler error encountered when attempting to get the size of a string created from [21u8; u32::MAX as usize] #111613](https://github.com/rust-lang/rust/issues/111613)

以下のコードはpanicする

```rust
fn main() {
    let string = String::from_utf8_lossy(&[21u8; u32::MAX as usize]).to_string();
    println!("{}", std::mem::size_of_val(string.as_str()));
}
```

[こちらのコメント](https://github.com/rust-lang/rust/issues/111613#issuecomment-1549584204) にあるように、これは意図したICEらしい。

### [Rustdoc doesn't play well with use ... as _ syntax #97615](https://github.com/rust-lang/rust/issues/97615)

`use ... as _` 記法を使ったコードに対してrustdocを生成すると、どの `_` リンクも同じリンクになってしまう。

### [Surprising type inference failure around "as" #106672](https://github.com/rust-lang/rust/issues/106672)

RalfJung先生によるissue。以下のようなコードは通る。

```rust
// コンパイル通る
fn test(x: usize) {
    let v: [u32; 4] = [[0, 1, 2, 3], [4, 5, 6, 7]][x];
}
```

ところが、これを `as` を用いて等価なコードに書き換えるとコンパイルが通らない。

```rust
// コンパイル通らない
fn test(x: usize) {
    let v = [[0, 1, 2, 3], [4, 5, 6, 7]][x] as [u32; 4];
}
```

`let x: T = a` と、 `let x = a as T` が等価であることは `as` のドキュメントに書かれている。

> In general, any cast that can be performed via ascribing the type can also be done using as, so instead of writing let x: u32 = 123, you can write let x = 123 as u32 (note: let x: u32 = 123 would be best in that situation).
> [`as`](https://doc.rust-lang.org/std/keyword.as.html) のドキュメント

これは取り組むのが難しそうだけど、 `as` に関わるOpen issueの中では一番面白そうに感じた。

### [False positive for unused_parens in x as (T) < y #106413](https://github.com/rust-lang/rust/issues/106413)

以下のコードは正しくコンパイルが通る。

[Rust playground link](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=1277fd38bc6e717252a6842764cc4729)

```rust
// コンパイル通る
fn main() {
    let _ = 1 as (i32) < 2;
}
```

しかし、以下のようにwarningとhelpが出る。

```text
   Compiling playground v0.0.1 (/playground)
warning: unnecessary parentheses around type
 --> src/main.rs:2:18
  |
2 |     let _ = 1 as (i32) < 2;
  |                  ^   ^
  |
  = note: `#[warn(unused_parens)]` on by default
help: remove these parentheses
  |
2 -     let _ = 1 as (i32) < 2;
2 +     let _ = 1 as i32 < 2;
  |

warning: `playground` (bin "playground") generated 1 warning (run `cargo fix --bin "playground"` to apply 1 suggestion)
    Finished dev [unoptimized + debuginfo] target(s) in 0.79s
     Running `target/debug/playground`
```

helpに従って、以下のように書き直すと、コンパイルエラーになってしまう。

[Rust playground link](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=43fa2d18619465e39b782509cc347a84)

```rust
fn main() {
    let _ = 1 as i32 < 2;
}
```

errorとhelpが出る。

```text
   Compiling playground v0.0.1 (/playground)
error: `<` is interpreted as a start of generic arguments for `i32`, not a comparison
 --> src/main.rs:2:22
  |
2 |     let _ = 1 as i32 < 2;
  |                      ^ -- interpreted as generic arguments
  |                      |
  |                      not interpreted as comparison
  |
help: try comparing the cast value
  |
2 |     let _ = (1 as i32) < 2;
  |             +        +

error: could not compile `playground` (bin "playground") due to previous error
```

helpに従って書き直すとコンパイルが通る。

[Rust playground link](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=57243cafcbecde5795f5f8530eec7159)

```rust
fn main() {
    let _ = (1 as i32) < 2;
}
```

まず `1 as (i32) < 2;` というコードがコンパイル通ることに驚いた。
おそらく最終の `(1 as i32)` をワンパスで提示できたらよさそう。
[Unfortunate warning about “unnecessary parentheses” that aren’t really unnecessary #80636](https://github.com/rust-lang/rust/issues/80636) と重複しているらしい。

# 💬 いろいろ

## Code GuessrをRust製OSS縛りでやってみた

ikanagoさんと [CodeGuessr](https://youtu.be/LdCb7vH573U) を参考に遊んでみた。

**今回のルール**

- 関数名と関数の一部を提示(核心に関わるものはマスクする)
- 許される操作(一回やるごとに1pt加算、ptが少ないと勝利)
  - 関数定義へジャンプ
  - 使われている関数の参照元へジャンプ
- 3回までguessが可能

Rust製のOSS縛りでやりました。

**様子**

kaitoの出題

kaito「ドン！」

```rust
fn get_pid_index(title: &str) -> Result<usize> {
    let titles = title.split_whitespace();

    for (index, name) in titles.enumerate() {
        if name == "PID" {
            return Ok(index);
        }
    }
    bail!("could't find PID field in ps output");
}
```

ikanago「PID？使われてる関数も参考にならなさそうだし...参照元ジャンプで」

```rust
pub fn ps(args: Ps, root_path: PathBuf) -> Result<()> {
  ...
    if args.format == "json" {
        println!("{}", serde_json::to_string(&pids)?);
    } else if args.format == "table" {
        let default_ps_options = vec![String::from("-ef")];
        let ps_options = if args.ps_options.is_empty() {
            &default_ps_options
        } else {
            &args.ps_options
        };
        let output = Command::new("ps").args(ps_options).output()?;
        if !output.status.success() {
            println!("{}", std::str::from_utf8(&output.stderr)?);
        } else {
            let lines = std::str::from_utf8(&output.stdout)?;
            let lines: Vec<&str> = lines.split('\n').collect();
            let pid_index = get_pid_index(lines[0])?;
            println!("{}", &lines[0]);
            for line in &lines[1..] {
                if line.is_empty() {
                    continue;
                }
                let fields: Vec<&str> = line.split_whitespace().collect();
                let pid: i32 = fields[pid_index].parse()?;
                if pids.contains(&pid) {
                    println!("{line}");
                }
            }
        }
```

kaito「長かったのでクリティカルな部分は隠しました」
ikanago「え〜ps... psかぁ〜 参照元ジャンプで」

```rust
fn main() -> Result<()> {
  ...
    let cmd_result = match opts.subcmd {
        SubCommand::Standard(cmd) => match cmd {
            StandardCmd::Create(create) => {
                commands::create::create(create, root_path, systemd_cgroup)
            }
            StandardCmd::Start(start) => commands::start::start(start, root_path),
            StandardCmd::Kill(kill) => commands::kill::kill(kill, root_path),
            StandardCmd::Delete(delete) => commands::delete::delete(delete, root_path),
            StandardCmd::State(state) => commands::state::state(state, root_path),
        },
        SubCommand::Common(cmd) => match cmd {
            CommonCmd::Checkpointt(checkpoint) => {
                commands::checkpoint::checkpoint(checkpoint, root_path)
            }
            CommonCmd::Events(events) => commands::events::events(events, root_path),
            CommonCmd::Exec(exec) => match commands::exec::exec(exec, root_path) {
                Ok(exit_code) => std::process::exit(exit_code),
                Err(e) => {
                    eprintln!("exec failed : {e}");
                    std::process::exit(-1);
                }
            },
            CommonCmd::List(list) => commands::list::list(list, root_path),
            CommonCmd::Pause(pause) => commands::pause::pause(pause, root_path),
            CommonCmd::Ps(ps) => commands::ps::ps(ps, root_path),
            CommonCmd::Resume(resume) => commands::resume::resume(resume, root_path),
            CommonCmd::Run(run) => match commands::run::run(run, root_path, systemd_cgroup) {
                Ok(exit_code) => std::process::exit(exit_code),
                Err(e) => {
                    eprintln!("run failed : {e}");
                    std::process::exit(-1);
                }
            },
            CommonCmd::Spec(spec) => commands::spec_json::spec(spec),
            CommonCmd::Update(update) => commands::update::update(update, root_path),
        },
    ...
}
```

ikanago「もうmainなんや」
kaito「どうですか」
ikanago「これはyoukiですね」
kaito「正解！！」

Answer: [youki](https://github.com/containers/youki), ikanagoが2pt

ikanagoの出題

ikanago「え〜、悩むなあ。これで」

```rust
fn generate(
        &self,
        line_number: usize,
        continuation: bool,
        _printer: &InteractivePrinter,
    ) -> DecorationText {
        if continuation {
            if line_number > self.cached_wrap_invalid_at {
                let new_width = self.cached_wrap.width + 1;
                return DecorationText {
                    text: self.color.paint(" ".repeat(new_width)).to_string(),
                    width: new_width,
                };
            }

            self.cached_wrap.clone()
        } else {
            let plain: String = format!("{:4}", line_number);
            DecorationText {
                width: plain.len(),
                text: self.color.paint(plain).to_string(),
            }
        }
    }
```

kaito「DecorationTextって見えるからCLIかな。参照元ジャンプで」

```rust
fn print_line(&mut self,
        out_of_range: bool,
        handle: &mut dyn Write,
        line_number: usize,
        line_buffer: &[u8],
    ) -> Result<()> {
    ...
let mut cursor: usize = 0;
        let mut cursor_max: usize = self.config.term_width;
        let mut cursor_total: usize = 0;
        let mut panel_wrap: Option<String> = None;

        // Line highlighting
        let highlight_this_line =
            self.config.highlighted_lines.0.check(line_number) == RangeCheckResult::InRange;

        if highlight_this_line && self.config.theme == "ansi" {
            self.ansi_style.update("^[4m");
        }

        let background_color = self
            .background_color_highlight
            .filter(|_| highlight_this_line);

        // Line decorations.
        if self.panel_width > 0 {
            let decorations = self
                .decorations
                .iter()
                .map(|d| d.generate(line_number, false, self));

            for deco in decorations {
                write!(handle, "{} ", deco.text)?;
                cursor_max -= deco.width + 1;
            }
        }
    ...
}
```

kaito「さっきのformatしてるやつで思ったけどjsonをprintしたりしそう」
kaito「ansi colorみたいなことしてるな。batですね」
ikanago「正解！」

Answer: [bat](https://github.com/sharkdp/bat), kaitoが1pt

という訳で今回はkaitoの勝利！やったね

**感想**

- youkiはシンプルで、意外とnestが浅いので一瞬でmainに辿り着いてしまう
  - 普段starだけしてコード読まないので結構いい体験だった
- 相手がそもそも知らないと困るので、相手がgithub starしてるかは大事そう
- 選択次第で楽しくなったり微妙になったりしそうで、リポジトリ選択比重が高い
- VTuberネタになるかも
  - コードリーディングするのも挟みたい
- 楽しい

# 💪 残った疑問や今後やりたいこと

- 引き続き#74617に取り組む
- rustc-dev-guide読み合わせもいいかも
- coercion ruleの方を理解したい
- #106672面白いので理解したい
- CodeGuessrで他の人とも遊ぶ

# ➡️ 次回

次回はThe Rust Referenceの [coercions](https://doc.rust-lang.org/reference/type-coercions.html) を読みます。型強制など、型周りの話題について何か理解を得たい。
