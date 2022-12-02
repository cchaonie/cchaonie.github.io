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

lane 模型相关的代码在 react-reconciler 这个模块中，具体的文件名是 ReactFiberLane.js。打开这个文件其实就能发现，Lane 的类型是 number 。

然而，并不是所有的 number 都是 lane。实际上，react 定义了 31 种优先级，即只有 31 个 lane。再加上一个 `NoLane` 这样一个特殊的 lane，我们可以说一共有 32 个 lane。

lane 使用 32 位二进制数字表示的，当这个数字的某个位置为 1 的时候，表示存在一个优先级。当有多个位置上的数字为 1 时，则代表一个优先级的集合。

谈到优先级，那必然要有方法比较两个优先级之间的大小，而数字之间天然存在大小关系。而二进制数字，越靠左的位置数字越大。而在 lane 模型中，1 的位置越靠左，优先级越低。

除了 Lane 之外，lane 的模型中，还有 Lanes，其实际类型也是 number，只不过 Lanes 中会有多个位置上有 1，即 Lanes 是多个优先级的集合。

为什么一定要用二进制呢，因为使用二进制来进行优先级的运算更加高效。

## Lane 运算

根据运算对象可以对 Lane 相关运算进行分类。

### Lane 之间的运算

针对单个优先级 Lane，必然会有的运算是比较高低。其实现更为简单，比较两个数字之间的大小，数字越大，优先级越低。

### Lane 和 Lanes 之间的运算

Lane 和 Lanes 之间的运算，其实就是元素与集合之间的关系。那么运算会包括：

1. 向集合中添加元素：`lanes | lane`
2. 从集合中移除元素： `lanes & ~lane`
3. 判断集合中是否包含某元素：`lanes & lane !== NoLane`
4. 取得集合中最大的的元素，即最后一个位置上的 1： `lanes & -lanes`。负数在 JS 中是以补码，即正数取反再加一，的形式保存的。正数取反加一之后，最后一个 1 的位置就会变成 0 ，这个位置之后的 0 都会变成 1 。`&` 运算之后，都会变成 0。

取得最左边的一个 1。可以通过 `Math.clz32` 取得一个数字的 32 位无符号形式中的前导 0 的个数，从而间接得到最左边的一个 1 的位置。

由于 Lanes 是一个多个位上都是 1 的数字，那么就可能会存在一个运算，取得某个位置上是否是 1。
