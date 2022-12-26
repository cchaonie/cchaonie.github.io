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

由于涉及到模块级变量很多，一个一个展开费时费力，因此需要先对他们进行分类。下面按照变量名的相似程度进行分类，因为名称相似的变量描述的内容相近。

### workInProgressRoot

1. `let workInProgressRoot: FiberRoot | null = null;`
2. `let workInProgressRootExitStatus: RootExitStatus = RootInProgress;`
3. `let workInProgressRootRenderLanes: Lanes = NoLanes;`
4. `let workInProgressRootDidAttachPingListener: boolean = false;`
5. `let workInProgressRootExitStatus: RootExitStatus = RootInProgress;`
6. `let workInProgressRootFatalError: mixed = null;`
7. `let workInProgressRootSkippedLanes: Lanes = NoLanes;`
8. `let workInProgressRootInterleavedUpdatedLanes: Lanes = NoLanes;`
9. `let workInProgressRootRenderPhaseUpdatedLanes: Lanes = NoLanes;`
10. `let workInProgressRootPingedLanes: Lanes = NoLanes;`
11. `let workInProgressRootConcurrentErrors: Array<CapturedValue<mixed>> | null = null;`
12. `let workInProgressRootRecoverableErrors: Array<CapturedValue<mixed>> | null = null;`
13. `let workInProgressRootRenderTargetTime: number = Infinity;`

### workInProgress

1. `let workInProgress: Fiber | null = null;`
2. `let workInProgressSuspendedReason: SuspendedReason = NotSuspended;`
3. `let workInProgressThrownValue: mixed = null;`
4. `let workInProgressTransitions: Array<Transition> | null = null;`

### nested update

1. `const NESTED_UPDATE_LIMIT = 50;`
2. `let nestedUpdateCount: number = 0;`
3. `let rootWithNestedUpdates: FiberRoot | null = null;`
4. `let isFlushingPassiveEffects = false;`
5. `let didScheduleUpdateDuringPassiveEffects = false;`
6. `const NESTED_PASSIVE_UPDATE_LIMIT = 50;`
7. `let nestedPassiveUpdateCount: number = 0;`
8. `let rootWithPassiveNestedUpdates: FiberRoot | null = null;`
9. `let rootDoesHavePassiveEffects: boolean = false;`
10. `let rootWithPendingPassiveEffects: FiberRoot | null = null;`

### error

1. `let hasUncaughtError = false;`
2. `let firstUncaughtError = null;`
3. `let legacyErrorBoundariesThatAlreadyFailed: Set<mixed> | null = null;`

### executionContext

1. `let executionContext: ExecutionContext = NoContext;`

### time

1. `let globalMostRecentFallbackTime: number = 0;`
2. `const FALLBACK_THROTTLE_MS: number = 500;`
3. `const RENDER_TIMEOUT_MS = 500;`
4. `let currentEndTime: number | null = null;`
5. `let currentEventTime: number = NoTimestamp;`

### effects

1. `let currentEventTransitionLane: Lanes = NoLanes;`
2. `let pendingPassiveEffectsLanes: Lanes = NoLanes;`
3. `let pendingPassiveEffectsRemainingLanes: Lanes = NoLanes;`
4. `let pendingPassiveTransitions: Array<Transition> | null = null;`

## 模块级函数

### resetRenderTime(): void

这个函数的作用是更新模块级变量 `workInProgressRootRenderTargetTime`。实现很简单：

1. `workInProgressRootRenderTargetTime = now() + RENDER_TIMEOUT_MS;`

### requestRetryLane(fiber: Fiber): Lane

这个函数的作用是根据 `fiber` 获取下一个 `RetryLane`。其实现如下：

1. 取得 `fiber.mode`
2. 如果 `mode` 与 `ConcurrentMode` 之间没有交集，则返回 `SyncLane`
3. 否则调用 `claimNextRetryLane()` 获取 `nextRetryLane`

### ensureRootIsScheduled(root: FiberRoot, currentTime: number): void

这个函数的作用是在组件更新的时候，调度这颗 fiber 树的任务，将更新任务放入任务队列中。其实现细节如下：

