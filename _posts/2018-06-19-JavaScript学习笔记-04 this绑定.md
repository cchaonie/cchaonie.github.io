---
layout: post
title: JavaScript学习笔记——04 this绑定
categories: [JavaScript]
tags: [学习笔记]
---

### 默认绑定

在阅读了<<你不知道的JavaScript 上卷>> 后, 对JavaScript中的 this 做一个简要的总结.

无法应用其他规则时，this会绑定全局作用域（非严格模式），或者绑定到undefined（严格模式）

```javascript
function foo(){
	console.log(this.a);
}
var a = 2;

foo();        //2	在node下测试结果为undefined
```
``` javascript
"use strict";
function foo(){
	console.log(this.a);
}
var a = 2;

foo();        //undefined	在node下测试异常 TypeError: Cannot read property 'a' of undefined
```



### 隐式绑定

调用位置有上下文对象时，this会绑定为上下文对象

```javascript
function foo(){
	console.log(this.a);
}

var obj = {
	a: 22,
	foo: foo
};

obj.foo();        //22
```
隐式绑定时会出现绑定丢失，从而应用默认绑定

```javascript
function foo(){
	console.log(this.a);
}

var obj = {
    a: 22,
    foo: foo
};
var a = 1;
var bar = obj.foo;

bar();        	//1	在node下测试结果为undefined
```


因为在把obj.foo赋值给bar后，bar实际指向的仅仅是foo，即丢失了上下文对象obj

### 显式绑定

使用call()或apply()显式改变上下文对象，从而改变this绑定。

```javascript
function foo(){
	console.log(this.a);
}

var obj = {
	a: 22
};

foo.call(obj);        //22
```

使用显式绑定依然无法解决绑定丢失的问题，因为call()和apply()实际上是在"执行"函数，在这一次执行的过程中，上下文对象是obj，脱离了这一次执行上下文，foo中的this就不再绑定到obj

```javascript
function foo(){
	console.log(this.a);
}

var obj = {
	a: 22
};

var a = 2;
foo.call(obj);        //22
foo();                //2	在node下测试结果为undefined
```

在显式绑定的基础上的硬绑定，就可以防止绑定丢失

```javascript
function foo(){
	console.log(this.a);
}

var bar = function(){
	foo.call(obj);
};

var obj = {
	a: 22
};

var obj2 = {
	a: 222
};

var obj3= {
	a: 2222,
	bar: bar
};
var a = 2;

bar();                  //22
obj3.bar();         	//22
bar.call(obj2);   		//22
```

对于bar而言的硬绑定，在其内部显式绑定到了obj上，this就一直绑定到obj

### new绑定

使用new来调用函数时，会执行以下操作：

-   构造一个全新对象
-   这个新对象会被执行*原型链接*
-   新对象会绑定到函数调用的this
-   如果函数没有返回其他对象，那么new表达式中的函数调用会自动返回这个新对象

```javascript
function foo(a){
    this.a = a;
}

var bar = new foo(22);
console.log(bar.a);			//22
```

### 优先级

new绑定>显式绑定>隐式绑定>默认绑定

### 箭头函数中的this词法

箭头函数 `() => {}` 中的this会默认绑定到箭头函数所在函数作用域中的this。
```javascript
function foo(a){
    return () => console.log(this.a);
}
var obj = {
    a: 2
};
var obj2 = {
    a: 22
}
var bar = foo.call(obj);     
bar.call(obj2);             //2
```
