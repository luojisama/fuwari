---
title: nonebot2的简单部署
published: 2025-11-17
description: bot
image: ""
tags:
  - bot
category: 部署bot
draft: false
lang: ""
---
> 参考文档：
>[NoneBot](https://nonebot.dev/)    
>[NapCat | NapCatQQ](https://napneko.github.io/guide/napcat)    

# Linux
基于Debian11编写。    在Linux下部署nonebot。   

## 首先更新包列表，安装pip：
```shell
sudo apt update
sudo apt install python3-pip
```

## 安装nb-cli：
```shell
pip install nb-cli
```
## 安装napcat，此处使用napcat文档中的一键使用脚本：
```shell
curl -o \
napcat.sh \
https://nclatest.znin.net/NapNeko/NapCat-Installer/main/script/install.sh \
&& sudo bash napcat.sh
```
安装时选择同意安装`TUI-CLI`。   
## 安装tmux以用于后台挂起（服务器使用）：
```shell
sudo apt install -y tmux
```
## 安装1Panel（服务器使用）：
```shell
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sudo bash quick_start.sh
```
## 使用napcat
在终端中输入：
```shell
sudo napcat
```
添加你要使用机器人账号，并且将`token`复制。   
在浏览器中输入`服务器ip:6099`访问napcat的webui。   
输入token后在网络配置中新建`Websocket客户端`，URL为`ws://127.0.0.1:8080/onebot/v11/ws`，token为登录token。   
## 使用nb-cli创建nonebot：
```shell
nb
```
选择bootstrap；   
选择Onebotv11适配器；   
选择FastAPI驱动器；   
默认；   
默认；   
默认；   
创建完成后在`.env.prod`文件中添加：
```
SUPERUSERS=["你的qq号"]
ONEBOT_ACCESS_TOKEN=你的token
```
至此，你的bot算是部署完成了。
## 使用tmux挂起
在终端中输入：
```shell
tmux
```
进入窗口，输入：
```shell
napcat start 你bot的qq号
```
启动napcat；    
先按下`Ctrl+b` 然后按`d`挂起当前会话。   
重新输入：
```shell
tmux
```
在新窗口中输入：
```shell
cd /你bot的位置
nb run
```
启动你的bot。   
挂起窗口同上，如果后续需要回到对应页面修改，可以输入：
```
tmux ls
tmux a -t 会话名
```
或者使用`crtl+b`+`w`列出视图。

# Windows
首先确保你已安装`Python`，且`Python`大于3.9，推荐使用3.12，下载直链：   
https://www.python.org/ftp/python/3.12.0/python-3.12.0-embed-amd64.zip   
有一个可以使用的文本编辑器。
## 安装nb-cli
与Linux类似，使用pip安装。   
新建一个文件夹，在文件夹地址栏中输入：
```shell
pip install nb-cli
```
## 安装napcat
在napcat的GitHub页面中下载，下载直链：   
https://github.com/NapNeko/NapCatQQ/releases/download/v4.9.81/NapCat.Shell.Windows.OneKey.zip   
解压后：   
1.点击 NapCatInstaller.exe 等待自动化配置    
2.进入 NapCat.XXXX.Shell 目录    
3.启动 napcat.bat   
按照提示添加你要使用机器人账号，并且将`token`复制。   

在浏览器中输入`127.0.0.1:6099`访问napcat的webui。   
输入token后在网络配置中新建`Websocket客户端`，URL为`ws://127.0.0.1:8080/onebot/v11/ws`，token为登录token。
## 使用nb-cli创建nonebot：
在终端中输入：
```shell
nb
```
选择bootstrap；   
选择Onebotv11适配器；   
选择FastAPI驱动器；   
默认；   
默认；   
默认；   
项目创建完成后在bot目录下找到`.env.prod`文件，在其中添加：
```
SUPERUSERS=["你的qq号"]
ONEBOT_ACCESS_TOKEN=你的token
```
至此，你的bot部署完成了，插件扩展可在nonebot的商店中找到