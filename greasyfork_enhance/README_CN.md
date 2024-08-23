![Greasy Fork](https://img.shields.io/greasyfork/dt/467078) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

> 如果你在 Greasy Fork 上查看自述文件时遇到格式问题，请访问 [GitHub 上的自述文件](https://github.com/PRO-2684/gadgets/blob/main/greasyfork_enhance/README_CN.md)以获得更好的体验。

## 🪄 功能

- 过滤 (隐藏) 名称与给定正则表达式匹配的脚本 (以下是一些示例)
  - `.{30,}`: 隐藏名称长度大于 30 的脚本
  - `网盘|网课|网购`: 隐藏包含 `网盘`、`网课` 或 `网购` 的脚本
  - `[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDEFF]|\uFE0F`: 隐藏包含 Emoji 的脚本
- 为 Greasyfork 页面上的标题 (`h1~h6`) 添加锚点，以便于导航
- 快速回到顶部
  - 双击两侧空白区域
  - 点击右下角 `↑` 按钮
- 展示大纲的侧栏 (*动态透明度*)
- 修复当前 tab 链接，使其也能工作 (包括脚本详情页的 tab 和网站主页的 Logo)
- 更大的拖拽文件区域
- 复制/隐藏/显示代码 ([测试链接](https://greasyfork.org/scripts/470224))
  - 自动隐藏大于指定行数的代码
- 更易于辨识的表格
- 扁平布局
- 高级搜索语法 (**不区分大小写**)
  - `site:`: 将结果限定在支持指定网站的脚本，例如查询 `ad site:youtube.com`，会将你导航至 `https://greasyfork.org/scripts/by-site/youtube.com?q=ad`
  - `type:`: 在指定类型中搜索，包括如下类型：
    - `script`: 脚本搜索 (默认)
    - `lib`, `library`: 库搜索
    - ~~`code`: 代码搜索~~
    - `user`: 用户搜索
  - `lang:`: 指定编程语言 (仅支持脚本搜索)
    - `js`, `javascript`: JavaScript (默认)
    - `css`: CSS
    - `any`, `all`: 所有语言
  - `sort:`: 指定排序方式 (仅支持脚本搜索)
    - `rel`, `relevant`, `relevance`: 按相关性排序 (指定搜索词时默认)
    - `day`, `daily`, `daily_install`, `daily_installs`: 按日安装量排序 (未指定搜索词时默认)
    - `total`, `total_install`, `total_installs`: 按总安装量排序
    - `score`, `rate`, `rating`, `ratings`: 按评分排序
    - `created`, `created_at`: 按创建时间排序
    - `updated`, `updated_at`: 按更新时间排序
    - `name`, `title`: 按名称排序
- 展示库的其他可用网址
- 展示当前脚本的短链
- 快捷键
    - 在文本输入框 `Ctrl+Enter` 提交表单
    - `Enter` 聚焦至第一个搜索框/文本框
    - `Escape` 取消聚焦
- 使用 `wsrv.nl` 作为图像代理
- 控制 Tab 缩进大小

## ⚙️ 配置

> 用 `*` 标记的配置项需要刷新以生效

- **Regex Filter**: 使用正则表达式过滤匹配的脚本
- **Auto hide code**: 是否自动隐藏长代码片段
- **Min rows to hide**: 自动隐藏的最小行数
- **Tab size**: Tab 缩进大小
- **Hide buttons**: 是否隐藏悬浮按钮
- **Flat layout**: 是否启用扁平布局
- **Animation**: 启用动画
- **Alternative URLs for library**: 展示库的其他可用网址
- **Short link**: 展示当前脚本的短链
- **Shortcut**: 启用快捷键
- \***Search syntax**: 启用搜索语法
- \***Image proxy**: 使用 `wsrv.nl` 作为用户上传图像的代理
