---
type: "post"
title: "新しく買ったマシンにOSをインストールする際に気を付けること"
draft: false
description: "自分用備忘録"
ogp: 'ogp-big.webp'
changelog:
  - summary: 記事作成
    date: "2024-09-16T10:06:13+09:00"
---

<!-- titleは自動で入る -->
おうちk8sをやりたいなと思って、新しくサーバ用のマシンを買いました。インストールに苦労したので、自分用備忘録を書きます。

# やりたかったこと

- USBメモリから Ubuntu server 24.04.1 を起動する

# まとめ: 注意すること

前から順に疑う

物理から疑う

- USBメモリが壊れていないか？
  - 別のUSBメモリを試す
  - UEFIの一時起動ディスク指定画面でUSBが表示されないなら、USBメモリの破損かISOイメージが変ではないかを疑うとよい
- マシンのUSBポートは壊れていないか？
  - 別のUSBポートを試す

USBメモリの中身を疑う

- フォーマットは適切か？
  - GPTディスクになっていることを確認
  - FAT32でフォーマットされていることを確認
- ISOイメージが壊れていないか？
  - UEFI対応でないと認識しないこともあるらしい

USB側が正常っぽいなら、UEFI側を疑う

- UEFIの設定がおかしくないか？
  - Secure boot
    - Secure bootの設定は適切か？3rd party CAを許可しているか？
    - Secure bootをOFFにしてみる
      - Secure bootをOFF/ONにしてPolicy違反画面が出ない/出るが変化するなら、3rd party CAを許可する設定をすると治るかもしれない

今回のケースでは、以下の2つが原因でうまく行っていなかった

- 最初に試したUSBメモリが壊れていた
  - 別のUSBメモリを使用して解決
- UEFIの3rd party CAを許可していなかった
  - UEFIの設定から許可して解決

# 試したこと・うまくいかなかった記録

環境は以下の通り。

- PC: ThinkCentre M75q Tiny Gen5(AMD)
- USB: Buffalo 32GB RUF3-K32GA-BK/N

時系列

- マシンの検査をする
  - ThinkCentreに元々Windows 11が入っていたので、起動がうまくいくことを確認してCrystalDiskInfoでストレージの状態確認、CrystalDiskMarkとCinebenchで性能が大幅にズレていないか確認した
- ISOイメージを書き込んだUSBメモリを差して起動してもうまくいかない
- UEFIの設定を変えてみる
- ISOイメージを焼き直してみる
- USBメモリを変えてみる
- UEFIの設定をもとに戻してみる
- UEFIの設定を変えてみる
- OSを変えてみる

## ISOイメージを書き込んだUSBメモリを差して起動してもうまくいかない

[Ubuntu Server 24.04.1](https://ubuntu.com/download/server) のISOイメージをダウンロードして、すでにあるマシン(Ubuntu server 22.04)でddを用いてISOイメージをUSBメモリに書き込んだ。コマンドは以下の通り。

```sh
# マウントされていないことを確認
lsblk # USB に対応する NAME の右側の MOUNTPOINTS に何もない
# 書き込む
sudo dd if=./ubuntu-24.04.1-live-server-amd64.iso of=/dev/sda bs=1048576 status=progress
```

F2やEnterを押す。

以下を試した

- F1を選んで設定画面へ → UEFIのBoot Orderを USB(HDD) にして起動
- F1を選んで設定画面へ → UEFIのBoot Orderを USB(CDROM) にして起動
- F12を選んで一時起動デバイスを選択 → M.2(Windows), PXE IPv4, PXE IPv6 だけが表示され、USBが表示されない

結果: いずれもUSBメモリからUbuntuが起動しなかった。

## UEFIの設定を変えてみる

以下を変更

- Secure bootをDisabledにする
- Fast bootをDisabledにする
- Windows firmware updateをDisabledにする

結果: いずれもUSBメモリからUbuntuが起動しなかった。

## ISOイメージを焼き直してみる

何かおかしいと思ったので、ISOイメージをUSBメモリに焼き直した。

Ubuntuからのdd以外に、Balena Etcher(Ubuntu), usb-creator-gtk(Ubuntu), Macからのddを試した。

結果: いずれもUSBメモリからUbuntuが起動しなかった。

### 補足: Ubuntu serverのGUIアプリをMacから使う

MacからBalena Etcherを使おうとすると信頼できないから使えないエラーが出る。既存のUbuntu server 22.04からX11 forwardしてXQuartzでBalena Etcherを使った。

ssh config

```sh
Host <EXAMPLE>
  User <USERNAME>
  Port <PORT>
  ForwardX11 yes
  ForwardX11Trusted yes
  HostName <HOSTNAME>
  IdentityFile <SSH_PRIVKEY>
  ServerAliveInterval 60
```

xeyesを起動

```sh
# export DISPLAY=:0 だと、Ubuntu側へ行った時に `unable to open display "/private/tmp/com.apple.launchd.s3HDECl5Iy/org.xquartz:0"` のようなエラーが出る
mac$ export DISPLAY=localhost:0.0
mac$ ssh -XY 6000:localhost:6000 <EXAMPLE>

ubuntu$ xeyes # XQueartz でMac側で目玉が表示される
```

xeyesが起動することを確かめた後、Balena Etcherを起動した。

```sh
sudo env DISPLAY=localhost:0.0 ./balena-etcher
```

## USBメモリとISOイメージを変えてみる

別のUSBメモリに、たまたまあったNixOSのISOイメージをmacのddで書き込んでから差し込むと認識した。

この時点でUSBメモリがおかしいことが確定したので、別のUSBメモリを以後使うことにした。

結果: NixOSが起動した。

(本当はUSBメモリだけ変えてイメージは固定でよかった)

## UEFIの設定をもとに戻してみる

UEFIのSecure boot, Fast boot, Windows firmware updateを元に戻してみた。

結果: Secure bootのPolicy違反画面が出て起動しなくなった。

## UEFIの設定を変えてみる

Secure bootに3rd party CAを許可みたいなやつがあったので、おそらくUbuntuやNixOSは3rd partyだろうと思って許可した。

結果: NixOSが起動した。

## OSを変えてみる

NixOSが起動したので、MacのddでUbuntu server 24.04.1をUSBメモリに書き込んでみた。

結果: Ubuntu server 24.04.1が起動した。

以上で、Ubuntu server 24.04.1が起動するようになった。
