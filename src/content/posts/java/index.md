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

# 类与对象

> 这部分是面向对象的起点，Java 里几乎所有东西都围着 `class` 转。

## 什么是类和对象

**类**：一类事物的统称，是抽象的概念，由思维产生。如：人、学生、汽车。

**对象**：实际存在的某个事物，能看得见摸得着。如：张三、李四。

类是对象的抽象，对象是类的实例化。

## 定义一个类

Java 使用 `class` 关键字定义类，类中包含属性（静态特征）和方法（动态特征）：

```java
public class Dog {
    // 静态特征：属性
    String name;    // 昵称
    String strain;  // 品种
    double weight;  // 体重

    // 动态特征：方法
    public void show() {
        System.out.println("我的狗的名字是：" + name + " 品种是：" + strain + " 体重是：" + weight + "KG");
    }
}
```

## 创建对象

```java
// 类名 对象名 = new 类名();
Dog dog = new Dog();

// 调用属性赋值
dog.name = "kobe";
dog.strain = "拉得不多";
dog.weight = 5.45;

// 调用方法
dog.show();
```

## 方法的定义与返回值

```java
public 返回值类型 方法名() {
    // 方法体
    return 表达式;
}
```

- 返回值类型决定了 `return` 后返回的值的类型，二者要匹配
- 没有返回值使用 `void`，不需要 `return` 语句
- `return` 是方法体的最后一条语句，只能返回一个值

```java
public class Student {
    String name;
    double score;

    public void study() {
        System.out.println(name + "的语文成绩为" + score);
    }

    public double sum() {
        double a = 350.00;
        return a * 1.2;  // 返回计算结果
    }
}
```

## 变量的作用域

### 全局变量（成员变量）

定义在类中，Java 会自动给初始值：`String` 为 `null`，整型为 `0`，浮点为 `0.0`，布尔为 `false`。在整个类中都可以使用。

### 局部变量

定义在方法或代码块中，Java 不会给初始值，只在定义该变量的方法或代码块中有效。

全局变量和局部变量可以重名，局部变量的调用优先级更高。

## 有参方法

```java
public 返回值类型 方法名(参数1类型 参数1名, 参数2类型 参数2名) {
    方法体;
}
```

调用时传入的是**实际参数**，定义时括号里的是**形式参数**，两者的数量、数据类型、顺序要一一对应。

```java
public class Cal {
    // 计算两个数的和，有返回值
    public int sum(int a, int b) {
        int c = a + b;
        return c;
    }

    // 计算两个数的差，无返回值
    public void gap(int a, int b) {
        int c = a - b;
        System.out.println(c);
    }
}

// 调用
Cal cal = new Cal();
int result = cal.sum(10, 20); // 传入实参
```

## 包

包名全部小写，多级用 `.` 隔开，例如 `team.shiro.javaoop`。包可以解决文件名冲突，方便管理类和接口。

```java
// 声明包，写在第一行
package team.shiro;

// 导入包，写在 package 后
import java.util.*;
```

---

# 数组

## 数组是什么

用来存储一组相同数据类型的数据。

**特点**：能存储多个值，所有值数据类型相同，操作方便。

**相关概念**：

- **标识符**：数组的名称
- **数组元素**：存在数组中的每个数据
- **数组下标**：数据的位置编号，从 `0` 开始
- **数据类型**：数组可存放的数据类型

## 声明与使用

```java
// 声明方式
int[] a;
int b[];

// 声明时指定大小
int[] c = new int[5];

// 声明时直接赋值
int[] d = {1, 2, 3, 4, 5};

// 分配空间
a = new int[5];

// 通过下标存取元素
a[0] = 10;
a[0] = a[0] + 10;
```

## 数组遍历

数组遍历通过循环 + 下标实现，`数组名.length` 获取数组长度：

```java
double[] arr = new double[5];
double sum = 0.0;

for (int i = 0; i < arr.length; i++) {
    System.out.println("请输入金额");
    arr[i] = input.nextDouble();
    sum += arr[i];
}

System.out.println("序号\t\t金额");
for (int i = 0; i < arr.length; i++) {
    System.out.println((i + 1) + "\t\t" + arr[i]);
}
System.out.println("总金额\t" + sum);
```

## 数组排序

Java 提供了 `Arrays` 类，`sort()` 方法可对数组做升序排序：

```java
import java.util.Arrays;

int[] a = {4, 8, 2, 9, 1, 6, 7, 3};
Arrays.sort(a);
// 排序后：[1, 2, 3, 4, 6, 7, 8, 9]
```

