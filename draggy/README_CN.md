## 🪄 功能

- 拖拽链接以在新标签页中打开
- 拖拽文本以在新标签页中搜索
- 自定义搜索引擎及搜索词最大长度
- Todo
    - 使用 `Esc` 中断 draggy
    - 自定义最小拖拽距离
    - 一个圆形覆盖层以指示最小拖拽距离

## ⚙️ 配置

- **Debug mode**: 启用调试模式。
- **Search engine**: 拖拽文本时使用的搜索引擎。使用 `{}` 作为 URL 编码的查询关键词的占位符。
- **Maximum text length**: 搜索词的最大长度。如果搜索词的长度超过此值，将被截断。将其设置为 0 以禁用此功能。
- **Maximum time delta**: esc/drop 和 dragend 事件之间的最大时间差，以将它们视为不同的用户手势。*通常不需要更改此值。*
- ~~**Minimum drag distance**: 触发 draggy 的最小距离。~~
- ~~**Overlay color**: 圆形覆盖层的颜色。设置为 `transparent` 以隐藏覆盖层。~~
