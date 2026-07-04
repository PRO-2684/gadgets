# 🚫 No Keywords

![Greasy Fork](https://img.shields.io/greasyfork/dt/469656) [![Support on Afdian](https://img.shields.io/badge/Support-Afdian-%23946CE6?style=flat&logo=afdian)](https://afdian.com/a/PRO-2684)

## 🪄 Functions

Get rid of fucking highlighted search keywords. (As shown in the attached screenshot(s))

## 🤔 Mechanism

This script uses a different approach from [Bilibili Evolved](https://github.com/the1812/Bilibili-Evolved)'s `disableCommentsSearchLink`, which uses CSS to stop the keywords from being shown. However, I chose to **modify the DOM** to achieve the goal, that is, replace the search word with plain text. In this way, it would fix the triple click selection as you'd expect it to.

## 🌐 Supported Sites

- [Bilibili](https://www.bilibili.com/) ([Test link](https://www.bilibili.com/video/BV1cN411r7wx/))
- [Baidu Zhidao](https://zhidao.baidu.com/) ([Test link](https://zhidao.baidu.com/question/2123400989832060467))
- [CSDN](https://blog.csdn.net/) ([Test link](https://blog.csdn.net/qq_37504892/article/details/114268077))
