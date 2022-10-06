---
layout: post
title: Nodejs学习笔记-01 events
categories: nodejs
tags: [学习笔记]
---

以下思维导图是通过阅读API文档以及源码总结的。

![node.js-events]({{ site.url }}/images/Nodejs01.png)

<!--more-->

简单说明一下。

 - events 模块导出了 `EventEmitter` 这个 class, 因此通过 `require()` 就能直接获得。既可以直接 `new EventEmitter()` 获得事件对象，也可以继承 EventEmitter 自定义事件对象。
 - 事件对象有一个监听器数组，可以通过 `listeners()` 来获得。
 - `defaultMaxListeners` 控制所有事件对象所能绑定的最大监听器数量，因此最好不要直接修改该属性，而应该通过 `setMaxListeners()` 来修改当前事件对象的最大监听器数量。
 - 监听器有一次性和非一次性的区别，一次性监听器执行一次之后会自动解绑。
 - 绑定监听器时会在监听器数组 `push` 一个监听器，默认会在数组末尾，可以通过 `prependListener()` 或 `prependOnceListener()` 来使得新的监听器放在监听器数组开头，后者是一次性监听器。
 - 通过 `emit()` 方法触发事件。该方法第一个参数是事件名称，后面的参数则是传递给监听器的参数。
 - 当事件触发时，监听器数组里面的监听器函数会同步依次执行。
 - 当事件对象中发生错误，则会触发 `error` 事件。可以给 `process` 对象的 `uncaughtException` 事件绑定一个全局监听器。但是最好是给当前事件对象的 `error` 事件绑定错误处理监听器。

