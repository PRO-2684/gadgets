# pURLfy for Tampermonkey

![Greasy Fork](https://img.shields.io/greasyfork/dt/492480) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

终极 URL 净化器 - Tampermonkey 版本。此脚本使用了 [pURLfy core](https://github.com/PRO-2684/pURLfy) 作为核心，并将其净化 URL 的功能集成到了 Tampermonkey 脚本中。

## 安装

只需前往 [Greasy Fork](https://greasyfork.org/scripts/492480) 并点击 "Install this script" 按钮。

## 配置

对于高级用户，您可以通过修改此脚本在 Tampermonkey 中的外部存储来配置启用哪些 hook:

```jsonc
{
    "hook.location.href": true, // 检查 `location.href` (实际上并不是一个 hook)
    "hook.click": true, // 拦截 `click` 事件
    "hook.mousedown": true, // 拦截 `mousedown` 事件
    "hook.window.open": true // Hook `window.open` 调用
}
```

## 工作原理

### 净化 URL

请参阅 [pURLfy core](https://github.com/PRO-2684/pURLfy) 及其源代码以获取更多信息。

### Hooks

此脚本 Hook 了某些方法，拦截对它们的调用，净化 URL，然后使用净化后的 URL 调用原始方法。有关更多信息，请参阅源代码。
