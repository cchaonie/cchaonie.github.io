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
在 FiberRoot 上有几个与 lane 模型相关的属性：

1. pendingLanes
2. suspendedLanes
3. pingedLanes
4. expiredLanes
5. entangledLanes
6. `entanglements: LaneMap<Lanes>`

前 5 个的数据类型都是 `Lanes`， 只有最后一个是 `LaneMap<Lanes>`，其实就是 `Lanes[]`，其长度固定为 31。

目前，对于这几个属性，我的理解并不全面。结合 fiber 在 React 的模型中体现的是一个任务，而 FiberRoot 指向的是一个 fiber 树的根节点，一个合理的猜测就是，当这颗 fiber 树中一旦产生了新的任务，那么这个任务的优先级就会被放入到 FiberRoot 上的 lanes 属性。

前四个从名称上可以推断出代表着不同状态的 lanes，当一个任务刚刚被创建，相对应的 lane 应当被放到 pendingLanes 当中；如果这个任务超时了，相对应的 lane 则应当被放到 expiredLanes 当中；如果一个任务在执行中，但是突然被优先级更高的任务所打断，相对应的 lane 则应当被转移到 suspendedLanes。至于 pingedLanes，目前我对它的作用尚无了解。

### getNextLanes(root: FiberRoot, wipLanes: Lanes): Lanes

### markStarvedLanesAsExpired(root: FiberRoot, currentTime: number): void
