---
title: 如何理解 React 里的 lane 模型（二）
date: 2022-12-04
tags: [React, lane]
categories: Frontend
---

## Lane 与 Fiber

在理解了 Lane 模型的基本操作之后，现在来看看 Lane 在 React 里与其他概念相关的操作。

在 React 的 Fiber 树中，持有对根节点的引用的节点类型是 FiberRoot，关于 Fiber 和 FiberRoot 的详细信息后面再继续深入学习了解，这里先理解 Lane 分别与 FiberRoot 和 Fiber 之间的关系。

## Lane 与 FiberRoot

### getNextLanes(root: FiberRoot, wipLanes: Lanes): Lanes

### markStarvedLanesAsExpired(root: FiberRoot, currentTime: number): void
