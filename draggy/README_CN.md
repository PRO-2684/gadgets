## 🪄 功能

- 拖拽链接以在新标签页中打开
- 拖拽文本以在新标签页中搜索
- 自定义搜索引擎及搜索词最大长度
- 自定义最小拖拽距离
- 一个圆形覆盖层以指示最小拖拽距离
- Todo
    - 使用 `Esc` 中断 draggy (可能实际上无法检测)

## ⚙️ 配置

- **Circle overlay**: 何时展示圆形覆盖层
    - Always: 当检测到拖拽时始终显示圆形覆盖层
    - Auto: 仅当检测到的拖拽以文本选择或链接为对象时显示圆形覆盖层
    - Never: 从不显示圆形覆盖层
- **Search engine**: 拖拽文本时使用的搜索引擎。使用 `{}` 作为 URL 编码的查询关键词的占位符。
- **Maximum text length**: 搜索词的最大长度。如果搜索词的长度超过此值，将被截断。将其设置为 0 以禁用此功能。
- **Minimum drag distance**: 触发 draggy 的最小距离。
- **Maximum time delta**: esc/drop 和 dragend 事件之间的最大时间差，以将它们视为不同的用户手势。*通常不需要更改此值。*
- **Debug mode**: 启用调试模式。

## 📃 注意

如果您使用的是 Microsoft Edge，您可能会发现 "超级拖放" 正是您想要的东西，它与 Draggy 相比各有优劣。下面有一张两者之间的比较表格，若您更倾向于超级拖放，请在 `edge://flags/#edge-super-drag-drop` 启用实验性功能，然后在 `edge://settings/superDragDrop` 启用该功能。

| 项目 | Draggy | 超级拖放 |
| --- | --- | --- |
| 拖拽链接 | 🟢 | 🟢 |
| 拖拽文本 | 🟢 | 🟢 |
| 拖拽图片 | <span title="即将支持">🔴*</span> | 🟢 |
| 后台打开 | <span title="浏览器设计使得此功能无法实现">🔴*</span> | 🟢 |
| 兼容性 | 🟡 | 🟢 |
| 自定义搜索引擎 | 🟢 | <span title="仅限必应和默认搜索引擎">🟡*</span> |
| 搜索词最大长度 | 🟢 | 🔴 |
| 最小拖拽距离 | 🟢 | 🔴 |
| 取消拖拽 | <span title="将鼠标移回圈内 (浏览器设计使得 Esc 取消无法实现)">🟢*</span> | <span title="按 Esc 键">🟢*</span> |
| 提示信息 | <span title="圆形覆盖层">🟢*</span> | <span title="顶部 Toast">🟢*</span> |
| 网站排除列表 | <span title="自行在 Tampermonkey 中配置">🟢*</span> | 🟢 |
| 可定制性 | 🟢 | 🔴 |
| 隐私 | 🟢 | <span title="会在搜索时添加跟踪参数">🔴*</span> |
