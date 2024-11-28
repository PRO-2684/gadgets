## ✨ Introduction

Editio is a simple script that adds some extra features to inputs and textareas, inspired by Visual Studio Code. It's lightweight and (theoretically) applies to all inputs and textareas on all websites.

## 🪄 Features & Configuation

- **🖇️ Pairing**: Pairing brackets and quotes
    - **➕ Auto close**: Autoclose brackets and quotes (Similar to `editor.autoClosingBrackets` in VSCode)
    - **➖ Auto delete**: Remove adjacent closing quotes or brackets (Similar to `editor.autoClosingDelete` in VSCode)
    - **🚫 Auto overtype**: Type over closing brackets (Similar to `editor.autoClosingOvertype` in VSCode)
        - Doesn't work for pairs with the same opening and closing characters
        - The input character is a closing one and the same as the character after the cursor
        - The character before the cursor is the respective opening one
    - **📜 Pairs**: A list of characters that should be paired (The length should be even)

## 📃 Notes

I've done my best to make undo/redo history work as similar to VSCode as possible. However, there are still some minor differences. Any contributions are welcome!