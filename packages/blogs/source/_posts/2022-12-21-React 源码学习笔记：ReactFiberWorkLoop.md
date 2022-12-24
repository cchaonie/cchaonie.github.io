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
