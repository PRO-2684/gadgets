<img src="https://github.com/PRO-2684/pURLfy/raw/main/images/logo.svg" align="right" style="width: 6em; height: 6em; max-width: 100%;">

# pURLfy for Tampermonkey

[![Greasy Fork](https://img.shields.io/greasyfork/dt/492480)](https://greasyfork.org/scripts/492480) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

终极 URL 净化器 - Tampermonkey 版本。此脚本使用了 [pURLfy core](https://github.com/PRO-2684/pURLfy) 作为核心，并将其净化 URL 的功能集成到了 Tampermonkey 脚本中。

## 安装

只需前往 [Greasy Fork](https://greasyfork.org/scripts/492480) 并点击 "Install this script" 按钮。

## 规则更新

### 配置规则的更新间隔

前往 Tampermonkey `管理面板` - `设置` - `外部`，在下拉菜单中选择您希望的更新间隔。

### 手动更新规则

前往 Tampermonkey `管理面板` - `已安装脚本` - `pURLfy for Tampermonkey` - `外部`，对于 `资源` 下的每一个条目，点击 `更新` 或 `删除` 按钮。刷新页面后，规则将会自动更新。

## 配置

- **📖 Rule Settings**：启用或禁用规则
    - **Tracking**：净化跟踪链接的规则
    - **Outgoing**：净化外链的规则
    - **Shortener**：恢复短链的规则
    - **Alternative**：将您从某些网站重定向到更好的替代网站
    - **Other**：净化其他类型链接的规则
    - **Remove Text Fragment**：从 URL 中删除 Text Fragments
- **🪝 Hooks Settings**：启用或禁用 Hook
    - **location.href**：检查 location.href
    - **click**：拦截 `click` 事件
    - **mousedown**：拦截 `mousedown` 事件
    - **auxclick**：拦截 `auxclick` 事件
    - **touchstart**：拦截 `touchstart` 事件
    - **window.open**：Hook `window.open` 调用
    - **pushState**：Hook `history.pushState` 调用
    - **replaceState**：Hook `history.replaceState` 调用
    - **Bing**：Bing 的特定网站 Hook
- **📊 Statistics**：显示统计信息
    - **URL**：净化的链接数量
    - **Parameter**：删除的参数数量
    - **Decoded**：解码的 URL 数量（`param` 模式）
    - **Redirected**：重定向的 URL 数量（`redirect` 模式）
    - **Visited**：访问的 URL 数量（`visit` 模式）
    - **Character**：删除的字符数量
- **⚙️ Advanced options**：高级选项
    - **Purify URL**：手动净化 URL
    - **Senseless Mode**：启用无感模式
    - **Disable Beacon**：使用一个无操作函数覆盖 [`navigator.sendBeacon`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)
        - 您可以在 [Ping Spotter](https://apps.armin.dev/ping-spotter/#) 上尝试此功能 - "Beacon API" 这一部分将显示 "Request blocked"
    - **Debug Mode**：启用调试模式

## 工作原理

### 净化 URL

请参阅 [pURLfy core](https://github.com/PRO-2684/pURLfy) 及其源代码以获取更多信息。

### 规则

规则文件可以在 [pURLfy rules](https://github.com/PRO-2684/pURLfy-rules) 找到。

### Hooks

此脚本 Hook 了某些方法，拦截对它们的调用，净化 URL，然后使用净化后的 URL 调用原始方法。有关更多信息，请参阅源代码。

## 相关脚本

[去除链接重定向](https://greasyfork.org/scripts/483475)
