---
title: React 源码学习笔记：lane 模型（二）
date: 2022-12-04
tags: [React, lane, 源码]
categories: Frontend
---

## Lane 与 Fiber

在理解了 Lane 模型的基本操作之后，现在来看看 Lane 在 React 里与其他概念相关的操作。

在 React 的 Fiber 树中，持有对根节点的引用的节点类型是 FiberRoot，关于 Fiber 和 FiberRoot 的详细信息后面再继续深入学习了解，这里先理解 Lane 分别与 FiberRoot 和 Fiber 之间的关系。

## Lane 与 FiberRoot

在 FiberRoot 上有几个与 lane 模型相关的属性：

1. `pendingLanes`
2. `suspendedLanes`
3. `pingedLanes`
4. `expiredLanes`
5. `entangledLanes`
6. `entanglements: LaneMap<Lanes>`

前 5 个的数据类型都是 `Lanes`， 只有最后一个是 `LaneMap<Lanes>`，其实就是 `Lanes[]`，其长度固定为 31。

目前，对于这几个属性，我的理解并不全面。结合 fiber 在 React 的模型中体现的是一个任务，而 FiberRoot 指向的是一个 fiber 树的根节点，一个合理的猜测就是，当这颗 fiber 树中一旦产生了新的任务，那么这个任务的优先级就会被放入到 FiberRoot 上的 lanes 属性。

前四个从名称上可以推断出代表着不同状态的 lanes，当一个任务刚刚被创建，相对应的 lane 应当被放到 pendingLanes 当中；如果这个任务超时了，相对应的 lane 则应当被放到 expiredLanes 当中；如果一个任务在执行中，但是突然被优先级更高的任务所打断，相对应的 lane 则应当被转移到 suspendedLanes。至于 pingedLanes，目前我对它的作用尚无了解。

<!--more-->

## Lane 模型中与 FiberRoot 和 Fiber 有关的运算

### getNextLanes(root: FiberRoot, wipLanes: Lanes): Lanes

顾名思义，这个函数的作用是*获取下一个 Lanes*。因此这里有一个很关键的问题，什么的下一个？通过检索这个函数被调用的地方，我发现它只在 `ReactFiberWorkLoop` 这个文件被调用过。虽然目前对 `ReactFiberWorkLoop` 详细作用并不全部了解，但是从文件名我们可以知道，这个文件里进行的是 React 的工作循环，即任务执行的地方。

结合这个函数的入参，第一个是 `FiberRoot`，显然就是要从 `FiberRoot` 上获取整颗树的下一个任务的优先级；第二个参数是 `wipLanes`，即 `workInProgressLanes`，当前正在处理中的任务的优先级。那么，可以猜想到它的作用是用来进行比较的，如果 nextLanes 的优先级没有 `wipLanes` 高，那么当前任务继续进行；反之，打断当前正在进行的任务。

再来看其实现。
先看获取 `nextLanes` 的部分。

1. 读取 `pendingLanes`，如果没有 `pendingLanes`，即 `pendingLanes === NoLanes`，表示没有下一个任务，直接返回 `NoLanes`。
2. 如果 `pendingLanes` 不是 `NoLanes`，设置 `nextLanes` 默认值为 `NoLanes`。
3. 取 `pendingLanes` 和 `NonIdleLanes`（除了 `OffscreenLane`、`IdleLane` 和 `IdleHydrationLane` 之外所有 lane 的集合） 的交集 `nonIdlePendingLanes`。
   1. 如果 `nonIdlePendingLanes` 不是 `NoLanes`，则取其与 `~suspendedLanes` 的交集 `nonIdleUnblockedLanes`。
      1. 如果 `nonIdleUnblockedLanes` 不是 `NoLanes`，取其中优先级最高的 `Lanes`。
      2. 如果 `nonIdleUnblockedLanes` 是 `NoLanes`，则取 `nonIdlePendingLanes` 与 `pingedLanes` 的交集 `nonIdlePingedLanes`，如果 `nonIdlePingedLanes` 不是 `NoLanes`，取其中优先级最高的 `Lanes`。
   2. 如果 `nonIdlePendingLanes` 是 `NoLanes`，意味着这时候 `pendingLanes` 里只有 `IdleLanes`，取 `pendingLanes` 和 `~suspendedLanes` 的交集 `idleUnblockedLanes`。
      1. 如果 `idleUnblockedLanes` 不是 `NoLanes`，则取其中优先级最高的 `Lanes`。
      2. 如果 `idleUnblockedLanes` 是 `NoLanes`，如果 `pingedLanes` 不是 `NoLanes`，取其中优先级最高的 `Lanes`。
4. 最终，如果 `nextLanes === NoLanes`，直接返回 `NoLanes`。否则，进入与 `wipLanes` 比较优先级的过程。

然后是 `nextLanes` 和 `wipLanes` 的比较，总的原则就是，如果 `wipLanes` 的优先级更高，则直接返回 `wipLanes`。否则进入对 `nextLanes` 的进一步处理：

