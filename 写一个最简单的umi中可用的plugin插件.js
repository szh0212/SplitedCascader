// 在umi项目中创建一个名为simple-plugin的文件夹
// 在simple-plugin文件夹下创建一个index.js文件
// 在此代码中，我们创建了一个名为simple-plugin的umi插件

const simplePlugin = (api) => {
  // 在控制台打印日志信息
  api.logger.info("simple-plugin is running");

  // 修改默认配置，将一个新的路由添加到配置中
  api.modifyDefaultConfig((config) => {
    config.routes.push({
      path: "/simple-plugin",
      component: "./src/pages/SimplePlugin",
    });
    return config;
  });

  // 监听页面变化，当指定的页面文件发生变动时，执行相应动作
  api.addPageWatcher([
    api.paths.absSrcPath + "/pages/SimplePlugin",
  ]);

  // 添加运行时插件，这里加载了一个名为runtime.js的文件
  api.addRuntimePlugin(() => [require.resolve("./runtime")]);
};

module.exports = simplePlugin;

// runtime.js文件中定义了一个函数，用于修改路由配置
export function patchRoutes({ routes }) {
  routes[0].routes.push({
    path: "/simple-plugin",
    exact: true,
    component: require("./src/pages/SimplePlugin").default,
  });
}

// 在.umirc.js或者config/config.js中添加以下配置，启用simple-plugin插件
export default {
  plugins: ["./simple-plugin/index.js"],
};

// 请确保在项目的src/pages目录下创建一个SimplePlugin.js文件，用来作为简单插件的展示组件。