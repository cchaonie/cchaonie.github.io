---
title: 如何理解 React 里的 lane 模型（一）
date: 2022-12-02
tags: [React, lane]
categories: Frontend
---

## 背景

页面更新是有优先级的。举个例子，用户在文本框里输入文字的时候，会根据已经填入的文字，去请求 API 获取输入联想建议。如果一个 API 刚好返回的时候，用户同时也输入了一个文字，这个时候就会有两个更新需要进行：

1. 更新文本框里的文字
2. 更新联想列表

<!--more-->

很显然，用户输入的优先级会更高，否则用户会感受到明显的卡顿：自己的输入没有得到响应。而联想列表的更新慢一点用户是可以接受的，因为“联想”需要时间的。

```javascript
// 忽略防抖等操作
const SuggestionInput = () => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const onFetchSuggestions = useCallback(() => {
    fetchSuggestions(input)
      .then(suggestionsList => setSuggestions(suggestionsList))
      .catch(e => console.error(e));
  }, [input]);

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <ul>
        {suggestions.map(s => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
};
```

在上面的代码中，如果 `setInput` 和 `setSuggestions` 同时被调用，我们会希望 `setInput` 会先执行。那么，react 里是怎么来实现这两种 `setState` 的优先级的呢，答案是 `lane` 模型。

## Lane 模型

通过背景介绍，我们可以明白，lane 模型其实是优先级的抽象。那在 react 中，具体的实现又是怎么样的呢？

