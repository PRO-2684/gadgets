![Greasy Fork](https://img.shields.io/greasyfork/dt/453530) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

## 🪄 功能

1. [统一身份认证](https://passport.ustc.edu.cn/)
    - 暂无功能

2. [USTC 邮箱](https://mail.ustc.edu.cn/)
    - 将焦点置于登录按钮
    - 移除水印
    - 移除背景图片

3. [睿客网](https://rec.ustc.edu.cn/)
    - 自动点入统一身份认证系统以便登录
    - 部分链接设为当前标签页打开（可显著提高加载速度）

4. [BB 系统 (网络教学平台)](https://www.bb.ustc.edu.cn/)
    - 自动点击登录以及校园网外访问时的登录
    - 检查作业状态（已提交、未提交、查询错误、评分）
        - 允许忽略作业（跳过检查）

5. [综合教务系统](https://jw.ustc.edu.cn)
    - 自动聚焦或点击登录按钮
    - 快捷键支持（``` ` ``` 回主页）
    - “我的成绩”界面使用“尚未评教”遮挡成绩
        - 双击单个条目以遮挡/还原此项
        - 双击表头以遮挡/还原所有项目
        - 支持统计数据、成绩单以及成绩记录表
    - 显示每节课的上下课时间
    - 一些 CSS 改进
    - 课表展示学分/学时总和
    - 隐藏个人/敏感信息

6. [第二课堂](https://young.ustc.edu.cn/login/)
    - 自定义进入时打开的标签页
    - 自动点击校园网外访问时的登录
    - 点击主菜单时自动进入常用的子菜单
    - 移除牛皮癣一般的数据展示中心图片
    - 快捷键支持

7. [Web VPN](https://wvpn.ustc.edu.cn/)
    - 支持自定义收藏夹

8. [评课社区](https://icourse.club/)
    - 展示所有上传的文件/附件，并自动命名
    - 展示所有提及的链接
    - 一些 CSS 改进; 使用原生回到顶部方法
    - 反屏蔽：请使用 [这个脚本](https://greasyfork.org/scripts/494053)

需要更多功能可添加评论，在我能力范围内可能会添加。

## ⌨️ 快捷键

- 左右箭头：切换 tab
- 数字键 (1-9)：切换至指定的 tab
- x：关闭当前 tab
- 滚轮：切换 tab

## ⚙️ 配置

在生效的网站打开 Tampermonkey 菜单以更改配置。

- 统一身份认证
    - **Enabled**: 若为 false, 将禁用针对 passport.ustc.edu.cn 的所有功能
    - **Code recognition**: 启用自动识别验证码
    - **Focus**: 是否聚焦到登录按钮
    - **Service**: 提示服务域名及其可信度
    - **Auto login**: 是否自动点击登录按钮
    - **Show fingerprint**: 是否显示浏览器指纹
    - **Fake fingerprint**: 伪造浏览器指纹
- USTC 邮箱
    - **Enabled**: 若为 false, 将禁用针对 mail.ustc.edu.cn 的所有功能
    - **Focus**: 是否聚焦到登录按钮
    - **Remove watermark**: 移除水印
- 睿客网
    - **Enabled**: ...
    - **Auto login**: 是否自动点击登录按钮（仅限统一身份认证登录）
    - **Open in current tab**: 是否在当前标签页打开部分支持的链接（可显著提高加载速度）
- BB 系统(网络教学平台)
    - **Enabled**: 若为 false, 将禁用针对 www.bb.ustc.edu.cn 的所有功能
    - **Auto authenticate**: 是否在校园网外访问要求验证身份时自动点击登录
    - **Auto login**: 是否在主界面自动登录
    - **Show homework status**: 是否展示作业状态（可能消耗更多流量）
- 综合教务系统
    - **Enabled**: ...
    - **Login**: 登录按钮的动作: 'none', 'focus', 'click'
    - **Shortcut**: 快捷键支持
    - **Score mask**: 双击以遮挡/显示成绩
    - **Detaild time**: 显示每节课的上下课时间
    - **CSS improve**: 一些 CSS 改进
    - **Sum**: 课表界面展示学分学时的总和
    - **Privacy**: 隐藏个人/敏感信息
- 第二课堂
    - **Enabled**: ...
    - **Auto authenticate**: 是否在校园网外访问要求验证身份时自动点击登录
    - **Default tab**: 进入时打开的标签页
    - **Auto tab**: 自动进入常用的子菜单
    - **No data screen**: 移除牛皮癣一般的数据展示中心图片
    - **Shortcut**: 快捷键支持
- Web VPN
    - **Enabled**: ...
    - **Custom collection**: 允许自定义收藏夹
- 评课社区
    - **Enabled**: ...
    - **File list**: 展示所有上传的文件/附件，并自动命名
    - **Link list**: 展示所有提及的链接
    - **CSS improve**: 一些 CSS 改进
    - **Native top**: 使用原生回到顶部方法

更多 USTC 相关的实用脚本可以查看脚本集 [USTC collection](https://greasyfork.org/zh-CN/scripts?set=586574)。
