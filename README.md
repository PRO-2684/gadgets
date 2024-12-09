# gadgets

![GitHub license](https://img.shields.io/github/license/PRO-2684/gadgets?style=flat-square) English | [简体中文](./README_CN.md)

## 📖 Introduction

Some miscellaneous code snippets, including userscripts and userstyles. See READMEs under subfolders for detailed description if you're interested in some of them. Note that:

- While most of the snippets are well-tested, snippets under [Unreleased](#-unreleased) are the exceptions.
- Snippets marked with asterisk (*) are archived and not actively maintained.

## 📃 List

### 🧩 Userscripts

- `52_enhance`: 52 forum enhancement script.
- `auto_grading`: Auto grading for `tqm.ustc.edu.cn`.
- `baidu_fanyi_plus`: Enhance Baidu Fanyi with additional features.
- `CORS_helper`: A simple, customizable script that helps you to bypass CORS restrictions.
- `draggy`: Drag a link to open in a new tab, drag a piece of text to search in a new tab.
- `editio`: A simple script that adds some extra features to inputs and textareas, inspired by Visual Studio Code.
- `export_cookies`: Export cookies of current tab to a file.
- `github_plus`: Enhance GitHub with additional features.
- `GM_config`: Simple config lib for Tampermonkey scripts.
- `greasyfork_enhance`: Enhance your experience at Greasyfork.
- `purlfy_for_tm`: The ultimate URL purifier - Tampermonkey version.
- `uhp`: USTC Helper - Various useful functions for USTC students: verification code recognition, auto login, rec performance improvement and more.

### 🎨 UserStyles

- `ar5iv_plus`: Enhance `ar5iv.labs.arxiv.org/html/` with various tweaks and improvements.
- `arxiv_html_debloate`: Hides unnecessary elements on `arxiv.org/html/*`, giving you a clean view.
- `baidu_debloate`: Hides some gibberish on Baidu sites, including `baike.baidu.com` and `jingyan.baidu.com`.
- `scrollbar_mod`: Customize your scrollbar easily.
- `tooltip_mod`: Implement `title` attribute display as a tooltip on touch screen devices.

### 🛠️ Others

- `bb_batch_reconcile` *: Batch reconcile student grades in [Blackboard](https://www.blackboard.com/) system.
- `checkbox_patch` *: Patches the property `checked` of a certain checkbox, so that a `change` event will be issued when the `checked` value is modified by other scripts.
- `etag_server` *： Simple HTTP server that serves files, but using `ETag` instead of `Last-Modified` for caching.
- `hover_card` *: Get Github hovercard for given repo.
- `naive_jq` *: A naive implementation of `jq` in Node.js, only for quick testing.
- `sanitify_header_id` *: Sanitify/Sanitize given string (header id) so that it is (hopefully) free of emojis, with its spaces replaced by `-`.
- `subnet_helper` *: Converts binary subnet mask to human-friendly notation (dot-decimal with length) and vice versa. In addition, it can provide available IP range and count in the given subnet.
- `url_summary` *: Get summary of a given URL, including favicon, title, description and keywords.
- `wechat_video` *: Download videos from video posts by WeChat Official Accounts.

## 🚧 Unreleased

- `ccb_helper`
- `google_scholar_plus`
- `kill_adobe`
- `stickers_wiki_downloader`

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
