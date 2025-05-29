---
title: Python 0基础教程  长期更新
published: 2025-05-28
description: Python的0基础教程
image: ""
tags:
  - 教程
  - Python
category: 可能有用的教程
draft: false
lang: ""
---

>我也正在学习python，一边学习一边编写本篇教程，希望对你能有一点帮助

# 什么是Python

Python的创始人是吉多·范·罗森。   
Python是一种解释型、面向对象、动态数据类型的高级程序设计语言。  
Python的设计具有很强的可读性，相比其他语言经常使用英文关键字，它具有比其他语言更有特色语法结构。  


# 安装Python

因为Python是跨平台的，它可以运行在Windows、Mac和各种Linux/Unix系统上。在Windows上写Python程序，放到Linux上也是能够运行的。

要开始学习Python编程，首先就得把Python安装到你的电脑里。安装后，你会得到Python解释器（就是负责运行Python程序的），一个命令行交互环境，还有一个简单的集成开发环境。 

Python下载地址：([Download Python | Python.org](https://www.python.org/downloads/))  
安转时要注意勾选`Add Python 3.x to PATH`

# 文本编辑器

VS Code是**轻量级、高度可扩展的代码编辑器**。通过丰富的插件市场可以扩展成功能强大的IDE，支持几乎所有主流语言和框架。核心是通用性、灵活性和速度。  
下载地址：[Visual Studio Code - Code Editing. Redefined](https://code.visualstudio.com/)   


PyCharm是一个专注于 **Python开发** 的**全功能IDE**。深度集成Python生态系统，开箱即用，提供大量智能功能和专业工具。   
下载地址：[Download PyCharm: The Python IDE for data science and web development by JetBrains](https://www.jetbrains.com/pycharm/download/?section=windows)

# 输入与输出
做好上述准备，你就可以开始编写你的第一个程序了。  
## 输出
用`print()`在括号中加上字符串，就可以向屏幕上输出指定的文字。比如输出`'hello, world'`，用代码实现如下：  
```python
print("Hello, World!")
Hello, World!
```

`print()`函数也可以接受多个字符串，用逗号“,”隔开，就可以连成一串输出，每一个","在输出中以空格表示：
```python
print("Hello, World!","你好，世界！")
Hello, World! 你好，世界！
```
`print()`函数也可以打印数字与计算结果：
```python
print(100)
100
print(100+200)
300
```

## 输入
现在你已经可以用`print()`你想要的内容了，如果想输出自己输入的内容，Python提供了一个`input()`,可以将用户输入的内容存放在一个变量中，比如输入生日：
```python
birthday = input("你的生日是？")
```
当你运行时，Python就在等待你的输入了。这时，你可以输入任意字符，然后按回车后完成输入。  
输入完成后Python不会有任何提示，如果想看你输入的内容，可以使用刚才的`print()`来输出：
```python
birthday = input("你的生日是？")
#你的输入，这里假设为20010102  
print(birthday)
20010102  #你的输出
```
实际运行应该是如下图：  
![](https://cdn.jsdelivr.net/gh/luojisama/pic_bed@main/img/202505291053558.png)

### 注释
在Python中，单行注释用`#`，多行注释使用`"""`，`'''`,使用方法如下：  
```python
# print("Hello, World!")

'''
print(100)
print(100+200)
'''

"""
birthday = input("你的生日是？")
print(birthday)
"""
```

# 变量与数据类型

## 保留字
在Python中，有一些被赋予特殊意义的单词，这些单词就是保留字，编辑器会将保留字高亮标识。  

## 变量
在Python中，变量不仅可以为整数或浮点数，还可以是任意数据类型。  
变量有一个命名规则，可以由`字母`，`下划线`，`数字`组成，首位不能是数字，区分大小写，不能包含空格，不能使用保留字。
错误的变量名：  
`123a`  `bili bili`  `if`

## 数据类型
### 整型 int
Python可以处理任意大小的整数，包括负整数，在程序中的表示方法与在数学上的写法一样：  
`1`  `100`  `-100`   
对于很大的数，例如`10000000000`，很难数清楚0的个数。Python允许在数字中间以`_`分隔，所以在Python中`10_000_000_000`与`10000000000`是完全一样的

### 浮点型 float
浮点数也就是小数，之所以称为浮点数，是因为按照科学记数法表示时，一个浮点数的小数点位置是可变的，比如 $1.23 \times 10^9$ 和 $12.3 \times 10^8$ 是完全相等的.浮点数可以用数学写法，如`1.23`，`3.14`，`-9.01`，等等。但是对于很大或很小的浮点数，就必须用科学计数法表示，把10用e替代，$1.23 \times 10^9$ 就是`1.23e9`   

### 字符串 str
字符串是由单引号`'`或双引号`"`包裹起来的任意文本。   
如果字符串内部既包含`'`又包含`"`时可以用转义字符`\`来标识，比如：  
```python
'I\'m \"OK\"!'
```
这串字符串的内容是 `I'm "OK"!`   

### 布尔值
布尔值和布尔代数的表示完全一致，一个布尔值只有`True`、`False`两种值，要么是`True`，要么是`False`，在Python中，可以直接用`True`、`False`表示布尔值（请注意大小写） 

### 空值

空值是Python里一个特殊的值，用`None`表示。`None`是一个特殊的空值。

此外Python还提供了`组合` `集合`  `元组` `列表` `字典` 等多种数据类型。

### 获取数据类型与转换
在Python中，可以使用`type()`函数来获取变量的数据类型。如果变量`a`的数据类型为`字符串`，想把它转换为整型时，操作如下：
```python
a = ""
int(a)
```
其他数据类型转换以此类推。

# 运算符
在Python中，有`数学运算符`，`关系运算符`,`逻辑运算符`,`赋值运算符`

## 数学运算符
`+`  加法运算  
`-`  减法运算  
`*`  乘法运算  
`/`  除法运算   
`//` 整除  
`%`  取余数  
`**` 幂运算
>哪怕是两个整型做除法运算时，得到的结果也会是浮点型  

## 关系运算符
```python
 '==' 等于  
 '!=' 不等于  
 '>' 大于 / '>=' 大于等于  
 '<' 小于 / '<=' 小于等于
```

## 逻辑运算符
 
 **（逻辑与）**`and`   
	**规则**：左右条件**同时为真**时返回 `True`，否则返回 `False`。

 **（逻辑或）**`or`   
	**规则**：左右条件**任意一个为真**时返回 `True`，否则返回 `False`。

 **（逻辑非）** `not`   
	  **规则**：对条件取反，`True` 变 `False`，`False` 变 `True`。
