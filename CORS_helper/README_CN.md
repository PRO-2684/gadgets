# 跨域助手

简单的绕过 CORS 限制的脚本。

## 安装

- [GitHub](https://github.com/PRO-2684/gadgets/raw/main/CORS_helper/cors.js)
- [Greasy Fork](https://update.greasyfork.org/scripts/508769/CORS%20Helper.user.js)

## 使用

此脚本**默认不匹配任何网址**。为了让此脚本在某网站生效，你需要将网站添加到**此脚本的 `用户匹配` 列表**。（在 `管理面板` - `已安装脚本` - `跨域助手` - `设置` - `包括/排除` - `用户匹配` - `添加...`）

之后，刷新页面，你将可以在 `window` 对象下获得 `GM_fetch` 函数的引用，它的行为类似于 `fetch` 但没有 CORS 限制。

## 工作原理

```javascript
// ...
// @require      https://cdn.jsdelivr.net/npm/@trim21/gm-fetch@0.1.15
// ...
unsafeWindow.GM_fetch = GM_fetch;
```

是的，就是这么简单。它只是将 `GM_fetch` 暴露在了 `window` 下。

## 致谢

[Trim21/gm-fetch](https://github.com/Trim21/gm-fetch)，提供了与 `fetch` 兼容的 `GM.xmlHttpRequest` 封装。
