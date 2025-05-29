---
title: Python 零基础教程  长期更新
published: 2025-05-28
description: Python的零基础教程
image: ""
tags:
  - 教程
  - Python
category: 可能有用的教程
draft: false
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

## VS Code
VS Code是**轻量级、高度可扩展的代码编辑器**。通过丰富的插件市场可以扩展成功能强大的IDE，支持几乎所有主流语言和框架。核心是通用性、灵活性和速度。  
下载地址：[Visual Studio Code - Code Editing. Redefined](https://code.visualstudio.com/)   


## PyCharm
PyCharm是一个专注于 **Python开发** 的**全功能IDE**。深度集成Python生态系统，开箱即用，提供大量智能功能和专业工具。   
下载地址：[Download PyCharm: The Python IDE for data science and web development by JetBrains](https://www.jetbrains.com/pycharm/download/?section=windows)

# 输入与输出
做好上述准备，你就可以开始编写你的第一个程序了。  
## 输出
用`print()`在括号中加上字符串，就可以向屏幕上输出指定的文字。比如输出`'hello, world'`，用代码实现如下：  
```python
print("Hello, World!")
Hello, World! #输出
```

`print()`函数也可以接受多个字符串，用逗号“,”隔开，就可以连成一串输出，每一个","在输出中以空格表示：
```python
print("Hello, World!","你好，世界！")
Hello, World! 你好，世界！#输出
```
`print()`函数也可以打印数字与计算结果：
```python
print(100)
100  #输出
print(100+200)
300  #输出
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
字符串是由单引号`'`或双引号`"`包裹起来的任意文本，包括空格。   
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
 
 **逻辑与**`and`   
	**规则**：左右条件**同时为真**时返回 `True`，否则返回 `False`。

 **逻辑或**`or`   
	**规则**：左右条件**任意一个为真**时返回 `True`，否则返回 `False`。

 **逻辑非** `not`   
	  **规则**：对条件取反，`True` 变 `False`，`False` 变 `True`。

## 优先级
一般来说算数>比较>逻辑>赋值，可以通过添加小括号`()`的方式来调整运算符优先级。

# 选择结构
Python 的选择结构通过 **条件判断** 控制程序的分支执行，主要包括以下三种形式：  
## `if`语句
**单分支选择**：当条件为 `True` 时执行代码块。例：  
```python
age = 18
if age >= 18:
    print("已成年")  # 条件成立时执行
```
## `if-else`语句
**双分支选择**：根据条件二选一执行。例：  
```python
score = 75
if score >= 60:
    print("及格")
else:
    print("不及格")  # 条件不成立时执行
```
## `if-elif-else`语句
**多分支选择**：依次判断多个条件，执行第一个满足的分支。例：   
```python
grade = 85
if grade >= 90:
    print("优秀")
elif grade >= 80:  # 前一个条件不满足时检查
    print("良好")  # 输出: 良好
else:
    print("待提高")
```
## 嵌套
基本语法如下：
```python
if 条件表达式1:
	if 条件2表达式:
		执行代码1
	else:
		执行代码2
else:
	执行代码3
```

- **缩进规则**：Python 通过缩进（通常 4 个空格）定义代码块，缩进错误会导致语法错误。
- **条件表达式**：支持 `and`、`or`、`not` 组合复杂逻辑。
多分支时`else`可省略不写。   
选择结构是 Python 流程控制的基础，广泛用于数据过滤、用户交互等场景。

# 循环
在Python中有两种循环方式，分别是`while`与`for`

## `while`循环
**特点**：  
**基于条件**：只要条件为 `True`，就重复执行代码块。   
**适用场景**：不确定循环次数时（如用户输入、游戏循环）。
语法如下：
```python
while 条件:
    循环体
```
例：
```python
count = 0
while count < 3:
    print(f"Count: {count}")
    count += 1
```
输出：
```python
Count: 0
Count: 1
Count: 2
```
若条件永远为 `True`，会导致**无限循环**（需用 `break` 或修改条件终止）。   
可用 `else` 分支（循环正常结束时执行，被 `break` 打断则不执行）。
## `for`循环
**特点**：   
**遍历序列**：对可迭代对象（如列表、字符串、字典等）逐个处理。   
**适用场景**：已知循环次数或需遍历数据集合时。
语法如下：
```python
for 变量 in 可迭代对象:
    循环体
```
例：
```python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
```
输出：
```
apple
banana
cherry
```
可用 `range()`：生成数字序列控制循环次数。
循环中可使用`break`跳出循环，`continue`跳过此次循环。

## 循环嵌套
和if一样，两种循环也可以嵌套。
### for循环嵌套
语法：
```python
for 外层变量 in 外层序列:
    for 内层变量 in 内层序列:
        循环体
```
例：
```python
for i in range(1, 10):      # 外层循环：控制行数
    for j in range(1, i+1): # 内层循环：控制每行的列数
        print(f"{j}×{i}={i*j}", end="\t")
    print()  # 换行
```
输出：
```
1×1=1	
1×2=2	2×2=4	
1×3=3	2×3=6	3×3=9	
...
1×9=9	2×9=18	...	9×9=81
```

### while循环嵌套
语法：
```python
while 外层条件:
    while 内层条件:
        循环体
```
例：
```python
i = 1
while i < 10: 
    j = 1
    while j <= i:
        print(f"{j}×{i}={i*j}", end="\t")
        j += 1
    print()
    i += 1
```

用while循环嵌套改写，输出与上述for循环嵌套一致。  
`for`循环与`while`循环也可互相嵌套，注意循环条件，不要写成死循环。

# 字符串
Python中字符串也有许多操作，像是取出单个字符，获取长度等。  
## 保留格式输出
在开始`print()`中，输出多个通常是在同一行，如果像保留格式输出可以使用三个单引号`'''`或双引号`"""`括起来，如下所示：
```python
print("""a
b""")
```
输出为：
```
a
b
```
## 下标
在 Python 中，字符串是 **不可变的有序字符序列**，可以通过 **下标（索引）** 访问单个字符。下标从 `0` 开始，从左到右依次递增；同时也支持 **负数下标**，从右向左访问（`-1` 表示最后一个字符）。
语法：
```python
字符串[下标]
```
例：
```python
str1 = "Python零基础教程"
print(str1[5])
```
输出：
```
n
```
## 获取字符串长度
在 Python 中，可以使用 **`len()`** 函数获取字符串的长度（字符数量）。  
例：
```python
s = "Hello, 世界"
print(len(s)) 
```
输出：
```
9
```
**特殊字符**：如换行符 `\n`、制表符 `\t` 等均计为 1 个字符。

## 切片
切片是 Python 中一种强大的操作，用于从字符串（或列表等序列）中提取子序列。
语法：
```python
字符串[起始索引:结束索引:步长]
```
**`起始索引`**：切片开始位置，为负时从末尾开始（包含该索引）。   
**`结束索引`**：切片结束位置（不包含该索引）。   
**`步长`**：每隔多少个字符取一次，为正时从左向右，为负时反之（默认为1）。
例:
```python
s = "Hello, Python!"
print(s[0:5])
print(s[7:13])   
print(s[:5])
print(s[7:])
print(s[::2])
```
输出：
```
Hello   #（索引0到4）
Python  #（索引7到12）
Hello   #（省略起始，默认从0开始）
Python! #（省略结束，默认到末尾）
Hlo yhn #（步长为2，隔字符取）
```

## 字符串运算符
Python 提供了多种字符串运算符，用于拼接、重复、比较和成员检查等操作。以下是常用的字符串运算符及其用法：

### 字符串拼接  `+`
连接两个字符串，链接别的对象需先转换。
例：
```python
s1 = "Hello"
s2 = "World"
print(s1 + s2)
```
输出：
```
HelloWorld
```

###  重复运算符 `*`
重复字符串指定次数。  
例：
```python
s = "Hi"
print(s * 3)
```
输出：
```
HiHiHi
```

### 成员运算符 `in` / `not in`
检查子串是否存在于字符串中，为布尔值。
例：
```python
text = "Python is fun"
print("fun" in text)
print("Java" not in text)
```
输出：
```
True
True
```

### **比较运算符 `==`, `!=`, `>`, `<` 等**
**功能**：按字典序（ASCII/Unicode 值）比较字符串。  
**规则**：逐字符比较，直到分出大小。  
例：
```python
print("apple" == "apple")
print("apple" < "banana")
print("Zoo" > "apple")
```
输出：
```
True
True  #（'a' < 'b'）
False #（'Z' < 'a'）
```

### 原始字符串 `r` / `R`
忽略转义字符（如 `\n`、`\t`）。  
例：
```python
path = r"C:\new\folder"
print(path)
```
输出：
```
C:\new\folder   #（\n 不换行）
```

### 字符串检索函数
#### `find()`函数
返回子串 **第一次出现**的索引，未找到返回 `-1`。  
**参数**：  
`start`：搜索起始位置（可选）。    
`end`：搜索结束位置（可选）。
例：
```python
s = "hello world"
print(s.find("world"))
print(s.find("Python"))
```
输出：
```
6
-1
```
`rfind()`函数   
与`find()`函数类似，不过是从右边开始

#### `index()`函数
与 `find()` 类似，但未找到时会抛出 `ValueError`。
**参数**：  
`start`：搜索起始位置（可选）。    
`end`：搜索结束位置（可选）。
例：
```python
print(s.index("world"))
print(s.index("Python"))
```
输出：
```
6
ValueError
```
`rindex()`函数   
与`index()`函数类似，不过是从右边开始

#### `count()`函数
用于统计字符串中子串出现的次数
**参数**：  
`start`：搜索起始位置（可选）。    
`end`：搜索结束位置（可选）。
例：
```python
s = "banana"
print(s.count("a"))
print(s.count("na"))
```
输出：
```
3
2
```

### 字符串替换函数

#### `replace()`函数
将字符串中的 `old` 子串替换为 `new`。     
语法：
```python
字符串.replace(old,new,count)
```
**参数**：
`old`：需要替换的子串。    
`new`：替换后的新子串。    
`count`（可选）：最多替换次数（默认全部替换）。
例：
```python
text = "I like apples, apples are tasty"
new_text = text.replace("apples", "oranges")
print(new_text) 

print(text.replace("apples", "oranges", 1))```
输出：
```
I like oranges, oranges are tasty
I like oranges, apples are tasty #只替换第一个
```

### 字符串拆分函数
#### `split()`函数
将字符串按指定分隔符 `sep` 拆分成列表，默认按**空白字符**（空格、换行、制表符等）拆分。  
语法：
```python
字符串.split(sep, maxsplit=)
```
**参数：**
`sep`：分隔符（默认 `None`，表示按空白字符拆分）。   
`maxsplit`：最大拆分次数（默认 `-1`，表示不限次数）。
例：
```python
s = "Python Java C++ JavaScript"

print(s.split())

s2 = "apple,banana,orange"
print(s2.split(","))

print(s2.split(",", maxsplit=1))
```
输出：
```
输出: ['Python', 'Java', 'C++', 'JavaScript']
输出: ['apple', 'banana', 'orange']
输出: ['apple', 'banana,orange']

```
### 字符串组合函数
#### `join()`函数
用指定字符串作为分隔符，将可迭代对象（如列表、元组）中的元素连接成一个字符串。
例：
```python
words = ["Python", "Java", "C++"]
result = ", ".join(words)
print(result)
```
  输出：
```
Python, Java, C++
``` 

### 字符串转化函数
#### **1. `str.capitalize()
将字符串的**第一个字母大写**，其余字母转为小写。
例：
```python
s = "hello WORLD"
print(s.capitalize())  # 输出: "Hello world"
```

#### **2. `str.title()`**
将字符串中**每个单词的首字母大写**，其余字母转为小写。
例：
```python
s = "python is AWESOME"
print(s.title())  # 输出: "Python Is Awesome"
```

#### **3. `str.upper()`**
将字符串中**所有字母转为大写**。
例：
```python
s = "Hello Python"
print(s.upper())  # 输出: "HELLO PYTHON"
```

#### **4. `str.lower()`**
将字符串中**所有字母转为小写**。
例：
```python
s = "HELLO World"
print(s.lower())  # 输出: "hello world"
```

#### **5. `str.swapcase()`**
**反转字符串中字母的大小写**（大写转小写，小写转大写）。
例：
```python
s = "Hello PyThOn"
print(s.swapcase())  # 输出: "hELLO pYtHoN"
```

### 字符串判断函数
#### **1. `str.isdigit()`**

检测字符串是否**只包含数字**（0-9）。  
例：
```python
print("123".isdigit())    # True
print("12a3".isdigit())   # False
print("①".isdigit())      # True（Unicode数字）
```

#### **2. `str.isalpha()`**

检测字符串是否**只包含字母或文字**（包括中文、日文等Unicode字母）。  
例：
```python
print("Python".isalpha())  # True
print("你好".isalpha())     # True
print("a1".isalpha())      # False
```

#### **3. `str.isspace()`**

检测字符串是否**只包含空白字符**（空格、`\t`、`\n`等）。  
例：
```python
print("  ".isspace())     # True
print("\t\n".isspace())   # True
print(" a ".isspace())    # False
```

#### **4. `str.startswith(prefix)`**

检查字符串是否以**指定子串开头**，返回 `True`/`False`。  
例：
```python
s = "Hello World"
print(s.startswith("Hello"))  # True
print(s.startswith("World"))  # False
```

#### **5. `str.endswith(suffix)`**

检查字符串是否以**指定子串结尾**，返回 `True`/`False`。  
例：
```python
s = "example.txt"
print(s.endswith(".txt"))    # True
print(s.endswith(".jpg"))    # False
```

#### **6. `str.isalnum()`**

检测字符串是否**只包含字母或数字**（中英文均可，无符号和空格）。  
例：
```python
print("Python3".isalnum())   # True
print("你好123".isalnum())    # True
print("a@1".isalnum())       # False
```

### 字符串截取函数
#### `lstrip()`函数
移除字符串**左侧**指定的字符（默认移除空白符）。  
**参数**：
`chars`（可选）：指定要移除的字符集合，默认为空白符（空格、`\t`、`\n`等）。  
例：
```python
s = "   Hello World   "
print(s.lstrip())          # 输出: "Hello World   "（移除左侧空格）

s2 = "===Title==="
print(s2.lstrip("="))      # 输出: "Title==="（移除左侧等号）
```

#### `rstrip()`函数
移除字符串**右侧**指定的字符（默认移除空白符）。  
**参数**：
`chars`（可选）：指定要移除的字符集合，默认为空白符（空格、`\t`、`\n`等）。  
例：
```python
s = "   Hello World   "
print(s.rstrip())          # 输出: "   Hello World"（移除右侧空格）

s2 = "===Title==="
print(s2.rstrip("="))      # 输出: "===Title"（移除右侧等号）
```

#### `strip()`函数
移除字符串**两侧**指定的字符（默认移除空白符）。  
**参数**：
`chars`（可选）：指定要移除的字符集合，默认为空白符（空格、`\t`、`\n`等）。  
例：
```python
s = "   Hello World   "
print(s.strip())          # 输出: "Hello World"（移除右侧空格）

s2 = "===Title==="
print(s2.strip("="))      # 输出: "Title"（移除右侧等号）
```

### 字符串format格式化

####  数字格式化
```python
pi=3.1415926
print("保留两位小数: {:.2f}".format(pj))
print("科学计数法: {:.2e}".format(1000))
print("二进制: {:b}".format(5))
print("十六进制: {:x}".format(255))
print("百分比: {:.2%}".format(0.25))
print("千位分隔符: {:,}".format(1000000))
```
输出如下：
![](https://cdn.jsdelivr.net/gh/luojisama/pic_bed@main/img/202505291928875.png)
#### 格式与对齐
```python
print("左对齐: {:<10}".format("left"))
print("右对齐: {:>10}".format("right"))
print("居中对齐: {:^10}".format("center"))
print("填充符号: {:*^10}".format("center"))
```
输出如下：
![](https://cdn.jsdelivr.net/gh/luojisama/pic_bed@main/img/202505291929121.png)