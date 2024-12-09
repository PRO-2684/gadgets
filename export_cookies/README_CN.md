[![Greasy Fork](https://img.shields.io/greasyfork/dt/517291)](https://greasyfork.org/scripts/517291) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

## 🪄 功能

此脚本允许你导出当前页面的 cookies 到文件。目前支持以下格式：

- `cookies.txt`：[Netscape HTTP Cookie](http://curl.haxx.se/rfc/cookie_spec.html) 文件
- `cookies.json`：JSON 格式

## 📚 使用

右键点击任何页面，选择 `Tampermonkey` - `导出 Cookies`。然后，如果你想导出为 Netscape 格式 (`cookies.txt`)，请按确定；如果你想导出为 JSON 格式 (`cookies.json`)，请按取消。

## ⚠️ 注意

请注意：

- 你需要在 Tampermonkey 的选项页面中将 `.json` 后缀 **添加至白名单**，以便导出为 `cookies.json`。（`.txt` 默认在白名单中）
- `httpOnly` cookies 仅在 Tampermonkey 的 BETA 版本中支持。

## ✨ 鸣谢

- [Get-cookies.txt-LOCALLY](https://github.com/kairi003/Get-cookies.txt-LOCALLY/)
