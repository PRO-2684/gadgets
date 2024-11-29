<img src="./editio.svg" align="right" style="width: 6em; height: 6em; max-width: 100%;">

## ✨ 简介

Editio 是一个由 Visual Studio Code 启发的简易脚本，它可以给输入框和文本框添加一些额外功能。它十分轻量且（理论上）适用于所有网站上的所有输入框和文本框。

## 🪄 功能与配置

- **🖇️ Pairing**: 匹配括号和引号
    - **➕ Auto close**: 自动闭合括号和引号（类似于 VSCode 中的 [`editor.autoClosingBrackets`](vscode://settings/editor.autoClosingBrackets)）
    - **➖ Auto delete**: 删除相邻的闭合引号或括号（类似于 VSCode 中的 [`editor.autoClosingDelete`](vscode://settings/editor.autoClosingDelete)）
    - **🚫 Auto overtype**: 覆写闭合括号（类似于 VSCode 中的 [`editor.autoClosingOvertype`](vscode://settings/editor.autoClosingOvertype)）
        - 输入字符是一个闭合字符且与光标后的字符相同
        - 光标前的字符是相应的开放字符
        - 对于具有相同开放和闭合字符的对子不起作用
    - **🔁 Jumping**: 跳转到匹配的括号
        - 按 <kbd>Ctrl</kbd> + <kbd>Q</kbd> 跳转到匹配的括号
        - 对于具有相同开放和闭合字符的对子不起作用
    - **📜 Pairs**: 应该成对子的字符（长度应为偶数）
- **↔️ Tabulator**: Tab 键相关的功能
    - **↪️ Tab out**: 按下 (<kbd>Shift</kbd>+) <kbd>Tab</kbd> 来跳转至下一个 (或上一个) 所指定的字符 (与拓展 [`albert.TabOut`](vscode:extension/albert.TabOut) 相似)
    - **📜 Tab out chars**: 需要 Tab out 的字符

## 📃 注意

我已尽力使撤销/重做的历史记录与 VSCode 相似，但它们之间仍然存在一些微小的差异。欢迎任何贡献！
