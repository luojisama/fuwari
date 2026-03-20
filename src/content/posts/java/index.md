---
title: "JAVA"
published: 2026-03-16
description: "这是一篇记录我JAVA学习的文章"
tags: ["基础教程", "JAVA", "编程"]
category: "基础教程"
draft: false
---
> 2026年开学第一个学期，我开始了 Java 基础的学习。   
>  Java与Csharp的语法结构十分相似，本文中 Java 使用的 IDE 是 `IntelliJ IDEA`。

# 环境与第一个程序

创建一个项目，选择 Java 模块，不需要模板，自行选择路径与命名，不要出现中文。 项目创建完成后，在 `src` 目录下新建一个 `软件包`，`软件包` 内创建 `类` 文件，IDEA 会默认生成如下结构：

```java
public class Main {
    public static void main(String[] args) {
        // 代码写在这里
    }
}
```

与 C# 类似，main 方法是程序的入口，代码从这里开始执行。 在 main 方法中输入以下代码，点击左侧绿色运行按钮或按 `Shift + F10` 运行：

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

控制台输出：

```
Hello, World!
```

`System.out.println()` 是 Java 中最基础的输出语句，作用与 C# 的 `Console.WriteLine()` 相同，输出内容后自动换行。 `System.out.print()` 则不会自动换行，可以配合 `\n`（换行）、`\t`（制表符）手动控制格式。

# 注释与标识符

```java
// 单行注释

/*
   多行注释
*/

/**
 * 文档注释
 */
```

**关键字**：Java 中赋予了特定用途和含义的保留词，编辑器会高亮显示，如 `public`、`class`、`int` 等。

**标识符**（自己命名的词）需满足：

- 不能使用除 `_`、`$` 以外的符号
- 不能以数字开头
- 不能使用关键字
- 区分大小写，建议见名知意

常见命名规范：

| 场景      | 规范           | 示例                 |
| ------- | ------------ | ------------------ |
| 包名      | 全小写，用 `.` 隔开 | `com.example.util` |
| 类名、接口名  | 大驼峰          | `MyClass`          |
| 变量名、方法名 | 小驼峰          | `myVariable`       |
| 常量名     | 全大写          | `MAX_SIZE`         |

# 数据类型

Java 的数据类型分为**基本数据类型**和**引用数据类型**。

## 基本数据类型

```java
// 整数类型
byte  a = 127;                    // 字节
short b = 10000;                  // 短整型
int   c = 1000000000;             // 整型
long  d = 1000000000000000000L;   // 长整型，末尾加 L

// 浮点类型
float  e = 1.111f;   // 单精度，末尾加 f
double f = 1.222;    // 双精度

// 字符类型
char g = '牢';       // 存单个字符，可通过 Unicode 编码转为 int
c = g;
System.out.println(c); // 输出对应 Unicode 数值

// 布尔类型
boolean h = true;
boolean i = 5 > 3;   // 可以直接存逻辑运算的结果
System.out.println(i); // true
```

## 引用数据类型

```java
String j = "张三";   // 字符串
// 还有类类型、数组等
```

## 数据类型转换

**自动转换**：小类型转大类型，直接赋值即可。

**强制转换**：大类型转小类型，需要手动指定，小数转整数只保留整数部分。

```java
int  i1 = 20;
byte i2 = 10;

i2 = (byte) i1;   // 强制转换：大转小
System.out.println(i2); // 20
```

# 变量

变量是内存中有类型、标识名、值的一块空间。

```java
// 先声明后赋值
float chenji;
chenji = 98.5f;

// 声明同时赋值
float chenji = 98.5f;
String name = "张三";
char sex = '男';

System.out.println(chenji); // 98.5
System.out.println(name);   // 张三
System.out.println(sex);    // 男
```

# 运算符

## 常用运算符一览

```java
// 赋值运算符
int a = 10;

// 算数运算符：+ - * / % += -= ++ --
int c = a++;     // 先把 a 的值赋给 c，再自增
System.out.println(a); // 11
System.out.println(c); // 10

// 关系运算符：> < >= <= != ==（结果都是布尔值）

// 逻辑运算符：&& || !
boolean f  = 1 < 2 && 2 > 1;   // true
boolean f1 = 2 == 3 || 1 == 1; // true
boolean f2 = !(1 < 2);         // false
```

**优先级**（从高到低）：`!` > 算数 > 比较 > `&&` > `||` > 赋值

小括号优先级最高，可用于调整执行顺序。

## 字符串比较

字符串不能用 `==` 比较内容，应使用 `.equals()` 方法：

```java
String s1 = "aa";
String s2 = "aa";
boolean s3 = s1.equals(s2);
System.out.println("s3：" + s3); // s3：true
```

# 键盘输入

Java 通过 `Scanner` 类从键盘读取用户输入：

```java
import java.util.Scanner;

Scanner input = new Scanner(System.in);

// 读取整数
int k = input.nextInt();

// 读取字符串
String name = input.next();

// 读取浮点数（带输入校验）
System.out.println("请输入金额");
if (input.hasNextDouble()) {
    double j = input.nextDouble();
    System.out.println(j);
} else {
    System.out.println("输入错误");
}
```

# 选择结构

## if 语句

```java
// 单分支
if (条件) {
    // 成立时执行
}

// 双分支
if (条件) {
    // 成立
} else {
    // 不成立
}

// 多分支
int score = 90;
if (score >= 90) {
    System.out.println("优秀");
} else if (score >= 80) {
    System.out.println("良好");
} else if (score >= 70) {
    System.out.println("中等");
} else if (score >= 60) {
    System.out.println("及格");
} else {
    System.out.println("不及格");
}
```

if 语句可以相互嵌套：

```java
int s = 9;
int sex = 0; // 0：男，-1：女

if (s < 10) {
    if (sex == 0) {
        System.out.println("男子组");
    } else {
        System.out.println("女子组");
    }
} else {
    System.out.println("out");
}
```

## switch 语句

switch 的表达式需要是整型或可自动转为整型的数据类型（如 char）。

```java
int i = 1;
switch (i) {
    case 1:
        System.out.println("周一");
        break;
    case 2:
        System.out.println("周二");
        break;
    // ...
    default:
        System.out.println("无效的日期");
}
```

# 循环结构

## while 循环

先判断条件，再执行。

```java
int a = 1;
while (a < 10) {
    System.out.println(a);
    a++;
}
```

## do-while 循环

先执行一次，再判断条件。

```java
int a = 1;
do {
    System.out.println(a);
    a++;
} while (a < 10);
```

## for 循环

```java
for (int a = 1; a < 10; a++) {
    System.out.println(a);
}
```

循环中可以使用 `break` 结束整个循环，`continue` 跳过当前次进入下一次。