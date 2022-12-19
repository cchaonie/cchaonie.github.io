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

## FiberNode 模块内的函数

## createFiber(tag: WorkTag, pendingProps: mixed, key: null | string, mode: TypeOfMode): Fiber

所有的 Fiber 都是通过这个函数构造的。从函数的入参可以知道，区分 Fiber 的关键参数就是这几个入参。

1. `tag` 表示当前这个 `Fiber` 的任务类型
2. `pendingProps` 表示当前渲染时，即组件最新的 `props`
3. `key` 用来标识一个组件的 `Fiber` 是否发生变化
4. `mode` 表示这个 `Fiber` 所处的模式，是 `ConcurrentMode` 还是其他的

### shouldConstruct(Component: Function): boolean

这是一个仅在模块内部使用的函数，其作用是用来判断当前组件是不是继承了 `React.Component`，即该组件是不是 class component。

### isSimpleFunctionComponent(type: any): boolean

从函数名可以知道，这个函数是用来检查 `type` 是否是 _简单函数式组件_。其步骤如下：

1.如果 `type` 是一个函数，并且不是 class component，并且 `type.defaultProps` 不存在，那么这个组件就是 SimpleFunctionComponent。

### resolveLazyComponentTag(Component: Function): WorkTag

这个函数是用来判断一个 `Component` 应该产生一个什么样的 _任务_。其步骤如下：

1. 如果 `Component` 是函数类型，则根据 `shouldConstruct(Component)` 的返回值来判断应该返回 `ClassComponent` 还是 `FunctionComponent`
2. 否则，如果 `Component` 不是 `undefined` 或者 `null`，即它是一个对象，这时候就根据 `$$typeof` 属性来判断
3. 如果是 `REACT_FORWARD_REF_TYPE`，返回 `ForwardRef`
4. 如果是 `REACT_MEMO_TYPE`，返回 `MemoComponent`
5. 否则，返回 `IndeterminateComponent`

这里的 `IndeterminateComponent` 比较特殊，因为 React 是支持从 Promise 里 resolve 一个 Component 的，在 Promise 成功 resolve 之前，其代表的任务就是 `IndeterminateComponent`
