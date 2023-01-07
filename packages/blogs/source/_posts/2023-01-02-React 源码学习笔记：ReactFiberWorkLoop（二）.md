---
title: React 源码学习笔记：ReactFiberWorkLoop（二）
date: 2023-01-02
tags: [React, fiber, workLoop, 源码]
categories: Frontend
---

这篇文章来看 `ReactFiberWorkLoop` 模块中 export 的部分。

## 变量

### ExecutionContext

1. `NoContext = 0b000`
2. `RenderContext = 0b010`
3. `CommitContext = 0b100`

与 Lane 模型类似，`ExecutionContext` 也是使用二进制格式的数字，因为这样进行 merge/include/exclude 等操作可以直接基于二进制本身，性能更好。

除了这三个变量导出之外，在模块内部，还有一个 `BatchedContext = 0b001`。

<!--more-->

### renderLanes

这个变量标识当前 render 任务的优先级，用于在其他辅助模块中使用，比如 `beginWork` 和 `completeWork`。在 `ReactFiberWorkLoop` 模块内部，使用的则是 `workInProgressRootRenderLanes`。

## 函数

### flushPassiveEffects(): boolean
