# gadgets

![GitHub license](https://img.shields.io/github/license/PRO-2684/gadgets?style=flat-square) English | [简体中文](./README_CN.md)

## 📖 Introduction

Some miscellaneous code snippets, including userscripts and userstyles etc. See READMEs under subfolders for detailed description if you're interested in some of them. Note that:

- While most of the snippets are well-tested, snippets under [Unreleased](#-unreleased) are the exceptions.
- Snippets marked with asterisk (*) are archived and not actively maintained.

## 📃 List

### 🧩 UserScripts

| UserScript | GreasyFork | Description |
| --- | --- | --- |
| [`52_enhance`](./52_enhance) | [#469051](https://greasyfork.org/scripts/469051) | 52 forum enhancement script. |
| [`auto_grading`](./auto_grading) | [#457282](https://greasyfork.org/scripts/457282) | Auto grading for `tqm.ustc.edu.cn`. |
| [`baidu_fanyi_plus`](./baidu_fanyi_plus) | N/A | Enhance Baidu Fanyi with additional features. |
| [`CORS_helper`](./CORS_helper) | [#508769](https://greasyfork.org/scripts/508769) | A simple, customizable script that helps you to bypass CORS restrictions. |
| [`draggy`](./draggy) | [#511154](https://greasyfork.org/scripts/511154) | Drag a link to open in a new tab, drag a piece of text to search in a new tab. |
| [`editio`](./editio) | [#519147](https://greasyfork.org/scripts/519147) | A simple script that adds some extra features to inputs and textareas, inspired by Visual Studio Code. |
| [`export_cookies`](./export_cookies) | [#517291](https://greasyfork.org/scripts/517291) | Export cookies of current tab to a file. |
| [`github_plus`](./github_plus) | [#510742](https://greasyfork.org/scripts/510742) | Enhance GitHub with additional features. |
| ~~[`GM_config`](./GM_config)~~ | [#470224](https://greasyfork.org/scripts/470224) | Moved to [PRO-2684/GM_config](https://github.com/PRO-2684/GM_config). Simple config lib for Tampermonkey scripts. |
| [`greasyfork_enhance`](./greasyfork_enhance) | [#467078](https://greasyfork.org/scripts/467078) | Enhance your experience at Greasyfork. |
| [`purlfy_for_tm`](./purlfy_for_tm) | [#492480](https://greasyfork.org/scripts/492480) | The ultimate URL purifier - Tampermonkey version. |
| [`uhp`](./uhp) | [#453530](https://greasyfork.org/scripts/453530) | USTC Helper - Various useful functions for USTC students: verification code recognition, auto login, rec performance improvement and more. |

### 🎨 UserStyles

| UserStyle | UserStyles.world | Description |
| --- | --- | --- |
| [`ar5iv_plus`](./ar5iv_plus) | [#18946](https://userstyles.world/style/18946) | Enhance `ar5iv.labs.arxiv.org/html/` with various tweaks and improvements. |
| [`arxiv_html_debloate`](./arxiv_html_debloate) | [#16559](https://userstyles.world/style/16559) | Hides unnecessary elements on `arxiv.org/html/*`, giving you a clean view. |
| [`baidu_debloate`](./baidu_debloate) | [#17133](https://userstyles.world/style/17133) | Hides some gibberish on Baidu sites, including `baike.baidu.com`, `jingyan.baidu.com`, `tieba.baidu.com` and `fanyi.baidu.com`. |
| [`scrollbar_mod`](./scrollbar_mod) | [#16203](https://userstyles.world/style/16203) | Customize your scrollbar easily. |
| [`tooltips_mod`](./tooltips_mod) | [#19461](https://userstyles.world/style/19461) | Implement `title` attribute display as a tooltip on touch screen devices. |

### 🛠️ Others

| Snippet | Description |
| --- | --- |
| [`bb_batch_reconcile`](./bb_batch_reconcile) * | Batch reconcile student grades in [Blackboard](https://www.blackboard.com/) system. |
| [`checkbox_patch`](./checkbox_patch) * | Patches the property `checked` of a certain checkbox, so that a `change` event will be issued when the `checked` value is modified by other scripts. |
| [`etag_server`](./etag_server) * | Simple HTTP server that serves files, but using `ETag` instead of `Last-Modified` for caching. |
| [`hover_card`](./hover_card) * | Get Github hovercard for given repo. |
| [`naive_jq`](./naive_jq) * | A naive implementation of `jq` in Node.js, only for quick testing. |
| [`sanitify_header_id`](./sanitify_header_id) * | Sanitify/Sanitize given string (header id) so that it is (hopefully) free of emojis, with its spaces replaced by `-`. |
| [`subnet_helper`](./subnet_helper) * | Converts binary subnet mask to human-friendly notation (dot-decimal with length) and vice versa. In addition, it can provide available IP range and count in the given subnet. |
| [`url_summary`](./url_summary) * | Get summary of a given URL, including favicon, title, description and keywords. |
| [`wechat_video`](./wechat_video) * | Download videos from video posts by WeChat Official Accounts. |

## 🚧 Unreleased

- [`ccb_helper`](./ccb_helper)
- [`google_scholar_plus`](./google_scholar_plus)
- [`kill_adobe`](./kill_adobe)
- [`stickers_wiki_downloader`](./stickers_wiki_downloader)

## 📄 README template

```markdown
# `<snippet name>`

## 🪄 Function
Briefly describe the functions of the snippet. i.e. what it can do.

## 📖 Usage
Briefly describe how to use the snippet.

## 🍻 Example
Minimum working example(s).

## ⚠️ Warning
Some errors or consequences that the snippet might bring about.

## 🌐 Reference
What I have found useful/enlightening related to the snippet.
```
