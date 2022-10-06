---
layout: post
title: React SSR 和 loadable-component
categories: React
tags: [SSR, isomorphic application]
---

## 背景

一般来说，当项目规模达到一定的程度后，为了性能考虑，我们会有 code-split 的需求。React 本身提供了 API(React.lazy 和 Suspense 组件组合)，可以实现 code-split。而 react SSR 的项目，我们会使用 loadable-component 去做 code-split，而不是直接使用 react API。本文的目标是解析 loadable-component 在基于 React 的 SSR 的同构应用中的作用，以及其实现原理。

<!--more-->

## code-split

code-split 翻译过来就是代码分割，主要是为了解决**客户端脚本编译打包后，产物过大，从而影响到了首屏加载性能**的问题。

在代码中，我们是可以明确知道，应用中哪些脚本是可以延迟加载的，延迟加载的脚本是没有必要打包到首屏脚本中。
因此，code split 要做的事情就是：

1. 在指定的位置拆分脚本代码
2. 提供一种在首屏之后加载脚本的方法

这两个功能均由打包工具实现了。webpack 提供了 import()，可以用来指示从哪里开始拆分脚本。同时，webpack 的运行时提供了动态加载脚本的函数（动态创建 script 标签），从而可以完成首屏之后再加载脚本。

webpack 的默认行为是当碰到 import()，就会进行 code-split，把需要动态加载的脚本打包到一个单独的 chunk 中。然后在应用执行到需要加载动态脚本时，才会通过动态生成 script 标签的方式，来加载目标 chunk。

## React SSR

一个具有基本功能的 React SSR 同构应用，在服务端需要完成一件事——导入 react 组件，使用 ReactDOMServer 的方法，将组件编译成 HTML 字符串。
重点在于这个字符串中，需要包含组件的客户端脚本 bundle 的 script 标签。

在开发环境和生产环境，客户端和服务端准备脚本的过程有所不同。

1. 客户端

   客户端的脚本肯定是需要编译打包的。即将开发过程中的大量脚本文件，编译后打包成少量甚至一个脚本文件，可以减少请求数量，加快首屏渲染。

   在开发环境，除了完成必须的编译打包工作，还需要启动一个静态资源服务器，用以提供脚本文件服务。

   在生产环境，编译打包之后的产物，一般而言会直接放到 CDN 中，再提供服务。

2. 服务端

   在开发环境，我们会启动一个开发服务器，从而在浏览器中完成开发工作。

   而在生产环境，我们会在服务器上启动服务端脚本。所以，本质上来说，服务端的脚本是不需要打包的，因为 node 可以直接执行 JavaScript。

   如果没有使用需要编译的脚本，如使用原生 nodejs 开发，这一块的编译打包的工作，其实是可以省略的。
   同理，如果使用的是 react api，如 React.createElement，而不是需要编译的 jsx，这一步也可以省略。

## loadable-component

它到底是干啥用的呢？官方的答案是——A React code splitting library。

react 暴露了 React.lazy 函数和 Suspense 组件，可以完成**代码拆分**的功能，那为什么还需要 loadable-component 呢？因为 React 的方案存在缺陷——Suspense 不能在服务端使用，也就是说，如果采用了 SSR，那么首屏组件树中就不能有 Suspense 组件。而这就是 loadable-component 的价值所在了，它不需要 Suspense 组件，也能实现 code-split, 即**同构代码能够实现 code-split**。

### loadable-component 由哪些组件构成

下表简单总结了 loadable-component 包含的组件及其作用

| 组件                     | 作用                                                                       |
| ------------------------ | -------------------------------------------------------------------------- |
| @loadable/component      | 提供 loadable() API                                                        |
| @loadable/server         | 提供 ChunkExtractor                                                        |
| @loadable/babel-plugin   | 转换 `loadable` 函数语法，1. 为 SSR 作准备；2. 根据注释自动生成 chunk name |
| @loadable/webpack-plugin | 生成 loadable-stats.json                                                   |

### loadable-component 如何实现 code-split

首先分析一下，在同构代码中，要实现 code-split 应该如何去做。需要明确的一点是，服务端脚本是不需要 code-split 的，node 会在需要某个脚本时，直接 require 即可。在服务端实际上面临的问题是，对于客户端有 code-split 需求的组件应该如何处理。从技术的角度来说，直接忽略这个组件是最简单的，但是这个问题的答案其实是由业务决定的。如果业务有 SEO 的需求，那即使这个组件在客户端 code-split 了，服务端还是应该渲染出实际的 HTML。

