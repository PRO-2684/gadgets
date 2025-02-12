# 🚫 移除搜索关键词

![Greasy Fork](https://img.shields.io/greasyfork/dt/469656) [![支持](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

## 🪄 功能

移除傻逼高亮搜索关键词。 (参考附上的截图)

## 🤔 原理

这个脚本使用了与 [Bilibili Evolved](https://github.com/the1812/Bilibili-Evolved) 的 `disableCommentsSearchLink` 不同的方法。Bilibili Evolved 是通过 CSS 来阻止搜索词显示，但是这个脚本是通过**修改 DOM** 来实现的。也就是说，搜索词被替换成了纯文本。通过这种方式，三击鼠标全选就会如你所愿的正常工作。

## 🌐 支持的站点

- [哔哩哔哩](https://www.bilibili.com/) ([测试链接](https://www.bilibili.com/video/BV1cN411r7wx/))
- [百度知道](https://zhidao.baidu.com/) ([测试链接](https://zhidao.baidu.com/question/2123400989832060467))
- [CSDN](https://blog.csdn.net/) ([测试链接](https://blog.csdn.net/qq_37504892/article/details/114268077))
