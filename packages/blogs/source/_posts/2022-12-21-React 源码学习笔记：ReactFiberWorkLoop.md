---
title: React 源码学习笔记：ReactFiberWorkLoop
date: 2022-12-21
tags: [React, fiber, workLoop, 源码]
categories: Frontend
---

这篇文章来看 `ReactFiberWorkLoop.js` 这个文件中的内容。
这个模块是 react-reconciler 中最核心的部分了，涉及到的内容也是非常多的。所以需要分几个步骤来拆解这个模块。

先看一下这个模块中定义了哪些 _模块级_ 变量和函数，即这些变量和函数仅在当前模块内部使用。
再看这个模块导入和导出了哪些变量。

<!--more-->

## 模块级变量


## 模块级函数