lane 模型相关的代码在 react-reconciler 这个模块中，具体的文件名是 [ReactFiberLane.new.js](!https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberLane.new.js#L39)。

打开这个文件其实就能发现，Lane 的类型是 number。然而，并不是所有的 number 都是 lane。实际上，react 的 Lane 模型包括两种数据类型：

1. Lane。指的是单个优先级，在其 32 无符号整数的二进制形式中，只有一个位上的数字是 1。
2. Lanes。指的是优先级的集合，在其 32 无符号整形数字的二进制形式中，可以有多个位上存在 1。

对于 Lane 类型，react 定义了 31 种优先级。

```javascript
export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;
export const InputContinuousHydrationLane: Lane = /*    */ 0b0000000000000000000000000000010;
export const InputContinuousLane: Lane = /*             */ 0b0000000000000000000000000000100;
export const DefaultHydrationLane: Lane = /*            */ 0b0000000000000000000000000001000;
export const DefaultLane: Lane = /*                     */ 0b0000000000000000000000000010000;
const TransitionHydrationLane: Lane = /*                */ 0b0000000000000000000000000100000;
const TransitionLane1: Lane = /*                        */ 0b0000000000000000000000001000000;
const TransitionLane2: Lane = /*                        */ 0b0000000000000000000000010000000;
const TransitionLane3: Lane = /*                        */ 0b0000000000000000000000100000000;
const TransitionLane4: Lane = /*                        */ 0b0000000000000000000001000000000;
const TransitionLane5: Lane = /*                        */ 0b0000000000000000000010000000000;
const TransitionLane6: Lane = /*                        */ 0b0000000000000000000100000000000;
const TransitionLane7: Lane = /*                        */ 0b0000000000000000001000000000000;
const TransitionLane8: Lane = /*                        */ 0b0000000000000000010000000000000;
const TransitionLane9: Lane = /*                        */ 0b0000000000000000100000000000000;
const TransitionLane10: Lane = /*                       */ 0b0000000000000001000000000000000;
const TransitionLane11: Lane = /*                       */ 0b0000000000000010000000000000000;
const TransitionLane12: Lane = /*                       */ 0b0000000000000100000000000000000;
const TransitionLane13: Lane = /*                       */ 0b0000000000001000000000000000000;
const TransitionLane14: Lane = /*                       */ 0b0000000000010000000000000000000;
const TransitionLane15: Lane = /*                       */ 0b0000000000100000000000000000000;
const TransitionLane16: Lane = /*                       */ 0b0000000001000000000000000000000;
const RetryLane1: Lane = /*                             */ 0b0000000010000000000000000000000;
const RetryLane2: Lane = /*                             */ 0b0000000100000000000000000000000;
const RetryLane3: Lane = /*                             */ 0b0000001000000000000000000000000;
const RetryLane4: Lane = /*                             */ 0b0000010000000000000000000000000;
const RetryLane5: Lane = /*                             */ 0b0000100000000000000000000000000;
export const SelectiveHydrationLane: Lane = /*          */ 0b0001000000000000000000000000000;
export const IdleHydrationLane: Lane = /*               */ 0b0010000000000000000000000000000;
export const IdleLane: Lane = /*                        */ 0b0100000000000000000000000000000;
export const OffscreenLane: Lane = /*                   */ 0b1000000000000000000000000000000;
```

再加上一个 `NoLane(0b0000000000000000000000000000000)` 这样一个特殊的 lane，我们可以说一共有 32 个 lane。

对于 Lanes 类型，react 定义了 3 中优先级的集合，分别是：

1. TransitionLanes (`0b0000000001111111111111111000000`)
2. RetryLanes (`0b0000111110000000000000000000000`)
3. NonIdleLanes (`0b0001111111111111111111111111111`)

同样的，也有一个特殊的 Lanes 与 `NoLane`对应，即 `NoLanes(0b0000000000000000000000000000000)`。

lane 使用 32 位二进制数字表示的，当这个数字的某个位置为 1 的时候，表示存在一个优先级。当有多个位置上的数字为 1 时，则代表一个优先级的集合。

谈到优先级，那必然要有方法比较两个优先级之间的大小，而数字之间天然存在大小关系。而二进制数字，越靠左的位置数字越大。而在 lane 模型中，1 的位置越靠左，优先级越低。

除了 Lane 之外，lane 的模型中，还有 Lanes，其实际类型也是 number，只不过 Lanes 中会有多个位置上有 1，即 Lanes 是多个优先级的集合。

为什么一定要用二进制呢，因为使用二进制来进行优先级的运算更加高效。

## Lane 模型的运算

根据运算对象类型的不同，可以对 Lane 模型的运算进行分类。

### Lane 之间的运算

针对单个优先级 Lane，必然会有的运算是比较高低。其实现更为简单，比较两个数字之间的大小，数字越大，优先级越低。

### Lane 和 Lanes 之间的运算

Lane 和 Lanes 之间的运算，其实就是元素与集合之间的关系。那么运算会包括：

1. 向集合中添加元素：`lanes | lane`
2. 从集合中移除元素： `lanes & ~lane`
3. 判断集合中是否包含某元素：`lanes & lane !== NoLane`
4. 取得集合中最大的的元素，即最后一个位置上的 1： `lanes & -lanes`。负数在 JS 中是以补码，即正数取反再加一，的形式保存的。正数取反加一之后，最后一个 1 的位置就会变成 0 ，这个位置之后的 0 都会变成 1 。`&` 运算之后，都会变成 0。
5. 从集合中获取一个元素。从 lane 其实是代表优先级这一个角度来说，从这个集合中取任一元素的意义并不大，反而取最大优先级和最小优先级的意义更大。从实现的角度，就是获取一个数字的二进制表示中，最右边一个 1 和最左边的一个 1。取最右边的 1 的操作已经提到，下面继续讨论取最左边的 1。

要取得最左边的一个 1，其实就是要知道这个数字的二进制 32 位无符号表示中，有多少个前导 0。恰好，JS 有一个原生的函数可以使用。可以通过 `Math.clz32` 取得一个数字的 32 位无符号形式中的前导 0 的个数，从而间接得到最左边的一个 1 的位置。以下是 React 中的*获取一个 Lanes 里优先级最低的 lane 的下标*函数实现。

```javascript
function pickArbitraryLaneIndex(lanes: Lanes) {
  return 31 - clz32(lanes);
}
```

当 `lanes` 的值为 `NoLanes` 时，`clz(NoLanes)` 返回 `32`，整个函数的返回值为 `-1`，恰好表达了**不存在**的含义。

6. 遍历。集合有遍历的需求是自然而然的，基于 Lanes 是一个 32 位无符号二进制数字，其遍历的实现有点特殊。Lanes 中的元素其实就是每个二进制位上的 1。再加上在 JS 中，对数字的修改并不是副作用，因此可以通过不断的获取最左端的 Lane，来实现对 Lanes 的遍历。

```javascript
while (lanes > 0) {
  const index = pickArbitraryLaneIndex(lanes);
  const laneAtIndex = 1 << index;

  lanes &= ~laneAtIndex; // change the lane at index to 0, so we can get next lane from the right to left.
}
```

### Lanes 之间的运算

Lanes 之间的运算其实就是两个集合之间的运算。

1. 判断两个集合是否有交集：`lanesA & lanesB !== NoLanes`。
2. 判断一个集合是否是另一个集合的子集：`lanesA & lanesB === LanesB`。
   在 react 已经预定义了 3 个特殊的 Lanes 集合的情况下，就可以用这个方法来判断一个 lanes 是否包含这些预定义的集合
3. 取两个集合的交集：`lanesA & lanesB`。
4. 取两个集合的并集：`lanesA | lanesB`。
5. 从一个集合中移除一个集合：`lanesA & ~lanesB`。

以上从集合和元素的角度，对 Lane 模型中的运算做了一个概括，这些运算可以看做是 Lane 模型的基础。在这个基础之上，Lane 模型与其他相关的概念之间的关系及运算也可以实现了。

## Lane 模型中的其他概念

回到 Lane 代表的其实是优先级这个概念，只讲优先级是没有意义的，优先级必须要跟具体的任务挂钩才有价值。在 React 的世界里，对任务的抽象其实就是 Fiber。

### Lane 与过期时间

除了任务之外，与 Lane 相关的另一个概念就是*过期时间*，即 `expirationTime`，如果一个任务没有在其优先级的时间范围上得到执行，那么就可以说这个任务过期了。所以，不同的 Lane 还代表了不同的处理时间。这同样符合优先级的概念，一个具有优先级的任务，表示这个任务应当在某个时间段内完成，否则就应当被判定为超时了。

因此，React 中还有一个函数用来从 `Lane` 得到 `expirationTime`。在目前的实现中，Lane 模型中定义了 4 种超时时间：

1. 250 ms (`InputContinuousLane`)
2. 5000 ms (`TransitionLane16`)
3. -1 (`RetryLane5`)。从源码注释中可以看到，这里原本会有一个时间值，但是由于未知 bug 的存在，只能暂时设置为*永不超时*。
4. -1 (`OffscreenLane`)

其中，`-1` 表示永不超时。
