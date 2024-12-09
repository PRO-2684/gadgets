# USTC 自动评教

> 我是人民评委？我评价溺马了戈壁！

[![Greasy Fork](https://img.shields.io/greasyfork/dt/457282)](https://greasyfork.org/scripts/457282) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

此脚本可以帮助你在 USTC 教学质量管理平台自动评教，节省时间，解放双手。关键词：自动评教、自动评价、教学评估、教学质量管理平台、USTC、中科大、中国科学技术大学。

## 适用网站

`tqm.ustc.edu.cn/index.html*`

## 安装

1. 确保您已经装有 Tampermonkey
2. 前往 [Greasy Fork](https://greasyfork.org/scripts/457282) 安装脚本

## 使用方法

进入评价界面后：

- 点击侧边栏的“绕过倒计时”即可启用/禁用绕过 5 秒倒计时（在 Enter 以及全自动评教时生效，实验性功能）
- 点击侧边栏的“自动评价”即可选择标准答案（若有答案库不匹配的，则自动滚动到第一个不匹配的题）
- 点击侧边栏的“忽略并转到下一个”即可忽略当前问卷并自动转至课程下一个老师/助教
- 点击侧边栏的“全自动评教”，彻底解放双手（实验性功能）
- 按下 `Enter`：
  - 若有提示框，则点击“确定”/“下一位教师”
  - 否则选择标准答案并尝试提交
- 按下退格 (`Backspace`)：忽略并转到下一个
- `Shift` + `Enter`：全自动评教（实验性功能）

## 更新“参考答案”

由于 Tampermonkey 默认不会自动更新依赖，故你可以选择如下两种方式：

1. 配置答案的更新间隔：前往 Tampermonkey `管理面板` - `设置` - `外部`，在下拉菜单中选择您希望的更新间隔。
2. 手动更新：前往 Tampermonkey `管理面板` - `已安装脚本` - `Auto grading` - `外部`，对于 `资源` 下的每一个条目，点击 `删除` 按钮。刷新页面后，参考答案将会自动更新。

## 其他

更多 USTC 相关的实用脚本可以查看脚本集 [USTC collection](https://greasyfork.org/zh-CN/scripts?set=586574)。
