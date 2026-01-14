[![Greasy Fork](https://img.shields.io/greasyfork/dt/510742)](https://greasyfork.org/scripts/510742) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

> 如果你在 Greasy Fork 上查看自述文件时遇到问题，请访问 [GitHub 上的自述文件](https://github.com/PRO-2684/gadgets/blob/main/github_plus/README_CN.md) 以获得更好的体验。

## 🪄 特点

- 不使用 `MutationObserver` 或 `setInterval`，纯粹基于事件驱动，比类似功能的脚本更高效
- 没有危险的动态修补，确保兼容性
- 实验性支持各种 GitHub 镜像站
    - 需自行将镜像站添加到**此脚本的 `用户匹配` 列表**
    - `管理面板` - `已安装脚本` - `GitHub 增强` - `设置` - `包括/排除` - `用户匹配` - `添加...`

## ⚙️ 配置

- **🔢 Code Features**
    - **➡️ Tab Size**: 设置 Tab 缩进大小。
    - **😉 Cursor Blink**: 启用光标闪烁。
    - **🌊 Cursor Animation**: 使光标平滑移动。
- **🎨 Appearance**
    - **📰 Dashboard**: 配置仪表盘。(`Default`, `Hide Copilot`, `Hide Feed`, `Mobile-Like`)
    - **↖️ Left Sidebar**: 配置左侧栏。(`Default`, `Hidden`)
    - **↗️ Right Sidebar**: 配置右侧栏。(`Default`, `Hide 'Latest changes'`, `Hide 'Explore repositories'`, `Hide Completely`)
    - **📌 Sticky Avatar**: 使头像固定。(实验性功能，不适用于所有头像)
- **📦 Release Features**
    - **⬆️ Release Uploader**: 显示 Release 中文件的上传者。
        - 如果上传者是用户，则悬停时显示用户悬停卡片。
        - 如果上传者是 GitHub App，则着色为绿。
    - **📥 Release Downloads**: 显示 Release 中文件的下载次数。
    - **📊 Release Histogram**: 显示 Release 中各文件的下载次数直方图。
        - 如果只有零个或一个 Release 文件，则不会显示。
        - 如果没有任何 Release 文件被下载，则不会显示。
    - **🫥 Hide Archives**: 隐藏 Release 中的源代码归档。(实验性功能)
- **🔍 Extended Search**
    - **🚀 Go To**: 在搜索建议中添加跳转仓库、issue 等的选项，例如：
        - `@owner`: 跳转到作者的个人资料
        - `/repo`: 跳转到当前作者的仓库（若有）
        - `owner/repo`: 跳转到仓库
        - `@owner/repo#123`: 跳转到该仓库的 issue/PR 编号 123
        - `#123`: 跳转到当前仓库的 issue/PR 编号 123（若有）
- **🪄 Additional Features**
    - **🎭 Tracking Prevention**: 阻止 GitHub 的一些跟踪。
- **⚙️ Advanced Settings**
    - **🔑 Personal Access Token**: GitHub API 的个人访问令牌，以 `github_pat_` 开头（用于提升速率限制）。详见 [个人访问令牌 (PAT)](#-个人访问令牌-pat) 部分。
    - **📈 Rate Limit**: 查看当前速率限制状态。
    - **🐞 Debug**: 启用调试模式。

## 🖼️ 效果展示

<details><summary>
"Assets" 部分示例
</summary>

下述 Release "Assets" 部分的示例均启用了 `Release Downloads`, `Release Uploader` 和 `Release Histogram`。

[microsoft/terminal@v1.22.2702.0](https://github.com/microsoft/terminal/releases/tag/v1.22.2702.0):

![microsoft/terminal@v1.22.2702.0](./images/assets-1.jpg)

[PRO-2684/GM_config@v1.2.1](https://github.com/PRO-2684/GM_config/releases/tag/v1.2.1):

![PRO-2684/GM_config@v1.2.1](./images/assets-2.jpg)

</details>

<details><summary>
仪表盘示例
</summary>

这是一个仪表盘界面的示例，其中 `📰 Dashboard` 设置为 `Mobile-Like`, `↖️ Left Sidebar` 设置为 `Hidden`, `↗️ Right Sidebar` 设置为 `Hide 'Latest changes'`。

![](./images/dashboard.jpg)

</details>

<details><summary>
搜索建议中跳转 Issue/PR 示例
</summary>

从搜索建议中跳转到 Issue 的示例，方法是在搜索框中输入 `#1`。

![](./images/go-to-issue.png)

</details>

## 🔑 个人访问令牌 (PAT)

- 没有 PAT，每小时只允许 $60$ 次请求；有 PAT，每小时允许 $5000$ 次请求，对大多数用户来说足够了。
- [在这里](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) 了解如何创建细粒度的个人访问令牌。
- 在 `Repository access` 选项卡下只需选择 `Public Repositories (read-only)`（默认设置）。此部分后面展示了一张示例图片，以供参考。
- 请注意，此脚本无法在私有仓库上添加额外信息。
- 记得 *在令牌过期时生成一个新令牌*。
- 自行承担在镜像站上使用个人访问令牌的风险。

<details><summary>
个人访问令牌示例设置
</summary>

![](./images/token.jpeg)

</details>

## 🤔 已知问题

- 添加的信息可能不对齐。
- 如果启用了 "Tracking Prevention"，则可能会看到一个 "Error Looks like something went wrong!" 横幅。