1. 如果 `nextLanes` 中包含 `InputContinuousLane`， 则在其中*混入* `pendingLanes` 和 `DefaultLane` 的交集。
2. 处理 `entangledLanes`。如果 `entangledLanes` 存在并且与 `nextLanes` 之间存在交集，就把 `entanglements` 中的 lanes _混入_ `nextLanes`，并最终返回 `nextLanes`。

### markStarvedLanesAsExpired(root: FiberRoot, currentTime: number): void

这个函数相对容易理解一点，即根据当前时间，对 `FiberRoot` 中的 Lanes 进行状态变更，步骤如下：

1. 取出 `pendingLanes`、`suspendedLanes` 和 `pingedLanes`。
2. 再取出 `expirationTimes`。
3. 求 `pendingLanes` 中非 `RetryLanes` （比 `TransitionLanes` 优先级低，比 `IdleLanes` 的优先级高的 4 个 Lane） 的部分进行状态变更：
   1. 从低到高依此取出每个 lane
   2. 再取出对应这个 lane 在 `expirationTimes` 中的 `expirationTime`
      1. 如果 `expirationTime` 是 `NoTimestamp`，即这个 Lane 永不过期
         1. 如果这个 lane 不是 `suspendedLane`，或者是 `pingedLane`，则重新计算 `expirationTime`，并更新到 `expirationTimes` 当中。
      2. 否则，如果 `expirationTime <= currentTime`，则把这个 lane 加入到 expiredLanes

### getMostRecentEventTime(root: FiberRoot, lanes: Lanes): number

这个函数相对也比较容易理解。第一个参数是 `FiberRoot` 类型。在 `FiberRoot` 上有一个属性 `eventTimes`，这是一个长度为 31 （与 lane 的种类一致） 的数组。第二个参数是 Lanes，恰好与 `eventTimes` 长度对应上。因此，这个函数就是对第二个入参 `lanes` 进行迭代，在每一个存在 `Lane` 的位上，即二进制表示中值为 1，取这个位对应在 `eventTimes` 上的一个时间戳，最后返回最大的那个即可。

### markRootUpdated(root: FiberRoot, updateLane: Lane, eventTime: number): void

这个函数就是更新 `FiberRoot#pendingLanes` 的实现。

1. 把 `updateLane` 加入到 `root.pendingLanes` 这个集合中
2. 如果 `updateLane` 不是 `IdleLane`，把 `root.suspendedLanes` 和 `root.pingedLanes` 置为 `NoLanes`
3. 更新 `updateLane` 对应在 `root.eventTimes` 中的时间戳为 `eventTime`

### markRootSuspended(root: FiberRoot, suspendedLanes: Lanes): void

这个函数就是更新 `FiberRoot#suspendedLanes` 的实现。

1. 把 `suspendedLanes` 加入到 `root.suspendedLanes` 这个集合中
2. 更新 `root.pingedLanes`， 把 `root.suspendedLanes` 从中移除
3. 更新 `root.expirationTimes`，把 `suspendedLanes` 中 `Lane` 对应的 `expirationTime` 置成 `NoTimestamp`，即中断的任务永不过期

### markRootPinged(root: FiberRoot, pingedLanes: Lanes，eventTime: number): void

这个函数就是更新 `FiberRoot#pingedLanes` 的实现。一个很有意思的点是入参中包括三个参数，但实际上第三个参数 `eventTime`
在函数体中并没有被使用。其细节如下：

1. 把 `root.suspendedLanes` 和第二个参数 `pingedLanes` 的交集，加入到 `root.pingedLanes` 这个集合中。

### markRootFinished(root: FiberRoot, remainingLanes: Lanes): void

从函数名和入参推断，这个函数的作用是标记一部分 work 已经完成。之所以说是一部分，是因为第二个参数名为 `remainingLanes`，意味着还有剩余的工作。实现细节如下：

1. 计算出已经 finish 的 lanes，`root.pendingLanes & ~remainingLanes`。
2. 把 `root.pendingLanes` 置为 `remainingLanes`。
3. 把 `root.suspendedLanes` 和 `root.pingedLanes` 置为 `NoLanes`。
4. 把 `expiredLanes`、`expiredLanes`、`expiredLanes` 和 `errorRecoveryDisabledLanes` 都置为其与 `remainingLanes` 的交集。
5. 迭代已经 finish 的 lanes，针对其中每个 lane，
   1. 把 `root.entanglements` 中对应位置的元素置为 `NoLanes`
   2. 把 `root.eventTimes` 中对应位置的元素置为 `NoTimestamp`
   3. 把 `root.expirationTimes` 中对应位置的元素置为 `NoTimestamp`
   4. 更新 `root.hiddenUpdates` 中对应位置的元素为 `null`; `hiddenUpdates` 每个位置的元素也是一个数组，元素则是 `update`，而每个 `update` 也有 `lane` 属性。如果 `update` 的 `lane` 是 `OffscreenLane`，则只为 `NoLane`，否则保持不变

