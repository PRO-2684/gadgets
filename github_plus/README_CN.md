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
    - **🔲 Full Width**: 使代码块占满宽度（其他按钮可能会覆盖行尾）。
    - **🫥 Hide Readonly Tip**: 隐藏代码块中的 'Code view is read-only.' 提示。
- **🎨 Appearance**
    - **📰 Dashboard**: 配置仪表盘。(`Default`, `Hide Copilot`, `Hide Feed`, `Mobile-Like`)
    - **↖️ Left Sidebar**: 配置左侧栏。(`Default`, `Hidden`)
    - **↗️ Right Sidebar**: 配置右侧栏。(`Default`, `Hide 'Latest changes'`, `Hide 'Explore repositories'`, `Hide Completely`)
    - **📌 Sticky Avatar**: 使头像固定。(实验性功能，不适用于所有头像)
    - **🫥 Hide Header Underline**: 隐藏标题的下划线。(即标题下边框)
    - **🐱 Catppuccin Icons**: 使用 [catppuccin icons](https://github.com/catppuccin/web-file-explorer-icons/) 为文件夹和文件提供图标 (高度实验性，需要刷新以应用更改)
        - 在侧边栏展开文件夹时不会更新图标。
    - **👀 Visible Details**: 对 `<details>` 元素应用缩进和边框，使其更明显
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
    - **👤 Extended User Info**: 显示用户的扩展信息。
        - 公开的仓库和 gists 数量 (`public_repos`, `public_gists`)
        - 加入日期 (`created_at`)
        - 更新日期 (`updated_at`)
        - 节点 ID (`node_id`)
    - **📁 Extended Repo Info**: 显示仓库的扩展信息。(实验性功能)
        - 大小 (`size`, 单位为 KB)
        - 创建日期 (`created_at`)
        - 更新日期 (`updated_at`)
        - 推送日期 (`pushed_at`)
        - 节点 ID (`node_id`)
    - **🔮 Preview Plus**: 允许浏览更多文件类型 (e.g. MP4, WEBM)
        - **现在无法生效**，由于 [Tampermonkey](https://github.com/Tampermonkey/tampermonkey/issues/2743) / [Chromium](https://issues.chromium.org/issues/500280350) 的一个 bug
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

<details><summary>
Catppuccin 图标 (🌿 Mocha)
</summary>

![](./images/catppuccin-icons.png)

</details>

<details><summary>
Extended User Info
</summary>

![](./images/extended-user-info.png)

</details>

<details><summary>
Visible Details
</summary>

![](./images/visible-details.png)

</details>

## 🔑 个人访问令牌 (PAT)

- 没有 PAT，每小时只允许 $60$ 次请求，并且 GitHub Plus 无法展示私有仓库的扩展信息；有 PAT，每小时允许 $5000$ 次请求，对大多数用户来说足够了，并且 GitHub Plus 可以展示您有访问权限的私有仓库的扩展信息。
- [在这里](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) 了解如何创建细粒度的个人访问令牌。
- 在 `Repository access` 部分选择 `All repositories`，并在 `Permissions` 部分添加只读的 `Metadata` 权限。此部分后面展示了一张示例图片，以供参考。
- 记得 *在令牌过期时生成一个新令牌*。
- 自行承担在镜像站上使用个人访问令牌的风险。

<details><summary>
个人访问令牌示例设置
</summary>

![](./images/token.png)

</details>

## ❓ 常见问题

- Q: 即使 **↗️ Right Sidebar** 未设置为 `Hide Completely`，侧栏仍然被隐藏。如何解决？
    - A: 你的广告拦截器或其他扩展可能正在阻止这些元素。最值得注意的是，[`easylist` 的这个 commit](https://github.com/easylist/easylist/commit/c1ffc815f15c78cbee9c32694acb8bd80c54fb64) 引入了规则 `github.com##.dashboard-changelog:has-text(Latest from our changelog)`，它会隐藏整个侧栏。你可以尝试在 GitHub 上禁用广告拦截器或为此规则添加例外。

## 🤔 已知问题

- 添加的信息可能不对齐。
- 如果启用了 "Tracking Prevention"，则可能会看到一个 "Error Looks like something went wrong!" 横幅。
