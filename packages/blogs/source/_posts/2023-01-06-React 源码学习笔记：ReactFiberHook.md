---
title: WIP React 源码学习笔记：ReactFiberHook
date: 2023-01-06
tags: [React, fiber, hook, 源码]
categories: Frontend
---

这篇文章来看 `ReactFiberHook.js` 这个文件中的内容。
这个模块是 react-reconciler 中 Hooks 的实现细节，包括 `mount` 和 `update` 两个阶段，当然还有 `dev` 和 `prod` 的区分。

与 `ReactFiberWorkLoop` 模块类似，`ReactFiberHook` 也不是纯函数模块。这个模块内部声明了模块内变量，这些变量会在函数执行的过程发生变化，于模块导出函数而言，这些函数都是有副作用的。

<!--more-->

## 模块级变量

先简单介绍一下几个重要的模块级变量。

1. `renderLanes: Lanes = NoLanes`。每次函数式组件执行的时候，都会重置这个值，标识当前组件的 _优先级_
2. `let currentlyRenderingFiber: Fiber = null`。函数组件对应的 Fiber 节点
3. `let currentHook: Hook | null = null` 和 `let workInProgressHook: Hook | null = null`。每个 react hook 执行之后都会生成一个 hook 对象，前者对应的是已经存在的 Fiber 节点中的 hook，后者则是正在构建的 Fiber 树中的正在执行的 hook 生成的对象。

然后是几个 Dispatcher: 
1. ContextOnlyDispatcher
2. HooksDispatcherOnMount
3. HooksDispatcherOnUpdate
4. HooksDispatcherOnRerender