## 最大值与最小值

将第一个值存入新变量，用循环逐个比较赋值：

```java
int[] arr = {8, 4, 2, 1, 23, 344, 12};
int min = arr[0];

for (int i = 1; i < arr.length; i++) {
    if (min > arr[i]) {
        min = arr[i];
    }
}
System.out.println(min); // 1
```

---

# 字符串操作

`String` 提供了一系列实用方法，`StringBuffer` 是它的增强版。

```java
String str = "张三";

// length()：计算字符串长度
System.out.println(str.length()); // 2

// equals()：比较两个字符串的值（== 比较的是内存地址）
String s1 = new String("man");
String s2 = new String("man");
System.out.println(s1.equals(s2)); // true
System.out.println(s1 == s2);      // false

// equalsIgnoreCase()：忽略大小写比较
"ABC".equalsIgnoreCase("abc"); // true

// toLowerCase() / toUpperCase()：转大小写
"ABc".toLowerCase(); // "abc"
"ABc".toUpperCase(); // "ABC"

// concat()：连接字符串（也可以用 +）
"kobe".concat("24"); // "kobe24"

// indexOf()：某字符第一次出现的位置
// lastIndexOf()：某字符最后一次出现的位置
String s = "aubdiubaiucb";
System.out.println(s.indexOf("b"));     // 1
System.out.println(s.lastIndexOf("b")); // 11

// substring(n, m)：截取字符串，n 开始，m 结束（不含）
s.substring(3, 5); // "di"

// split()：按指定字符拆分，返回数组
String s7 = "abc cde fgh ijk";
String[] arr = s7.split(" ");
// ["abc", "cde", "fgh", "ijk"]

// StringBuffer：String 的增强类，适合频繁修改字符串
StringBuffer sb = new StringBuffer("man");
System.out.println(sb); // man
```

---

# 构造方法

## 是什么

方法名和类名一致，没有返回值（也不写 `void`）的方法。在 `new` 对象时自动调用，用于初始化对象。

```java
// 语法
public 类名(参数) {
    // 初始化逻辑
}
```

## 特点

- 方法名与类名一致
- 没有返回值，没有 `return` 语句
- 可以有参数
- `new` 对象时自动调用
- Java 会默认生成一个无参构造方法，一旦自己写了构造方法，默认的就失效了，需要手动补回无参构造

```java
public class Car {
    String color;
    double speed;
    int num;

    // 无参构造（自己写了有参构造后需要手动补上）
    public Car() {
        System.out.println("空构造");
    }

    // 有参构造
    public Car(String color) {
        this.color = color;
    }

    public Car(String color, double speed) {
        this.color = color;
        this.speed = speed;
    }

    public Car(String color, double speed, int num) {
        this.color = color;
        this.speed = speed;
        this.num = num;
    }
}
```

## this 关键字

- `this` 在方法中表示当前正在调用该方法的对象
- 可以在方法内部访问对象的属性
- 可以调用当前类中的其他普通方法（直接调用或 `this.方法名()` 效果相同）
- 在构造方法中可以调用其他构造方法，但必须写在**第一行**：`this(参数列表)`

```java
public class Employee {
    String id;
    String name;
    int age;
    String phone;
    double sal;

    public void input() {
        System.out.println("姓名：" + this.name + " 电话：" + this.phone + " 工资：" + this.sal);
    }

    public void show() {
        input(); // 也可以写 this.input();
        System.out.println("工号：" + this.id);
    }

    public Employee() {}

    public Employee(String id) {
        this.id = id;
    }

    public Employee(String id, String name) {
        this(id);         // 调用上面的单参构造，必须第一行
        this.name = name;
    }

    public Employee(String id, String name, int age) {
        this(id, name);   // 链式调用构造方法
        this.age = age;
    }

    public Employee(String id, String name, int age, String phone, double sal) {
        this(id, name, age);
        this.phone = phone;
        this.sal = sal;
    }
}
```

## 方法重载

在一个类中，方法名相同但参数列表不同的多个方法称为**重载**。

**特点**：
- 同一个类中，多个方法名相同
- 参数列表不同（个数或数据类型不同）
- 与返回值类型和访问修饰符无关
- 构造方法和普通方法都可以重载

```java
public class Cal {
    // 重载：参数类型不同
    public void sum(int a, int b) {
        System.out.println(a + b);
    }

    public double sum(double a, double b) {
        return a + b;
    }

    // 重载：参数个数不同
    public void sum(int a, int b, int c) {
        System.out.println(a + b + c);
    }
}
```