loadable-component 是怎么做的呢？它提供了一个配置项 ssr（默认是 true），来指示是否需要渲染 code-split 的脚本。下面是其实现步骤：

首先，@loadable/babel-plugin 会把 `loadable` 语法转换掉（这段代码来自 loadable-component 官网）。
从:

```js
import loadable from '@loadable/component';
const OtherComponent = loadable(() => import('./OtherComponent'));
```

转换成：

```js
import loadable from '@loadable/component';
const OtherComponent = loadable({
  chunkName() {
    return 'OtherComponent';
  },

  isReady(props) {
    if (typeof __webpack_modules__ !== 'undefined') {
      return !!__webpack_modules__[this.resolve(props)];
    }
    return false;
  },

  requireAsync: () =>
    import(/* webpackChunkName: "OtherComponent" */ './OtherComponent'),

  requireSync(props) {
    const id = this.resolve(props);
    if (typeof __webpack_require__ !== 'undefined') {
      return __webpack_require__(id);
    }
    return eval('module.require')(id);
  },

  resolve() {
    if (require.resolveWeak) {
      return require.resolveWeak('./OtherComponent');
    }
    return require('path').resolve(__dirname, './OtherComponent');
  },
});
```

转换完成之后得到的 `OtherComponent`，在 loadable-component 源码中被称为 `Loadable`，本质上是一个常规的 react 类组件。其构造函数中会有这样的逻辑：

```js
constructor(props) {
   // ......
   // Server-side
   if (props.__chunkExtractor) {
      // This module has been marked with no SSR
      if (options.ssr === false) {
      return
      }
      // We run load function, we assume that it won't fail and that it
      // triggers a synchronous loading of the module
      ctor.requireAsync(props).catch(() => null)
      // So we can require now the module synchronously
      this.loadSync()
      props.__chunkExtractor.addChunk(ctor.chunkName(props))
      return
   }
   // ......
}
```

`this.loadSync()` 的实现如下：

```js
loadSync() {
   // load sync is expecting component to be in the "loading" state already
   // sounds weird, but loading=true is the initial state of InnerLoadable
   if (!this.state.loading) return

   try {
      const loadedModule = ctor.requireSync(this.props)
      const result = resolve(loadedModule, this.props, Loadable)
      this.state.result = result
      this.state.loading = false
   } catch (error) {
      console.error(
      'loadable-components: failed to synchronously load component, which expected to be available',
      {
         fileName: ctor.resolve(this.props),
         chunkName: ctor.chunkName(this.props),
         error: error ? error.message : error,
      },
      )
      this.state.error = error
   }
}
```

结合经过 @loadable/babel-plugin 转换之后的代码，可以发现实际上 `ctor.requireSync(this.props)` 就是在执行 node 端的 `require`。

最后，这个组件的 `render` 方法会执行

```js
({ result: Component, props }) {
    return <Component {...props} />
  }
```

即把 `Loadable` 接收的 props 转发给同步加载好的子组件，进而继续服务端 react 的渲染工作。通过这样的过程，loadable-component 把在客户端会动态加载的脚本，直接在服务端同步加载了。

### loadable-component 的其他功能

除了核心功能——同构代码的服务端 code-split 之外，loadable-component 还提供了其他功能。

1. `import(./path/${value})`

   `React.lazy` 的返回值是一个不能接收 props 的组件，而 `loadable` 返回的组件可以，因此可以通过 props 指定动态载入的脚本。这一点是基于 webpack 的 `dynamic expressions in import()`实现的。

2. library splitting

   即除了可以动态加载组件，loadable-component 还可以动态加载第三方库。具体的使用方法可以参考官方文档。

## 总结

总之，loadable-component 就是弥补了 react 当前的缺陷——在同构项目中无法实现在服务端 code-split。不过从 react 的源码来看，Suspense 在服务端是可以处理的，只是目前这个 feature 的开关没有打开，导致渲染异常。后续如果这个功能完善了，loadable-component 的后续发展就可能堪忧了。

## 参考

1. [loadable-component 官网](https://loadable-components.com/docs/getting-started/)
2. [dynamic expressions in import()](https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import)
3. [code-split](https://webpack.js.org/guides/code-splitting/)
