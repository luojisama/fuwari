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

本篇基于Debian11编写。    
自己摸索了一下，学习了在Linux下部署nonebot。   


# 首先更新包列表，安装pip：
```shell
sudo apt update
sudo apt install python3-pip
```

# 安装nb-cli：
```shell
pip install nb-cli
```
# 安装napcat，此处使用napcat文档中的一件使用脚本：
```shell
curl -o \
napcat.sh \
https://nclatest.znin.net/NapNeko/NapCat-Installer/main/script/install.sh \
&& sudo bash napcat.sh
```
安装时选择同意安装`TUI-CLI`。   
# 安装tmux以用于后台挂起（服务器使用）：
```shell
sudo apt install -y tmux
```
# 使用napcat
在终端中输入：
```shell
sudo napcat
```
添加你要使用机器人账号，并且将`token`复制。   
在浏览器中输入`服务器ip:6099`访问napcat的webui。   
输入token后在网络配置中新建`Websocket客户端`，URL为`ws://127.0.0.1:8080/onebot/v11/ws`，token为登录token。   
# 使用nb-cli创建nonebot：
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
# 使用tmux挂起
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