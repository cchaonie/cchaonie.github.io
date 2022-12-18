---
title: React 源码学习笔记：ReactFiber
date: 2022-12-18
tags: [React, fiber, 源码]
categories: Frontend
---

这篇文章集中来看 `ReactFiber.js` 这个文件中的内容。
一言以蔽之，这个文件就是负责创建 Fiber 对象，因此导出了 `Fiber` 类型，以及一系列创建 Fiber 的工具函数。

<!--more-->

## Fiber

`Fiber` 类型是定义在 `ReactInternalTypes.js` 这个文件的，从文件名可以知道，React 并不想这个类型暴露给用户方。其类型定义如下：

```javascript
// A Fiber is work on a Component that needs to be done or was done. There can
// be more than one per component.
export type Fiber = {
  // Tag identifying the type of fiber.
  tag: WorkTag,
  // Unique identifier of this child.
  key: null | string,
  // The value of element.type which is used to preserve the identity during
  // reconciliation of this child.
  elementType: any,
  // The resolved function/class/ associated with this fiber.
  type: any,
  // The local state associated with this fiber.
  stateNode: any,

  return: Fiber | null,
  // Singly Linked List Tree Structure.
  child: Fiber | null,
  sibling: Fiber | null,
  index: number,
  // The ref last used to attach this node.
  ref:
    | null
    | (((handle: mixed) => void) & { _stringRef: ?string, ... })
    | RefObject,
  refCleanup: null | (() => void),
  // Input is the data coming into process this fiber. Arguments. Props.
  pendingProps: any, // This type will be more specific once we overload the tag.
  memoizedProps: any, // The props used to create the output.
  // A queue of state updates and callbacks.
  updateQueue: mixed,
  // The state used to create the output
  memoizedState: any,
  // Dependencies (contexts, events) for this fiber, if it has any
  dependencies: Dependencies | null,
  // Bitfield that describes properties about the fiber and its subtree. E.g.
  // the ConcurrentMode flag indicates whether the subtree should be async-by-
  // default. When a fiber is created, it inherits the mode of its
  // parent. Additional flags can be set at creation time, but after that the
  // value should remain unchanged throughout the fiber's lifetime, particularly
  // before its child fibers are created.
  mode: TypeOfMode,
  // Effect
  flags: Flags,
  subtreeFlags: Flags,
  deletions: Array<Fiber> | null,
  // Singly linked list fast path to the next fiber with side-effects.
  nextEffect: Fiber | null,
  // The first and last fiber with side-effect within this subtree. This allows
  // us to reuse a slice of the linked list when we reuse the work done within
  // this fiber.
  firstEffect: Fiber | null,
  lastEffect: Fiber | null,

  lanes: Lanes,
  childLanes: Lanes,
  // This is a pooled version of a Fiber. Every fiber that gets updated will
  // eventually have a pair. There are cases when we can clean up pairs to save
  // memory if we need to.
  alternate: Fiber | null,
  actualDuration?: number,
  actualStartTime?: number,
  selfBaseDuration?: number,
  treeBaseDuration?: number,
  // __DEV__ only
  _debugSource?: Source | null,
  _debugOwner?: Fiber | null,
  _debugIsCurrentlyTiming?: boolean,
  _debugNeedsRemount?: boolean,
  // Used to verify that the order of hooks does not change between renders.
  _debugHookTypes?: Array<HookType> | null,
};
```

## FiberNode

令人意外的是，在这个模块中，没有定义 `Fiber` 对象的构造函数，反而是定义了 `FiberNode` 的构造函数。然后使用了一个 `createFiber` 的函数来作为构建新的 `Fiber` 的 载体，在其中调用了 `new FiberNode` 来返回一个 `Fiber` 对象。在这个基础之上，所有其他的构造 `Fiber` 对象的函数，都会在内部调用 `createFiber`。


