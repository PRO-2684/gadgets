# gadgets
![GitHub license](https://img.shields.io/github/license/PRO-2684/gadgets?style=flat-square) [English](./README.md) | 简体中文

## 介绍
一些难以分类的代码片段。如果你对其中某些感兴趣，可以查看子文件夹下的 README 以获取详细描述。代码目录中未在下方列出的代码片段并未正式发布，并且没有相关文档，仅供测试。

## 列表
- `52_enhance`: 52 破解论坛增强脚本。
- `arxiv_html_debloate`: 隐藏 `arxiv.org/html/*` 上的不必要元素，让你拥有一个干净的阅读体验。
- `auto_grading`: 自动评教 `tqm.ustc.edu.cn`。
- `baidu_debloate`: 隐藏百度站点上的一些垃圾玩意儿，包括 `baike.baidu.com` 和 `jingyan.baidu.com`。
- `bb_batch_reconcile`: 批量核对 [Blackboard](https://www.blackboard.com/) 系统中的学生成绩。
- `checkbox_patch`: 修补某个复选框的 `checked` 属性，使得当 `checked` 值被其他脚本修改时会发出 `change` 事件。
- `CORS_helper`: 一个简单的、可自定义的脚本，帮助你绕过 CORS 限制。
- `draggy`: 拖拽链接以在新标签页中打开，拖拽文本以在新标签页中搜索。
- `etag_server`: 简易的提供文件服务的 HTTP 服务器，但使用 `ETag` 而不是 `Last-Modified` 进行缓存。
- `github_plus`: 为 GitHub 增加额外的功能。
- `GM_config`: 简易的 Tampermonkey 脚本配置库。
- `greasyfork_enhance`: 增进 Greasyfork 浏览体验。
- `hover_card`: 获取 Github 仓库的悬停卡片。
- `purlfy_for_tm`: 终极 URL 净化器 - Tampermonkey 版本。
- `sanitify_header_id`: 格式化给定字符串（标题 ID），使其不含表情符号，空格被 `-` 替代。
- `scrollbar_mod`: 轻松定制你的滚动条。
- `subnet_helper`: 将二进制子网掩码转换为人类可读的表示法（点十进制表示法加长度），反之亦然。此外，它还可以提供给定子网中的可用 IP 范围和数量。
- `uhp`: USTC Helper - 为 USTC 学生定制的各类实用功能：验证码识别，自动登录，睿客网性能优化以及更多。
- `url_summary`: 获取给定 URL 的摘要，包括图标、标题、描述和关键词。
- `wechat_video`: 下载微信公众号视频推送中的视频。

## README 模板
```markdown
# `<snippet name>`

## 🪄 功能
简要描述代码片段的功能。

## 📖 使用
简要描述如何使用代码片段。

## 🍻 示例
最小工作示例。

## ⚠️ 警告
代码片段可能带来的错误或后果。

## 🌐 参考
与代码片段相关的有用/启发性内容。
```
