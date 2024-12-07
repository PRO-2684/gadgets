<img src="./editio.svg" align="right" style="width: 6em; height: 6em; max-width: 100%;">

## ✨ 简介

Editio 是一个简单的脚本，将一些 Visual Studio Code 的功能移植到了 Web 上。它轻量且（理论上）可以在所有网站上运行。

## 🪄 功能与配置

- **🖇️ Pairing**: 匹配括号和引号
    - **➕ Auto close**: 自动闭合括号和引号（类似于 VSCode 中的 [`editor.autoClosingBrackets`](https://pro-2684.github.io/?page=redirect&url=vscode%3A%2F%2Fsettings%2Feditor.autoClosingBrackets) 和 [`editor.autoSurround`](https://pro-2684.github.io/?page=redirect&url=vscode%3A%2F%2Fsettings%editor.autoSurround)）
    - **➖ Auto delete**: 删除相邻的闭合引号或括号（类似于 VSCode 中的 [`editor.autoClosingDelete`](https://pro-2684.github.io/?page=redirect&url=vscode%3A%2F%2Fsettings%2Feditor.autoClosingDelete)）
    - **🚫 Auto overtype**: 覆写闭合括号（类似于 VSCode 中的 [`editor.autoClosingOvertype`](https://pro-2684.github.io/?page=redirect&url=vscode%3A%2F%2Fsettings%2Feditor.autoClosingOvertype)）
        - 输入字符是一个闭合字符且与光标后的字符相同
        - 光标前的字符是相应的开放字符
        - 对于具有相同开放和闭合字符的对子不起作用
    - **🔁 Jumping**: 跳转到匹配的括号
        - 按 <kbd>Ctrl</kbd> + <kbd>Q</kbd> 跳转到匹配的括号
        - 对于具有相同开放和闭合字符的对子不起作用
    - **📜 Pairs**: 应该成对子的字符（长度应为偶数）
- **↔️ Tabulator**: Tab 键相关的功能
    - **↪️ Tab out**: 按下 (<kbd>Shift</kbd>+) <kbd>Tab</kbd> 来跳转至下一个 (或上一个) 所指定的字符 (与拓展 [`albert.TabOut`](https://pro-2684.github.io/?page=redirect&url=vscode%3Aextension%2Falbert.TabOut) 相似)
    - **📜 Tab out chars**: 需要 Tab out 的字符
- **🔗 URL**: 与 URL 相关的功能
    - **📋 Paste into selection**: 将 URL 以 Markdown 格式粘贴到选中的文本中
    - **🔍 Recognized schemes**: URL 相关功能所识别的 URL schemes
- **🖱️ Mouse**: 与鼠标相关的功能
    - **🚀 Fast scroll**: 使得按下 <kbd>Alt</kbd> 时滚动更快
        - 请注意，*使用* 此功能时会明确禁用平滑滚动
    - **🎚️ Fast scroll sensitivity**: 按下 <kbd>Alt</kbd> 时加速的倍数
    - **⏱️ Consecutive scroll threshold**: 将滚动行为认为是连续的时间差阈值
- **⚙️ Advanced**: 高级选项
    - **🔒 Capture**: 设立事件监听器时设置 [`capture`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#capture) 为 true
        - 如果启用，Editio 的处理程序可能会覆盖网站的处理程序
    - **🚫 Default prevented**: 如果事件被 [`defaultPrevented`](https://developer.mozilla.org/en-US/docs/Web/API/Event/defaultPrevented)，则不处理该事件
        - 如果禁用，Editio 可能会再次处理该事件，即使它已被网站处理
    - **🐞 Debug**: 启用调试模式

## 📃 注意

我已尽力使 Editio 与 VSCode 相似，但它们之间仍然存在一些微小的差异：

- Editio **总是**关闭括号和引号，而 VSCode 可以配置为 `languageDefined` 或 `beforeWhitespace`。
- Editio **总是**删除和覆写相邻的闭合括号和引号，而 VSCode 仅在闭合字符时是自动插入的时候才会这样做。
- 选区和光标的位置不会被记录在编辑历史中。
- Editio 的快速滚动不支持平滑滚动。

欢迎贡献！
