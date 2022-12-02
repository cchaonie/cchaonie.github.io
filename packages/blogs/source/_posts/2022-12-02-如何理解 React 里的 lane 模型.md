---
title: 如何理解 React 里的 lane 模型
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

lane 模型相关的代码在 react-reconciler 这个模块中，具体的文件名是 ReactFiberLane.js。打开这个文件其实就能发现，Lane 的类型是 number .
