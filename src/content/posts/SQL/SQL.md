---
title: SQL基础
published: 2025-09-18
description: 'SQL基础语法'
image: ''
tags: ["SQL基础","基础教程"]
category: '基础教程'
draft: false 
lang: ''
---
> 本篇文章是基于SQLserver编写的。

# 开始前的准备

## 什么是SQL？
简单来说，SQL就是访问和处理关系数据库的计算机标准语言。也就是说，无论用什么编程语言（Java、Python、C++……）编写程序，只要涉及到操作关系数据库，都必须通过SQL来完成。
所以，现代程序离不开关系数据库，要使用关系数据库就必须掌握SQL。
## 所需的软件
安装`SQLserver`与`Navicat`。   
安装完且配置好后在`控制台`输入：
```cmd
net start mssqlserver 
//启用SQLserver服务
```
如需停止输入：
```cmd
net stop mssqlserver
```
在Navicat中`连接->SQL server->测试链接`，如果出现如下图片则代表链接成功:
![](https://cdn.jsdelivr.net/gh/luojisama/pic_bed@main/img/20250918144234.png)

# 关系模型
## 基本概念
关系模型用二维表表示实体集，利用公共属性实现实体之间的联系。   
## 关系
关系是行与列交叉形成的二维表，表中的一行称为元组，一列称为属性，每个属性有一个取值范围，称为属性域。
## 关系的实质
1. 每一行中的所有数据都是同一类型，来自同一个域；
2. 每一列都有唯一的列名；
3. 列在表中的顺序无关紧要；
4. 表中的任意两行不能完全相同；
5. 行在表中的顺序也无关紧要；
6. 行与列的交叉点必须是单值。

## 创建
创建数据库:
```sql
CREATE DATABASE 数据库名;
```

## 约束

```sql
CREATE TABLE dept(
		dep_no int PRIMARY KEY,
		dep_name VARCHAR(20) NOT NULL,
		dep_loc VARCHAR(20) UNIQUE
);

CREATE TABLE emp (
	    emp_no VARCHAR(20)NOT NULL,
	    emp_name VARCHAR(20) NOT NULL,
	    PRIMARY KEY(emp_no, emp_name),
	    emp_sex CHAR(2) NOT NULL DEFAULT '女',
	    emp_age INT CHECK (Age >= 18),
	    dep_no INT,
	    CONSTRAINT FK_emp_dept FOREIGN KEY (dep_no) REFERENCES dept(dep_no)
);
```
以下语句中第一行为创建时的语法，第二行为添加时的语法。
### 主键约束
```sql
dep_no int PRIMARY KEY

ALTER TABLE dept 
ADD CONSTRAINT PK_dept PRIMARY KEY(dep_no)
```
主键用于唯一标识表中的每个元组，且在关系数据库中每个关系必须具备主键，主键值唯一且不能为空。由于主键的作用十分重要，如何选取主键会对业务开发产生重要影响。如果我们以学生的身份证号作为主键，似乎能唯一定位记录。然而，身份证号也是一种业务场景，如果身份证号升位了，或者需要变更，作为主键，不得不修改的时候，就会对业务产生严重影响。  
所以，选取主键的一个基本原则是：不使用任何业务相关的字段作为主键。  因此，身份证号、手机号、邮箱地址这些看上去可以唯一的字段，均不可用作主键。
### 联合主键
```sql
PRIMARY KEY(emp_no, emp_name)

ALTER TABLE emp 
ADD CONSTRAINT PK_emp PRIMARY KEY(emp_no, emp_name)
```
关系数据库实际上还允许通过多个字段唯一标识记录，即两个或更多的字段都设置为主键，这种主键被称为联合主键。  
对于联合主键，允许一列有重复，只要不是所有主键列都重复即可。
## 外键约束
外键并不是通过列名实现的，而是通过定义外键约束实现的：
```sql
CONSTRAINT FK_emp_dept FOREIGN KEY (dep_no) REFERENCES dept(dep_no)

ALTER TABLE emp 
ADD CONSTRAINT FK_emp_dept FOREIGN KEY (dep_no) REFERENCES dept(dep_no)
```
其中`FK_emp_dept`可以为任意，但为了区分一般采用`FK_xx_xx`的命名格式，`FOREIGN KEY (dep_no)`指定了`dep_no`为外键，`REFERENCES dept(dep_no)`指定了这个外键将关联到`dept`列表的`dep_no`列。
## 非空约束
```sql
dep_name VARCHAR(20) NOT NULL
```
在字段末尾加上`NOT NULL`即可创建非空约束，表中该字段的值均不可为空。
## 唯一约束
```sql
dep_loc VARCHAR(20) UNIQUE

ALTER TABLE dept 
ADD CONSTRAINT UQ_dep_loc UNIQUE (dep_loc)
```
末尾添加`UNIQUE`可创建唯一约束，该字段不可重复。
## 默认值
```sql
emp_sex CHAR(2) NOT NULL DEFAULT '女'

ALTER TABLE emp 
ADD CONSTRAINT DF_emp_sex DEFAULT '女' FOR emp_sex
```
末尾添加`DEFAULT ''`可添加默认值，单引号中可任意修改。
## 自定义约束
```sql
emp_age INT CHECK (Age >= 18)

ALTER TABLE emp 
ADD CONSTRAINT CHK_emp_age CHEAK (age >= 18)
```
末尾添加`CHEAK ()`可创建自定义约束，括号中可自定义约束。
# 查询
假定有一个stu表，其中的值如下：

| s_id | s_name | s_sex | s_age | s_class |
| ---- | ------ | ----- | ----- | ------- |
| 1    | 张三     | 男     | 15    | 301     |
| 2    | 李四     | 男     | 16    | 301     |
| 3    | 王五     | 女     | 15    | 302     |
| 4    | 赵六     | 男     | 14    | 202     |

## 基本查询
```sql
SELECT * FROM stu;
```
`select`表示执行一次查询，`*`表示所有列，`FROM`表示要从哪个表查询。  
运行会输出`stu`表中所有数据。
`SELECT`语句并不要求`FROM`子句，例如：
```sql
SELECT 10+20
```
执行可以得到表达式的结果。
## 条件查询
```sql
SELECT * FROM stu WHERE s_sex = '男'
```
`where`表示查询表的条件，该语句运行会输出`stu`表中所有`s_sex`为`男`的数据。
表达式可以与逻辑运算符结合使用：
```sql
SELECT * FROM stu WHERE s_sex = '男' and s_class = '301'
```
常用的条件表达式：
> 使用>,>=,<,<=判断大小
> 使用=判断等于
> 使用<>判断不等与
> 使用LIKE判断相似，`%`表示任意字符，`_`表示单个字符
> BETWEEN...AND表示在...之间
> IN表示在集合内
## 投影查询
```sql
SELECT s_id,s_name from stu
```
投影查询只返回查询的列，同样可以使用`WHERE`。
## 排序
```sql
SELECT s_id,s_age FROM stu ORDER BY s_age
```
`ORDER BY`默认为升序(ASC)，如需使用降序(DESC)，须在后加`DESC`。
## 聚合函数
SQLSERVER中有如下聚合函数：

| 函数名   | 说明      |
| ----- | ------- |
| COUNT | 统计非空行数量 |
| SUM   | 求和      |
| AVG   | 求平均值    |
| MAX   | 取最大值    |
| MIN   | 取最小值    |
```sql
SELECT COUNT(*) AS 人数 FROM stu
```
## 分组
```sql
SELECT AVG(s_age) AS 平均年龄 FROM stu GROUP BY s_calss
```
常常与聚合函数搭配一起使用