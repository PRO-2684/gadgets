<img src="https://github.com/PRO-2684/pURLfy/raw/main/images/logo.svg" align="right" style="width: 6em; height: 6em; max-width: 100%;">

# pURLfy for Tampermonkey

![Greasy Fork](https://img.shields.io/greasyfork/dt/492480) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

终极 URL 净化器 - Tampermonkey 版本。此脚本使用了 [pURLfy core](https://github.com/PRO-2684/pURLfy) 作为核心，并将其净化 URL 的功能集成到了 Tampermonkey 脚本中。

## 安装

只需前往 [Greasy Fork](https://greasyfork.org/scripts/492480) 并点击 "Install this script" 按钮。

## 规则更新

### 配置规则的更新间隔

前往 Tampermonkey `管理面板` - `设置` - `外部`，在下拉菜单中选择您希望的更新间隔。

### 手动更新规则

前往 Tampermonkey `管理面板` - `已安装脚本` - `pURLfy for Tampermonkey` - `外部`，对于 `资源` 下的每一个条目，点击 `删除` 按钮。刷新页面后，规则将会自动更新。

## 配置

统计数据可以点击菜单中 `Show Statistics` 查看，点击确定后可以清空统计数据。

对于高级用户，您可以通过修改此脚本在 Tampermonkey 中的外部存储来配置启用哪些 hook 和规则:

```jsonc
{
    "hooks": {
        "location.href": true, // 检查 `location.href` (实际上并不是一个 hook)
        "click": true, // 监听 `click` 事件
        "mousedown": true, // 监听 `mousedown` 事件
        "auxclick": true, // 监听 `auxclick` 事件
        "touchstart": true, // 监听 `touchstart` 事件
        "window.open": true, // Hook `window.open` 调用
        "pushState": true, // Hook `pushState` 调用
        "replaceState": true, // Hook `replaceState` 调用
        "cn.bing.com": true // 拦截 `cn.bing.com` 中一系列的事件
    },
    "rules": {
        // 前往 https://github.com/PRO-2684/pURLfy-rules/ 查看相关说明
    },
    "senseless": true // 启用无感模式 (兼容性更好，干扰较少，但效果较差)
}
```

## 工作原理

### 净化 URL

请参阅 [pURLfy core](https://github.com/PRO-2684/pURLfy) 及其源代码以获取更多信息。

### 规则

规则文件可以在 [pURLfy rules](https://github.com/PRO-2684/pURLfy-rules) 找到。

### Hooks

此脚本 Hook 了某些方法，拦截对它们的调用，净化 URL，然后使用净化后的 URL 调用原始方法。有关更多信息，请参阅源代码。

## 相关脚本

[去除链接重定向](https://greasyfork.org/scripts/483475)