1. 获取 `root.callbackNode` 并记作 `existingCallbackNode`。`callbackNode` 代表的是当前这颗 fiber 树接下来需要执行的任务。在 `Sync` 模式下为 `null`，在 `ConcurrentMode` 下就是调度完成后的任务本身。
2. 根据 `currentTime`，调用 `markStarvedLanesAsExpired(root, eventTime)` 更新当前 `FiberRoot` 上的 `expirationTimes`。
3. 调用 `getNextLanes(root, wipRenderLanes)` 获取即将调度的任务的 `nextLanes`。
   1. 如果 `nextLanes` 为空，即没有需要调度的任务，检查 `existingCallbackNode`，如果不是 `null`，则调用 `cancelCallback(existingCallbackNode)` 取消这个任务。然后重置 `root.callbackNode` 和 `root.callbackPriority`。
   2. 否则，调用 `getHighestPriorityLane(nextLanes)` 获取 `nextLanes` 中优先级最高的 `Lane`，即其二进制表示中最右边的一个 `1`，作为 `newCallbackPriority`。
   3. 检查 `existingCallbackNode`，如果不是 `null`，则调用 `cancelCallback(existingCallbackNode)` 取消这个任务。
   4. 检查 `newCallbackPriority` 是否包含 `SyncLane`。
      1. 如果包含，则根据 `root.tag === LegacyRoot`，分别使用 `scheduleLegacySyncCallback` 或者 `scheduleSyncCallback` 调度更新任务 `performSyncWorkOnRoot`。
         1. 如果当前环境支持微任务，使用微任务调度 `flushSyncCallbacks()`;
         2. 否则，以 `ImmediateSchedulerPriority` 的优先级调度 flushSyncCallbacks
         3. 把 `newCallbackNode` 置为 `null`。
      2. 否则，根据 `nextLanes` 获取对应的 `eventPriority`，把 `newCallbackNode` 置为 以这个 `eventPriority` 调度 `performConcurrentWorkOnRoot` 的函数。
   5. 把 `newCallbackNode` 和 `newCallbackPriority` 更新到 `root` 上。

### performConcurrentWorkOnRoot(root, didTimeout): void

这个函数是 concurrent task 的入口。其实现大致思路如下：

1. 重置部分模块级变量： `currentEventTime` 和 `currentEventTransitionLane`
2. 调用 `flushPassiveEffects()`。根据返回值 `didFlushPassiveEffects` 以及 `root.callbackNode` 是否发生变化来决定是否继续执行当前函数。
3. 调用 `getNextLanes(root, wipRenderLanes)` 获取当前任务的 `lanes`。如果 `lanes` 是 `NoLanes`，直接返回 `null`。
4. 判断是否进行时间分片 `shouldTimeSlice`。
5. 根据 `shouldTimeSlice` 的值，分别调用 `renderRootConcurrent(root, lanes)` 或者 `renderRootSync(root, lanes)`，并记录返回值 `exitStatus`。
6. 判断 `exitStatus !== RootInProgress`。
   1. 如果为 `true`，表示当前任务已经结束。这里的结束可能是任务已经完成，也有可能是任务出错。
   2. 如果为 `false`，表示当前任务还需要继续，但是当前因为某种原因被中断。
      1. 继续调用 `ensureRootIsScheduled(root, now());` 重新安排任务。
      2. 检查当前任务 `root.callbackNode` 是否与之前的任务相同。
         1. 如果相同，并且之前中止的原因是 _需要等待数据_ ，则重置当前任务。
         2. 否则，递归调用 `performConcurrentWorkOnRoot.bind(null, root)`

再详细展开一下 _当前任务已结束_ 时的处理流程。

1. 如果 `exitStatus` 是 `RootErrored`，尝试恢复后续的任务执行。
2. 如果 `exitStatus` 是 `RootFatalErrored`。
   1. 调用 `prepareFreshStack(root, NoLanes)` 将 `wip` 相关的模块级变量恢复为根节点任务开始执行前的状态。
   2. 调用 `markRootSuspended(root, lanes)` 将当前任务对应的 lanes 增加到 `root.suspendedLanes`。
   3. 调用 `ensureRootIsScheduled(root, now())` 重新开始调度。
   4. 抛出导致渲染结束的 fatal error `workInProgressRootFatalError`。
3. 如果 `exitStatus` 是 `RootDidNotComplete`，调用 `markRootSuspended(root, lanes)` 将当前任务对应的 lanes 增加到 `root.suspendedLanes`。
4. 如果 `exitStatus` 其他值。
   1. 如果之前执行的任务是 `concurrent` 并且 `!isRenderConsistentWithExternalStores(finishedWork)` 为 `true`，调用 `exitStatus = renderRootSync(root, lanes);` 重新渲染，并根据 `exitStatus` 重新进行 error 逻辑判断。
   2. 否则，更新 `FiberRoot`
      1. `root.finishedWork = finishedWork;`
      2. `root.finishedLanes = lanes;`
      3. 调用 `finishConcurrentRender(root, exitStatus, lanes)` 完成此次 render。
