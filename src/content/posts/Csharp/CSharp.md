---
title: 一些C#的学习笔记
published: 2025-08-26
description: C#基础
image: ""
tags: ["基础教程","C#"]
category: 基础教程
draft: false
---


>这里是我学习C#时的学习笔记。
# 什么是C# 
C#（读作 "C Sharp"）是一种由微软开发的现代化、通用型、面向对象的编程语言。它最初由 Anders Hejlsberg 领导开发，并于 2000 年发布，作为 .NET 平台的核心语言之一。

在Visual Studio中，选择C#，Windows，控制台·创建项目会在`Program.cs`中默认生成如下代码段：
```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

//using使用
namespace demo01
    //命名空间
{
    internal class Program
        //internal内部
        //class类
    {
        static void Main(string[] args)
        //主函数，是程序的入口
        {
        }
    }
}

```
代码写在主函数中。
# 数据类型
## 整数
`byte`，1个字节。   
`short`，2个字节。   
`int`，4个字节。   
`long`，8个字节，使用时要在值后用`L`标识。   
## 浮点数
`float`，4字节，单精度小数，精确到小数点后7位，使用时要用`F`标识。   
`double`，8字节，双精度小数，精确到小数点后15-16位。  
## 字符
`char`，存放单个字符，使用`''`标识。   
`string`，字符串，使用`""`标识。   
## 布尔值
`bool`，值为true或false，用于逻辑判断。
## 数据类型转换
### 方法1
基本语法：新变量 = 目标数据类型.Parse(原变量)
例：
```csharp
string a = "123";
int b;
b = int.Parse(a);
Console.WriteLine(b is int);
```
输出如下：
```csharp
True
```
### 方法2
```csharp
int a = 10;
byte b = 0;
a = b;        //小转大自动转
b = (byte)a;  //大转小强制转
```
强制转换会导致数据丢失。
# 变量
## 变量命名：
- 变量名不可重复
- 只能包含字母、数字、下划线，不能包含空格和其他符号
- 见名知意
- 不能以数字开头
- 采用驼峰命名法
>大驼峰：每个单词的首字母都大写，如：ClassName    
>小驼峰：第一个单词的首字母小写，其他单词的首字母大写，如：className

与Python类似，但C#的变量与值需要是相同的数据类型。
## 变量声明
基本语法：
- 数据类型 变量名;
- 数据类型 变量名 = 值;
- 数据类型 变量名1 = 值1 ,变量名2 = 值2;
```csharp
  int A1;
  //声明一个int类型，名称为A1的变量
  char B1 = 'C';
  //声明一个char类型，名称为B1，值为C的变量
  ```
## 手动输入
在C#中，手动输入值由提示词+获取输入信息来共同完成，例：
```csharp
Console.WriteLine("请输入你的年龄");
string Age = Console.ReadLine();
Console.WriteLine(Age);
```
输入输出如下：
```csharp
//输入17
17
//输入19
19
```
# 运算符
## 数学运算符
`+`，`-`，`*`，`/`，`%`    
自增/自减：++/--，相当于+=/-=
整数相除时结果自动取整。
## 关系运算符
 `==` 等于  
 `!=` 不等于  
 `>` 大于 / `>=` 大于等于  
 `<` 小于 / `<=` 小于等于
## 逻辑运算符

| 名称         | 符号   | 条件                   |
| ---------- | ---- | -------------------- |
| 条件逻辑与（and） | &&   | 左侧为 `false` 时，右侧不再计算 |
| 条件逻辑或（or）  | \|\| | 左侧为 `true` 时，右侧不再计算  |
| 逻辑非（not）   | !    | 取反布尔值                |
| 逻辑与        | &    | 始终计算两边，适合需要完整判断的场景   |
| 逻辑或        | \|   | 始终计算两边，适合位运算或完整逻辑判断  |

## 运算符优先级
与Python类似，C#中运算符优先级最高是`()`，最低是`=`

## is关键字
用于判断数据类型，返回的结果是bool类型。   
例：
```csharp
string str = "曼波";
bool flag = str is string;
Console.WriteLine(flag);
```
输出如下：
```csharp
True
```
## 三元表达式
与Python中的if选择类似。  
基本语法：条件 ? 结果1:结果2    
`?`表示询问条件。    
`:`表示结果，返回结果的数据类型由用户决定。   
例：
```csharp
int A = 10,A = 5,C = 1;
string result = A > C ? "A大于C" : "A小于C";
Console.WriteLine(result);
```
输出如下：
```csharp
A大于C
```
# 选择结构
## if选择结构
基本语法如下：
```csharp
//单分支
if (条件) 
{执行的代码}

//双分支
if (条件)
{条件为true时执行}
else
{条件为false时执行}

//多分支
if (条件1)
{条件1为true时执行}
else if (条件2)
{条件2为true时执行}
else
{条件为false时执行}
......
```
例：
```csharp
Console.WriteLine("请输入成绩");
string s = Console.ReadLine();
int score = int.Parse(s);
if (score >= 90)
{
    Console.WriteLine("优秀");
}
else if (score >= 80)
{
    Console.WriteLine("良好");
}
else if (score >= 70)
{
    Console.WriteLine("中等");
}
else if (score >= 60)
{
    Console.WriteLine("及格");
}
else
{
    Console.WriteLine("不及格");
}
```
## switch选择结构
基本语法：
```csharp
switch (表达式) {
case 表达式1:
	语句1;
	break;
case 表达式2:
	语句2;
	break;
default:
	break;
}
```
switch中，代码没先后顺序之分。   
在所有case值不满足的情况下才会执行default。   
case是明确且不会发生变化的值。   
支持整型，浮点，布尔，字符，枚举等数据类型。   

`switch`与`if`可以互相嵌套使用：
```csharp
 Console.WriteLine("请输入1-31的数字");
string str = Console.ReadLine();
int day = int.Parse(str);

if (day <= 31 && day > 0)
{
    int week = (day - 1) / 7 +1 ;
    day = day % 7;
    switch (day)
    {
        case 1:
            Console.WriteLine($"第{week}周的周一");
            break;
        case 2:
            Console.WriteLine($"第{week}周的周二");
            break;
        case 3:
            Console.WriteLine($"第{week}周的周三");
            break;
        case 4:
            Console.WriteLine($"第{week}周的周四");
            break;
        case 5:
            Console.WriteLine($"第{week}周的周五");
            break;
        case 6:
            Console.WriteLine($"第{week}周的周六");
            break;
        case 0:
            Console.WriteLine($"第{week}周的周日");
            break;
    }
}
else
{
    Console.WriteLine("输入错误");
}
```

# 循环结构
C#中有三种循环结构：`while`，`do-while`，`for`

## while()
`先判断后执行`
根据条件可以判断执行的次数。
基本语法：
```csharp
循环变量;
while (条件)
{
    代码串;
    循环迭代语句;
}
```
while循环缺少迭代语句会进入死循环。   
例：
```csharp
//循环输出1-10
int a = 1;
while (a<11)
{
    Console.WriteLine(a);
    a++;
}
```
## do{ } while()
`先执行后判断`
基本语法：
```csharp
循环变量;
do 
{
    代码串;
    循环迭代语句;
}
while (条件);
```
例：
```csharp
int a = 1;
do 
{
    Console.WriteLine(a);
    a += 2;
}
while (a <= 30);
```

## for 