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

顾名思义，这个函数的作用是*获取下一个 Lanes*。因此这里有一个很关键的问题，什么的下一个？通过检索这个函数被调用的地方，我发现它只在 `ReactFiberWorkLoop` 这个文件被调用过。虽然目前对 `ReactFiberWorkLoop` 详细作用并不全部了解，但是从文件名我们可以知道，这个文件里进行的是 React 的工作循环，即任务执行的地方。

结合这个函数的入参，第一个是 FiberRoot，显然就是要从 FiberRoot 上获取整颗树的下一个任务的优先级；第二个参数是 wipLanes，即 workInProgressLanes，当前正在处理中的任务的优先级。那么，可以猜想到它的作用是用来进行比较的，如果 nextLanes 的优先级没有 wipLanes 高，那么当前任务继续进行；反之，打断当前正在进行的任务。

再来看其实现。
先看获取 nextLanes 的部分。

1. 读取 pendingLanes，如果没有 pendingLanes，即 `pendingLanes === NoLanes`，表示没有下一个任务，直接返回 `NoLanes`。
2. 如果 pendingLanes 不是 NoLanes ，设置 nextLanes 默认值为 NoLanes 。
3. 取 pendingLanes 和 NonIdleLanes（除了 OffscreenLane、IdleLane 和 IdleHydrationLane 之外所有 lane 的集合） 的交集 nonIdlePendingLanes。
   1. 如果 nonIdlePendingLanes 不是 NoLanes ，则取其与 ~suspendedLanes 的交集 nonIdleUnblockedLanes 。
      1. 如果 nonIdleUnblockedLanes 不是 NoLanes，取其中优先级最高的 Lanes 。
      2. 如果 nonIdleUnblockedLanes 是 NoLanes，则取 nonIdlePendingLanes 与 pingedLanes 的交集 nonIdlePingedLanes ，如果 nonIdlePingedLanes 不是 NoLanes，取其中优先级最高的 Lanes 。
   2. 如果 nonIdlePendingLanes 是 NoLanes ，意味着这时候 pendingLanes 里只有 IdleLanes ，取 pendingLanes 和 ~suspendedLanes 的交集 idleUnblockedLanes 。
      1. 如果 idleUnblockedLanes 不是 NoLanes ，则取其中优先级最高的 Lanes 。
      2. 如果 idleUnblockedLanes 是 NoLanes，如果 pingedLanes 不是 NoLanes，取其中优先级最高的 Lanes 。
4. 最终，如果 `nextLanes === NoLanes`，直接返回 NoLanes。否则，进入与 wipLanes 比较优先级的过程。

然后是 nextLanes 和 wipLanes 的比较，总的原则就是，如果 wipLanes 的优先级更高，则直接返回 wipLanes。否则进入对 nextLanes 的进一步处理：

1. 如果 nextLanes 中包含 InputContinuousLane ， 则在其中*混入* pendingLanes 和 DefaultLane 的交集。
2. 处理 entangledLanes 。如果 entangledLanes 存在并且与 nextLanes 之间存在交集，就把 entanglements 中的 lanes _混入_ nextLanes ，并最终返回 nextLanes 。

### markStarvedLanesAsExpired(root: FiberRoot, currentTime: number): void

这个函数相对容易理解一点，即根据当前时间，对 FiberRoot 中的 Lanes 进行状态变更，步骤如下：

1. 取出 pendingLanes、suspendedLanes 和 pingedLanes 。
2. 再取出 expirationTimes 。
3. 求 pendingLanes 中非 RetryLanes （比 TransitionLanes 优先级低，比 IdleLanes 的优先级高的 4 个 Lane） 的部分进行状态变更：
   1. 从低到高依此取出每个 lane
   2. 再取出对应这个 lane 在 expirationTimes 中的 expirationTime
      1. 如果 expirationTime 是 NoTimestamp ，即这个 Lane 永不过期
         1. 如果这个 lane 不是 suspendedLane ，或者是 pingedLane ，则重新计算 expirationTime ，并更新到 expirationTimes 当中。
      2. 否则，如果 `expirationTime <= currentTime` ，则把这个 lane 加入到 expiredLanes

### getMostRecentEventTime(root: FiberRoot, lanes: Lanes): number

这个函数相对也比较容易理解。第一个参数是 FiberRoot 类型。在 FiberRoot 上有一个属性 `eventTimes` ，这是一个长度为 31 （与 lane 的种类一致） 的数组。第二个参数是 Lanes ，恰好与 `eventTimes` 长度对应上。因此，这个函数就是对第二个入参 `lanes` 进行迭代，在每一个存在 `Lane` 的位上，即二进制表示中值为 1 ，取这个位对应在 `eventTimes` 上的一个时间戳，最后返回最大的那个即可。
