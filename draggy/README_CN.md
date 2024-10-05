## 🪄 功能

- 拖拽链接、图片以在新标签页中打开
- 拖拽文本以在新标签页中搜索
- 自定义搜索引擎及搜索词最大长度
- 自定义最小拖拽距离
- 一个圆形覆盖层以指示最小拖拽距离
- Todo
    - 使用 `Esc` 中断 draggy (可能实际上无法检测)

## ⚙️ 配置

- **🎨 Appearance settings**: Draggy 覆盖层的外观设置。
    - **Circle overlay**: 何时展示圆形覆盖层。
        - Always: 当检测到拖拽时始终显示圆形覆盖层
        - Auto: 仅当检测到的拖拽以文本选择或链接为对象时显示圆形覆盖层
        - Never: 从不显示圆形覆盖层
- **🛠️ Operation settings**: Draggy 的操作设置。
    - **Open tab in background**: 是否在后台打开新标签页。
    - **Open tab insert**: 是否将新标签页插入到当前标签页旁边。如果为 false，则新标签页将追加到末尾。
    - **Minimum drag distance**: 触发 draggy 的最小距离。
- **🔎 Search engine settings**: 为不同方向配置搜索引擎。使用 `{<max-length>}` 作为 URL 编码查询的占位符，其中 `<max-length>` 是最大文本长度。如果未指定 `<max-length>`，则搜索词不会被截断。
    - **Search engine (default)**: 拖拽文本时使用的默认搜索引擎。
    - **Search engine (left)**: 向左拖拽文本时使用的搜索引擎。留空以使用默认搜索引擎。
    - **Search engine (right)**: 向右拖拽文本时使用的搜索引擎。留空以使用默认搜索引擎。
    - **Search engine (up)**: 向上拖拽文本时使用的搜索引擎。留空以使用默认搜索引擎。
    - **Search engine (down)**: 向下拖拽文本时使用的搜索引擎。留空以使用默认搜索引擎。
    - <details><summary>作者的配置</summary>
        <ul>
            <li><strong>Search engine (left)</strong>: <code>https://www.deepl.com/zh/translator#en/zh-hans/{}</code> (DeepL 翻译)</li>
            <li><strong>Search engine (right)</strong>: <code>https://opnxng.com/search?q={50}</code> (OpnXng 搜索)</li>
            <li><strong>Search engine (up)</strong>: <code>https://www.google.com/search?q={50}</code> (Google 搜索)</li>
            <li><strong>Search engine (down)</strong>: <code>https://www.bing.com/search?q={50}</code> (Bing 搜索)</li>
        </ul>
    </details>
- **⚙️ Advanced settings**: 针对高级用户或调试的设置。
    - **Maximum time delta**: esc/drop 和 dragend 事件之间的最大时间差，以将它们视为不同的用户手势。*通常不需要更改此值。*
    - **Debug mode**: 启用调试模式。

## 📃 注意

如果您使用的是 Microsoft Edge，您可能会发现 "超级拖放" 正是您想要的东西，它与 Draggy 相比各有优劣。下面有一张两者之间的比较表格，若您更倾向于超级拖放，请在 `edge://flags/#edge-super-drag-drop` 启用实验性功能，然后在 `edge://settings/superDragDrop` 启用该功能。

| 项目 | Draggy | 超级拖放 |
| --- | --- | --- |
| 拖拽链接、文本与图片 | 🟢 | 🟢 |
| 后台打开标签页 | 🟢 | 🟢 |
| 插入打开的标签页 | 🟢 | <span title="已打开的标签页总是追加到末尾">🔴*</span> |
| 兼容性 | 🟡 | 🟢 |
| 自定义搜索引擎 | <span title="基于拖拽方向允许最多 4 个不同的搜索引擎">🟢*</span> | <span title="仅允许 1 个搜索引擎且限制为 Bing 或默认搜索引擎">🟡*</span> |
| 搜索词最大长度 | 🟢 | 🔴 |
| 最小拖拽距离 | 🟢 | 🔴 |
| 取消拖拽 | <span title="将鼠标移回圈内 (浏览器设计使得 Esc 取消无法实现)">🟢*</span> | <span title="按 Esc 键">🟢*</span> |
| 提示信息 | <span title="圆形覆盖层">🟢*</span> | <span title="顶部 Toast">🟢*</span> |
| 网站排除列表 | <span title="自行在 Tampermonkey 中配置">🟢*</span> | 🟢 |
| 可定制性 | 🟢 | 🔴 |
| 隐私 | 🟢 | <span title="会在搜索时添加跟踪参数">🔴*</span> |
| 跨浏览器 | <span title="预计可以在所有装有篡改猴的现代浏览器中工作">🟢*</span> | <span title="仅限 Edge">🔴*</span> |
