<img src="./editio.svg" align="right" style="width: 6em; height: 6em; max-width: 100%;">

## ✨ Introduction

Editio is a simple script that adds some extra features to inputs and textareas, inspired by Visual Studio Code. It's lightweight and (theoretically) applies to all inputs and textareas on all websites.

## 🪄 Features & Configuation

- **🖇️ Pairing**: Pairing brackets and quotes
    - **➕ Auto close**: Autoclose brackets and quotes (Similar to [`editor.autoClosingBrackets`](vscode://settings/editor.autoClosingBrackets) in VSCode)
    - **➖ Auto delete**: Remove adjacent closing quotes or brackets (Similar to [`editor.autoClosingDelete`](vscode://settings/editor.autoClosingDelete) in VSCode)
    - **🚫 Auto overtype**: Type over closing brackets (Similar to [`editor.autoClosingOvertype`](vscode://settings/editor.autoClosingOvertype) in VSCode)
        - The input character is a closing one and the same as the character after the cursor
        - The character before the cursor is the respective opening one
        - Doesn't work for pairs with the same opening and closing characters
    - **🔁 Jumping**: Jump between paired brackets
        - Press <kbd>Ctrl</kbd> + <kbd>Q</kbd> to jump to the matching bracket
        - Doesn't work for pairs with the same opening and closing characters
    - **📜 Pairs**: A list of characters that should be paired (The length should be even)
- **↔️ Tabulator**: Tab-related features
    - **↪️ Tab out**: Pressing (<kbd>Shift</kbd>+) <kbd>Tab</kbd> to move to the next (or previous) character specified (Similar to the extension [`albert.TabOut`](vscode:extension/albert.TabOut))
    - **📜 Tab out chars**: Characters to tab out of

## 📃 Notes

I've done my best to make undo/redo history work as similar to VSCode as possible. However, there are still some minor differences. Any contributions are welcome!
