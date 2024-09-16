# gadgets
![GitHub license](https://img.shields.io/github/license/PRO-2684/gadgets?style=flat-square) English | [简体中文](./README_CN.md)

## Introduction
Some code snippets that's hard to categorize. See READMEs under subfolders for detailed description if you're interested in some of them. Snippets not listed below that are in the directory are not officially released and have no related documentation, and are only for testing.

## List
- `52_enhance`: 52 forum enhancement script.
- `arxiv_html_debloate`: Hides unnecessary elements on `arxiv.org/html/*`, giving you a clean view.
- `auto_grading`: Auto grading for `tqm.ustc.edu.cn`.
- `baidu_debloate`: Hides some gibberish on Baidu sites, including `baike.baidu.com` and `jingyan.baidu.com`.
- `bb_batch_reconcile`: Batch reconcile student grades in [Blackboard](https://www.blackboard.com/) system.
- `checkbox_patch`: Patches the property `checked` of a certain checkbox, so that a `change` event will be issued when the `checked` value is modified by other scripts.
- `CORS_helper`: A simple, customizable script that helps you to bypass CORS restrictions.
- `etag_server`： Simple HTTP server that serves files, but using `ETag` instead of `Last-Modified` for caching.
- `GM_config`: Simple config lib for Tampermonkey scripts.
- `greasyfork_enhance`: Enhance your experience at Greasyfork.
- `hover_card`: Get Github hovercard for given repo.
- `purlfy_for_tm`: The ultimate URL purifier - Tampermonkey version.
- `sanitify_header_id`: Sanitify/Sanitize given string (header id) so that it is (hopefully) free of emojis, with its spaces replaced by `-`.
- `scrollbar_mod`: Customize your scrollbar easily.
- `subnet_helper`: Converts binary subnet mask to human-friendly notation (dot-decimal with length) and vice versa. In addition, it can provide available IP range and count in the given subnet.
- `uhp`: USTC Helper - Various useful functions for USTC students: verification code recognition, auto login, rec performance improvement and more.
- `url_summary`: Get summary of a given URL, including favicon, title, description and keywords.
- `wechat_video`: Download videos from video posts by WeChat Official Accounts.

## README template
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