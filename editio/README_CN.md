<img src="data:image/svg+xml,%3Csvg%20fill%3D%22%23000000%22%20viewBox%3D%220%200%2024%2024%22%20id%3D%22bracket-square-2%22%20data-name%3D%22Flat%20Color%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22icon%20flat-color%22%20data-darkreader-inline-fill%3D%22%22%20style%3D%22--darkreader-inline-fill%3A%20%23151616%3B%22%3E%3Cg%20id%3D%22SVGRepo_bgCarrier%22%20stroke-width%3D%220%22%3E%3C%2Fg%3E%3Cg%20id%3D%22SVGRepo_tracerCarrier%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fg%3E%3Cg%20id%3D%22SVGRepo_iconCarrier%22%3E%3Crect%20id%3D%22primary%22%20x%3D%222%22%20y%3D%222%22%20width%3D%2220%22%20height%3D%2220%22%20rx%3D%222%22%20style%3D%22fill%3A%20rgb(0%2C%200%2C%200)%3B%20--darkreader-inline-fill%3A%20%23151616%3B%22%20data-darkreader-inline-fill%3D%22%22%3E%3C%2Frect%3E%3Cpath%20id%3D%22secondary%22%20d%3D%22M15%2C18H14a1%2C1%2C0%2C0%2C1%2C0-2h1V13a2%2C2%2C0%2C0%2C1%2C.27-1A2%2C2%2C0%2C0%2C1%2C15%2C11V8H14a1%2C1%2C0%2C0%2C1%2C0-2h1a2%2C2%2C0%2C0%2C1%2C2%2C2v3a1%2C1%2C0%2C0%2C1%2C0%2C2v3A2%2C2%2C0%2C0%2C1%2C15%2C18Zm-4-1a1%2C1%2C0%2C0%2C0-1-1H9V13a2%2C2%2C0%2C0%2C0-.27-1A2%2C2%2C0%2C0%2C0%2C9%2C11V8h1a1%2C1%2C0%2C0%2C0%2C0-2H9A2%2C2%2C0%2C0%2C0%2C7%2C8v3a1%2C1%2C0%2C0%2C0%2C0%2C2v3a2%2C2%2C0%2C0%2C0%2C2%2C2h1A1%2C1%2C0%2C0%2C0%2C11%2C17Z%22%20style%3D%22fill%3A%20rgb(44%2C%20169%2C%20188)%3B%20--darkreader-inline-fill%3A%20%232d666f%3B%22%20data-darkreader-inline-fill%3D%22%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fsvg%3E" align="right" style="width: 6em; height: 6em; max-width: 100%;">

## ✨ 简介

Editio 是一个由 Visual Studio Code 启发的简易脚本，它可以给输入框和文本框添加一些额外功能。它十分轻量且（理论上）适用于所有网站上的所有输入框和文本框。

## 🪄 功能与配置

- **🖇️ Pairing**: 匹配括号和引号
    - **➕ Auto close**: 自动闭合括号和引号（类似于 VSCode 中的 `editor.autoClosingBrackets`）
    - **➖ Auto delete**: 删除相邻的闭合引号或括号（类似于 VSCode 中的 `editor.autoClosingDelete`）
    - **🚫 Auto overtype**: 覆盖闭合括号（类似于 VSCode 中的 `editor.autoClosingOvertype`）
        - 对于具有相同开放和闭合字符的对子不起作用
        - 输入字符是一个闭合字符且与光标后的字符相同
        - 光标前的字符是相应的开放字符
    - **📜 Pairs**: 应该成对子的字符（长度应为偶数）

## 📃 注意

我已尽力使撤销/重做的历史记录与 VSCode 相似，但它们之间仍然存在一些微小的差异。欢迎任何贡献！
