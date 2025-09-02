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
C#是微软开发的面向对象的高级编程语言，应用与桌面软件，游戏与unity等的开发。

在visual studio中，创建C#项目会默认生成如下代码段：
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
`short`，2个字节，使用时要在值后用`S`标识。   
`int`，4个字节。   
`long`，8个字节，使用时要在值后用`L`标识。   
## 浮点数
`float`，4字节，单精度小数，精确到小数点后7位。   
`double`，8字节，双精度小数，精确到小数点后15-16位。  
## 字符
`char`，存放单个字符，使用`''`标识。   
`string`，字符串，使用`""`标识。   
## 布尔值
`bool`，值为true或false，用于逻辑判断。
## 数据类型转换
### 方法1
基本语法：新变量 = 目标数据类型.parse(原变量)
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
变量名不可重复
## 变量命名：
- 只能包含字母、数字、下划线，不能包含空格和其他符号
- 见名知意
- 不能以数字开头
- 采用驼峰命名法
>大驼峰：每个单词的首字母都大写，如：ClassName    
>小驼峰：第一个单词的首字母小写，其他单词的首字母大写，如：className

与Python相似，但C#的变量与值需要是相同的数据类型。

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
# 运算符
## 数学运算符
`+`，`-`，`*`，`/`，`%`    
整数相除时结果自动取整。
## 关系运算符
 `==` 等于  
 `!=` 不等于  
 `>` 大于 / `>=` 大于等于  
 `<` 小于 / `<=` 小于等于
## 逻辑运算符
逻辑与（and）`&&`   
逻辑或（or）`||`    
逻辑非（not）`!`

## 运算符优先级
与Python相同，最高是`()`，最低是`=`

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
与Python中的if选择结构类似。

# 
