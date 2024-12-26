# Baidu Debloate

隐藏百度的一些垃圾玩意儿。当前支持：

- 百度百科
- 百度经验
- 百度贴吧
- 百度翻译

## 安装

- [UserStyles.World](https://userstyles.world/style/17133) [![Install directly with Stylus](https://img.shields.io/badge/Install%20directly%20with-Stylus-00adad.svg)](https://userstyles.world/api/style/17133.user.css)
- [GitHub](https://github.com/PRO-2684/gadgets/raw/main/baidu_debloate/) [![Install directly with Stylus](https://img.shields.io/badge/Install%20directly%20with-Stylus-00adad.svg)](https://github.com/PRO-2684/gadgets/raw/main/baidu_debloate/baidu_debloate.user.css)

## 功能 & 配置

> 注意：百度翻译的功能仅在旧版页面上生效。关于如何切换到旧版页面，请参考 [附录](#切换到百度翻译旧版页面)。

- `[通用] 隐藏秒懂百科`: 隐藏百度百科和百度经验上出现的的秒懂百科，以及百度翻译的讲解视频。
- `[通用] 隐藏顶栏`: 隐藏百度百科、百度经验、百度贴吧、百度翻译的顶栏。
- `[通用] 隐藏导航栏`: 隐藏百度百科、百度经验、百度贴吧的导航栏。
- `[通用] 隐藏活动/广告`: 隐藏百度百科、百度经验、百度贴吧、百度翻译的活动/广告。
- `[通用] 隐藏相关推荐`: 隐藏百度百科的相关搜索、百度经验的相关经验、百度贴吧的贴吧热议榜。
- `[通用] 隐藏辅助模式`: 隐藏百度经验和百度贴吧的辅助模式按钮。
- `[通用] 隐藏浮动工具条`: 完全隐藏百度经验、百度贴吧、百度翻译的浮动工具条。
- `[通用] 完全隐藏侧栏`: 隐藏百度经验、百度贴吧的侧栏，同时使主要内容宽屏。
- `[贴吧] 隐藏气泡`: 隐藏百度贴吧帖子的气泡背景。
- `[贴吧] 隐藏快捷键提示`: 隐藏百度贴吧右下角的快捷键提示。
- `[翻译] 隐藏底栏`: 隐藏百度翻译的底栏。
- `[翻译] 结果宽屏`: 使百度翻译左侧的结果宽屏。

![Before & After](baidu.jpg)

## 附录

### 切换到百度翻译旧版页面

#### 登录百度账号

若你已经登录百度账号，则可在右上角的下拉框中选择“返回旧版”。

![old](./old.jpg)

#### 手动设置 Cookie

设置 cookie `smallFlowVersion` 为 `old`，随后访问 [百度翻译主页](https://fanyi.baidu.com/) 即可。你可以在百度翻译页面调出控制台，随后执行如下代码：

```javascript
document.cookie = "smallFlowVersion=old; path=/";
location.href = "https://fanyi.baidu.com/";
```

#### 使用用户脚本

此脚本暂未发布，但是你仍然可以手动安装它：[GitHub](https://github.com/PRO-2684/gadgets/blob/main/baidu_fanyi_plus/bfp.js)
