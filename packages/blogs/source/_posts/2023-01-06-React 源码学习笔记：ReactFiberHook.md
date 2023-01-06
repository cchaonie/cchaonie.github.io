---
title: React 源码学习笔记：ReactFiberHook
date: 2023-01-06
tags: [React, fiber, hook, 源码]
categories: Frontend
---

这篇文章来看 `ReactFiberHook.js` 这个文件中的内容。
这个模块是 react-reconciler 中 Hooks 的实现细节，包括 `mount` 和 `update` 两个阶段，当然还有 `dev` 和 `prod` 的区分。
