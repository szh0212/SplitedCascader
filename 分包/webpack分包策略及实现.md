# webpack分包策略及实现

## 1. webpack如何实现分包？

### 1.1 什么是分包？为什么要分包？

  一般在项目开发中我们都是通过webpack实现前端项目整体模块化， 虽然这种做法优势明显，但是它同样存在一些问题，那就是项目中的**所有代码最终都被打包到了一起**，如果应用非常复杂，模块非常多，最终打包的结果就会非常大。在大多数情况下我们的首个页面初始化的时候，**并不是所有的模块都需要加载进来**，但是这些模块又被全部打包在了一起，**当所有的文件都被加载完，页面才能显示出来**，这一个页面加载几分钟就让人感到非常难受。
此外还会导致的一个问题就是页面**缓存效率非常低**，**当任何一个页面文件发生改变，都会把所有的模块都重新加载进来然后使用**，虽然大部分文件都没有发生改变但是缓存因为重新加载了新的文件已经失效了，因此就需要提高一下缓存效率以减少不必要的性能浪费。
  所以就采取一个比较合理的方案，分包，把最终打包的结果按一定的规则分发到多个bundle中，然后根据当前应用的运行需要，按需加载模块，以达到大大提高应用的响应速度和运行效率的目的。

### 1.2 什么是bundle文件？

  上文提到了我们需要把我们打包的内容分发到多个bundle中，那么这时候就会有人问了，什么是bundle呢？先看一下百度怎么说：bundle是[Unix](https://baike.baidu.com/item/Unix/219943?fromModule=lemma_inlink)/[linux](https://baike.baidu.com/item/linux/27050?fromModule=lemma_inlink)系统中的一种[可执行文件](https://baike.baidu.com/item/可执行文件/2885816?fromModule=lemma_inlink)。用户可以在终端中使用./***（文件名）.bundle命令使其运行。既然这是可执行文件，那能不能被浏览器直接执行呢？诶，可以。这里找了一个bundle.js的例子简要了解一下内部结构，可以看到本质上时一个立即执行函数， 参数以及函数内部都包含了一些模块的引用。此外，在一个 bundle 文件中包含了加载和编译后的最终源文件，因此可以直接在浏览器中运行并还原我们所写的样式与逻辑，这里就不再深入探讨了。

```js
function(modules) {
    var installedModules = {};
    function __webpack__require__(moduleId){};
    __webpack__require__.p = "";
    return __webpack__require__(__webpack__require__.s = 0);
}([module1,module2])
```



  说到bundle就不得不提一下module, chunk, 以及bundle之间的关系。首先，module文件就是我们直接写出来的文件，无论是ESM 还是 commonJS 或是 AMD，都是module,  此时所处的阶段是在webpack编译之前；其次， 我们写好的module文件会被传到webpack进行打包操作，然后webpack根据文件的引用关系把一堆具有引用关系的module进行处理形成chunk，简单来说一个chunk就是一些模块的封装单元，是处理过程中的代码块， 此时所处的阶段是webpack的处理阶段；最后就是bundle文件了，chunk在构建完成时呈现为bundle，，大部分情况下一个chunk会产生一个bundle，但是也有可能产生多个bundle，此时处于webpack编译完成阶段。下图是从网上查阅到的一个图，感觉挺不错的，贴在下方帮助大家理解。

![image-20230612001802829](C:\Users\Sun\AppData\Roaming\Typora\typora-user-images\image-20230612001802829.png)

###  1.3 webpack如何实现分包？

  那对于webpack来说如何实现分包呢？以下图为例来说，多个页面打包成了多个chunk文件，此时将页面的公共部分比如说第三方库，这部分内容一般来说基本不会修改，将这部分需要以来的chunk_commom文件抽离出来进行缓存，然后再按需加载我们所需要展示的页面对应的打包文件，这样就达到了分包的目的。

![image-20230612004901040](C:\Users\Sun\AppData\Roaming\Typora\typora-user-images\image-20230612004901040.png)

### 1.4 分包的好处？

1. 提高首屏加载性能； 2. 提高缓存效率。

## 2. 分包策略

### 2.1 webpack常见的分包策略

1. Entry分包（多入口应用）

   根据我们的业务去配置不同的打包入口，也就是我们会有多个打包入口同时打包，输出多个打包结果。

2. 异步模块（动态引用import('../xxx,js')）

   自动识别动态加载行为，根据不同的视图加载不同的包。这里我根据我个人的理解举一个例子，帮助大家理解一下，比如说一个页面内需要同时展示两个组件，且两个组件不会同时展示，就像 `showA ? <A /> : <B />`, 但是A和B组件有一部分依赖是不同的，当需要展示A页面时这时就可以采用动态只引入A所需的依赖包。

3. Runtime分包

   即将运行代码单独打包，由于runtime体积较小， 优化价值不大，所以这种策略也并不常用。

   

### 2.2 主要实现方式

#### 2.2.1 多入口打包

现有如下文件结构：
 ![在这里插入图片描述](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5348b18a736e4890a068ef8acd994903~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)
 分为album页面内容、index.html页面内容、global.css公共样式、fetch.js是一个公共的提供请求api的模块，尝试为这个案例创建多个打包入口。

```const
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
   mode:"none",
   entry:{ // 将entry配置成一个对象，来设置多个打包入口
       index:"./src/index.js",
       album:"./src/album.js"
   },
   output:{// 修改输出文件名
       filename:"[name].bundle.js" // 通过[name]这种占位符的方式动态输出文件名，[name]最终就会替换成打包入口名称
   },
   module:{
       rules:[
           {
               test:/\.css$/,
               use:[
                   "style-loader",
                   "css-loader"
               ]
           }
       ]
   },
   plugins:[
       new CleanWebpackPlugin(),
       new HtmlWebpackPlugin({
           title:"Multi Entry",
           template:"./src/index.html",
           filename:"index.html"
       }),
       new HtmlWebpackPlugin({
           title:"Multi Entry",
           template:"./src/album.html",
           filename:"album.html"
       })
   ]
}
```

打包结果：
 ![在这里插入图片描述](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/068bd858b27a45abb5acb7da0fe9c7ed~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)
 但是生成的html中会载入两个打包后的bundle.js，我们只希望其引入自身的bundle.js
 ![在这里插入图片描述](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/675d8607ff0249bd8567cbfad05fd0d0~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)
 在HtmlWebpackPlugin通过chunks属性指定载入的bundle.js文件

```arduino
arduino复制代码new HtmlWebpackPlugin({
   title:"Multi Entry",
    template:"./src/index.html",
    filename:"index.html",
    chunks:['index']
}),
new HtmlWebpackPlugin({
    title:"Multi Entry",
    template:"./src/album.html",
    filename:"album.html",
    chunks:['album']
})
```

此时再打包，生成的html就只会载入自身需要的bundle.js。

#### 2.2.2 提取公共模块

在index.js和alubm.js中都有对公共模块的引入

```javascript
import fetchApi from './fetch'
import './global.css'
import './index.css'
```

然后执行打包就会生成一个包含这些公共模块的js文件。但是我这没有生成，很头疼。找了很久，结果发现需要加上一个name属性。

```css
optimization: {
    splitChunks: {
        chunks: 'all'
    }
}
```

这样就能成功将公共模块的js文件提取出来了，生成了一个common.bundle.js。

#### 2.2.3 动态导入模块

假设我们有一个单页面应用，根据需求来载入模块。

```dart
// posts模块
export default () => {
  const posts = document.createElement('div')
  posts.className = 'posts'

  posts.innerHTML = '<h2>Posts</h2>'

  return posts
}
javascript复制代码import posts from './posts/posts'
import album from './album/album'//结构与posts一样

const render = () => {
  const hash = window.location.hash || '#posts'

  const mainElement = document.querySelector('.main')

  mainElement.innerHTML = ''

  if (hash === '#posts') {
    mainElement.appendChild(posts())
  } else if (hash === '#album') {
    mainElement.appendChild(album())
  }
}

render()

window.addEventListener('hashchange', render)
```

我们在打包入口中同时导入了ablum模块和posts模块，当锚点发生变化时，根据锚点的值去决定要显示哪个组件，这里就会存在浪费的可能性，如果用户打开应用后只是访问了其中一个页面，另外一个页面所对应的模块的加载就是浪费，所以采用动态导入的方式就不会有浪费了。

动态导入就是采用ES Module的动态导入。

```javascript
const render = () => {
  const hash = window.location.hash || '#posts'

  const mainElement = document.querySelector('.main')

  mainElement.innerHTML = ''

  if (hash === '#posts') {
    import('./posts/posts').then(({ default: posts }) => {
      mainElement.appendChild(posts())
    })
  } else if (hash === '#album') {
    import('./album/album').then(({ default: album }) => {
      mainElement.appendChild(album())
    })
  }
}

render()
```

执行打包，打包结果：
 ![在这里插入图片描述](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e279766581347d29bdd6766e3ff7aa8~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)
 如果命名一致，会打包到一个文件中，否则是多个文件。