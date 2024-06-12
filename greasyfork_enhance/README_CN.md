![Greasy Fork](https://img.shields.io/greasyfork/dt/467078) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

## 🪄 功能

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
- 高级搜索语法
- 展示库的其他可用网址
- 展示当前脚本的短链
- 快捷键
    - 在文本输入框 `Ctrl+Enter` 提交表单
- 使用 `wsrv.nl` 作为图像代理

## ⚙️ 配置

> 用 `*` 标记的配置项需要刷新以生效

- **Auto hide code**: 是否自动隐藏长代码片段
- **Min rows to hide**: 自动隐藏的最小行数
- **Flat layout**: 是否启用扁平布局
- **Animation**: 启用动画
- **Alternative URLs for library**: 展示库的其他可用网址
- **Short link**: 展示当前脚本的短链
- **Shortcut**: 启用快捷键
- \***Search syntax**: 启用搜索语法
  - `site:`: 将结果限定在支持指定网站的脚本，例如查询 `ad site:youtube.com`，会将你导航至 `https://greasyfork.org/scripts/by-site/youtube.com?q=ad`
- \***Image proxy**: 使用 `wsrv.nl` 作为用户上传图像的代理
