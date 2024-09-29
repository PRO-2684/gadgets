![Greasy Fork](https://img.shields.io/greasyfork/dt/510742) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

## 🪄 功能与配置

- **Personal Access Token** (PAT): GitHub API 的个人访问令牌，以 `github_pat_` 开头（用于提升速率限制）。
    - 没有 PAT，每小时只允许 $60$ 次请求；有 PAT，每小时允许 $5000$ 次请求，对大多数用户来说足够了。
    - [在这里](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) 了解如何创建细粒度的个人访问令牌。
    - 在 `Repository access` 选项卡下只需选择 `Public Repositories (read-only)`（默认设置）。[Screenshots](#-screenshots) 部分将展示一张示例图片。
    - 请注意，此脚本无法在私有仓库上添加额外信息。
    - 记得 *在令牌过期时生成一个新令牌*。
- **Debug**: 启用调试模式。
- **Release Downloads**: 显示 Release 中文件的下载次数。
- **Release Uploader**: 显示上传 Release 中文件的用户。

## 🖼️ 截图

GitHub 上 [一个 Release](https://github.com/microsoft/terminal/releases/tag/v1.22.2702.0) "Assests" 部分的示例，启用了 `Release Downloads` 和 `Release Uploader`：

![](./assets.png)

针对个人访问令牌的示例设置：

![](./token.jpeg)

## 🤔 已知问题

- 添加的信息可能不对齐。
