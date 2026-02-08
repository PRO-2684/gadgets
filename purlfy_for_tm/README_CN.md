<img src="https://github.com/PRO-2684/pURLfy/raw/main/images/logo.svg" align="right" style="width: 6em; height: 6em; max-width: 100%;">

# pURLfy for Tampermonkey

[![Greasy Fork](https://img.shields.io/greasyfork/dt/492480)](https://greasyfork.org/scripts/492480) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

终极 URL 净化器 - Tampermonkey 版本。此脚本使用了 [pURLfy core](https://github.com/PRO-2684/pURLfy) 作为核心，并将其净化 URL 的功能集成到了 Tampermonkey 脚本中。

## 安装

只需前往 [Greasy Fork](https://greasyfork.org/scripts/492480) 并点击 "Install this script" 按钮。

## 配置

- **📖 Rules Settings**: 启用/禁用规则
    - **Tracking**: 启用/禁用净化跟踪链接的规则
    - **Outgoing**: 启用/禁用净化外链的规则
    - **Shortener**: 启用/禁用短链还原的规则
    - **Alternative**: 启用/禁用跳转到更好替代品的规则
    - **Other**: 启用/禁用其他规则
    - **Remove Text Fragment**: 从网址中去除 [Text Fragments](https://developer.mozilla.org/zh-CN/docs/Web/URI/Reference/Fragment/Text_fragments)
- **🪝 Hooks Settings**: 启用/禁用特定 Hook
    - **location.href**: 检查 `location.href`
    - **click**: 劫持 `click` 事件
    - **mousedown**: 劫持 `mousedown` 事件
    - **auxclick**: 劫持 `auxclick` 事件
    - **touchstart**: 劫持 `touchstart` 事件
    - **window.open**: Hook `window.open` 调用
    - **pushState**: Hook `history.pushState` 调用
    - **replaceState**: Hook `history.replaceState` 调用
    - **Bing**: 对于必应的特殊 Hook，目前似乎没有必要
- **📊 Statistics**: 展示统计信息
    - **URL**: 净化网址的数量
    - **Parameter**: 删除参数的数量
    - **Decoded**: 解码网址的数量 (`param` 模式)
    - **Redirected**: 重定向网站的数量 (`redirect` 模式)
    - **Visited**: 访问网址的数量 (`visit` 模式)
    - **Character**: 删除字符的数量
- **⚙️ Advanced options**: 高级选项
    - **Purify URL**: 手动净化一个网址
    - **Senseless Mode**: 启用 [无感模式](#无感模式)
    - **Disable Beacon**: 覆写 [`navigator.sendBeacon`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) 为一个空操作函数
        - 您可以在 [Ping Spotter](https://apps.armin.dev/ping-spotter/#) 测试此功能 - "Beacon API" 一节会展示 "Request blocked"
    - **Debug Mode**: 启用调试模式

## 无感模式

默认情况下，“无感模式”处于启用状态，脚本将对链接净化采取宽松策略，优先保障用户体验而非严格的链接清理。这有助于减少打扰并维持网站功能，同时仍能实现基础的链接净化效果。

您可在高级选项中禁用该模式。禁用后将切换至“严格模式”，脚本将采取极端措施确保链接在使用前完成净化。但需注意，此模式可能导致某些网站出现明显中断甚至功能故障。

以下为两种模式对比表：

| 功能         | 严格模式   | 无感模式 |
|-------------|-----------|---------|
| URL净化优先级 | 高        | 中      |
| 隐私保护级别  | 严格       | 中等    |
| 潜在故障风险  | 可能发生   | 极低概率 |
| 目标用户群体  | 高级用户   | 普通用户 |

技术细节：

- 严格模式下，脚本会拦截鼠标事件，待净化完成后重新触发，从而确保使用的是净化后的网址。无感模式则不会拦截事件，而这可能导致原始链接被使用。
- 严格模式下，检测到未净化网址时脚本将立即修改 `location.href`，导致页面重新加载，某些情况下甚至可能会引发无限循环的加载。无感模式下，脚本仅调用`history.replaceState` 修改网址而不触发页面刷新。

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
