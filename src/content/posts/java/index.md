---
title: "JAVA"
published: "2026-03-16"
description: "这是一篇记录我JAVA学习的文章"
tags: ["基础教程", "JAVA", "编程"]
category: "基础教程"
draft: false
---

>2026年开学第一个学期，我开始了java基础的学习。   
编程语言的相关概念是差不多的，本文中Java使用的IDE是`IntelliJ IDEA`。   

# 环境与第一个程序
创建一个项目，选择Java模块，不需要模板，自行选择路径与命名，不要出现中文。         项目创建完成后，在`src`目录下新建一个`软件包`，`软件包`内创建`类`文件，IDEA 会默认生成如下结构：

```java
javapublic class Main {
    public static void main(String[] args) {
        // 代码写在这里
    }
}
```

与 C# 类似，main 方法是程序的入口，代码从这里开始执行。
在 main 方法中输入以下代码，点击左侧绿色运行按钮或按 Shift + F10 运行：

```java
javapublic class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

控制台输出：
```shell
Hello, World!
```
`System.out.println();`是 Java 中最基础的输出语句，作用与 C# 的Console.WriteLine() 相同，输出内容后自动换行。