### markRootEntangled(root: FiberRoot, entangledLanes: Lanes): void

这个函数就是更新 `root.entangledLanes` 的实现。

1. 把 `entangledLanes` 加入到 `root.entangledLanes`
2. 取出 `root.entanglements`，迭代更新后的 `entangledLanes`
   1. 如果一个二进制位上的 Lane 是本次新增的，或者原本就存在，那就把对应的 `entanglement` 与 `entangledLanes` 合并。

### markHiddenUpdate(root: FiberRoot, update: ConcurrentUpdate, lane: Lane): void

这个函数就是更新 `root.hiddenUpdates` 的实现。

1. 计算出这个 `update` 对应的 lane，即第三个参数的二进制位中的 1 的下标
2. 取出这个下标对应的 `hiddenUpdateForLane`
3. 将 `update` push 到 `hiddenUpdateForLane`
4. 更新 `update.lane`，向其中加入 `OffscreenLane`

### getBumpedLaneForHydration(root: FiberRoot, renderLanes: Lanes): Lane

目前尚不清楚这个函数的作用是什么，其细节如下：

1. 取出 `renderLanes` 中优先级最高的 `renderLane`
2. 将 `renderLane` 映射为某一个 `hydrationLane`
   1. `SyncLane` -> `SyncHydrationLane`
   2. `InputContinuousLane` -> `InputContinuousHydrationLane`
   3. `DefaultLane` -> `DefaultHydrationLane`
   4. 从 `TransitionLane1` 到 `RetryLane4` 都 -> `TransitionHydrationLane`
   5. `IdleLane` -> `IdleHydrationLane`
   6. 其他 -> `NoLane`
3. 检查 `hydrationLane` 与 `root.suspendedLanes` 和 `renderLanes` 的合集是否存在交集（why?），
   1. 如果存在，则返回 `NoLane`
   2. 否则，返回 `hydrationLane`

### addFiberToLanesMap(root: FiberRoot, fiber: Fiber, lanes: Lanes | Lane): void

目前尚不清楚这个函数的作用是什么，其细节如下：

1. 获取 `root.pendingUpdatersLaneMap`
2. 迭代第三个参数 `lanes`，取其二进制位上的每个 Lane
   1. 获取这个 Lane 对应下标在 `pendingUpdatersLaneMap` 中的元素 `updater`
   2. 把第二个参数 `fiber` 添加到这个 `updater` 中

### movePendingFibersToMemoized(root: FiberRoot, lanes: Lanes): void

这个函数是用来把 `FiberRoot` 中 `pendingUpdatersLaneMap` 中的 fiber，添加到 `memoizedUpdaters` 中。其实现细节如下：

1. 获取 `root.pendingUpdatersLaneMap` 和 `root.memoizedUpdaters`
2. 迭代第二个参数 `lanes`，取其二进制位上的每个 Lane
   1. 获取这个 Lane 对应下标在 `pendingUpdatersLaneMap` 中的元素 `updaters`
   2. 如果 `updaters.size > 0`，迭代 `updaters` 中的 fiber
      1. 取 `fiber.alternate`, 如果 `alternate` 为 `null` 或者 `memoizedUpdaters` 不包含 `alternate`，则将其添加到 `memoizedUpdaters`
      2. 清空 `updaters`

以上就是 Lane 模型中与 `FiberRoot` 和 `Fiber` 有关的运算。除此之外， Lane 模型中还导出了一部分无入参的函数。函数必定要有操作对象，要么是入参，要么就是模块内的变量。这些无入参的函数，操作对象就是 `ReactFiberLane` 这个模块内部的变量。`ReactFiberLane` 中的模块变量有两个：

1. `let nextTransitionLane: Lane = TransitionLane1;`
2. `let nextRetryLane: Lane = RetryLane1;`

下面是操作他们的函数。

### claimNextTransitionLane(): Lane

`claimNextTransitionLane` 就是更新 `nextTransitionLane` 的函数。其步骤如下：

1. 保存 `nextTransitionLane` 当前的值在 `lane` 中
2. 把 `nextTransitionLane` 向左移动一位，即将其变成相邻的更低优先级
3. 如果 `nextTransitionLane` 新的值已经超越了 `TransitionLanes` 的范畴，则将其重置为 `TransitionLane1`
4. 返回 `nextTransitionLane` 变更之前的值

需要注意的一点是，调用 `claimNextTransitionLane` 获得的是 `nextTransitionLane` 当前值，不是变更之后的值。

### claimNextRetryLane(): Lane

`claimNextRetryLane` 就是更新 `nextRetryLane` 的函数，其实现与 `claimNextTransitionLane` 几乎一模一样，因此不再赘述。

到这里，整个 Lane 模型中支持的运算已经全部解释完毕，大部分的运算都比较容易理解。比较难懂的几个是因为与 `FiberRoot` 中一些属性的作用有关系，但是我目前尚不理解这些属性，所以暂时无法解释，只能留待后面理解了之后再做回顾
。
