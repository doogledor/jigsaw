# jigsaw
canvas滑动验证码

## [在线演示地址](https://kongkong99.github.io/jigsaw/)

### 用法：
1. 直接使用src/jigsaw.js或lib/index.js


2.
```
npm i @zwh19981028/jigsaw-js -S

jigsaw.init({
  el: document.getElementById('container'),
  imgArray: [], // 可选，默认从https://picsum.photos/ 随机获取
  width: 310, // 可选, 默认310
  height: 155, // 可选, 默认155
  onSuccess: function () { ... },
  onFail: function () { ... },
  onRefresh: function () { ... }
})
```

### Tips：

- 不设置imgArray或值为空数组时，使用默认的5张图片，然后用canvas裁剪生成滑块.

