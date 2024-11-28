<img src="data:image/svg+xml,%3Csvg%20fill%3D%22%23000000%22%20viewBox%3D%220%200%2024%2024%22%20id%3D%22bracket-square-2%22%20data-name%3D%22Flat%20Color%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22icon%20flat-color%22%20data-darkreader-inline-fill%3D%22%22%20style%3D%22--darkreader-inline-fill%3A%20%23151616%3B%22%3E%3Cg%20id%3D%22SVGRepo_bgCarrier%22%20stroke-width%3D%220%22%3E%3C%2Fg%3E%3Cg%20id%3D%22SVGRepo_tracerCarrier%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fg%3E%3Cg%20id%3D%22SVGRepo_iconCarrier%22%3E%3Crect%20id%3D%22primary%22%20x%3D%222%22%20y%3D%222%22%20width%3D%2220%22%20height%3D%2220%22%20rx%3D%222%22%20style%3D%22fill%3A%20rgb(0%2C%200%2C%200)%3B%20--darkreader-inline-fill%3A%20%23151616%3B%22%20data-darkreader-inline-fill%3D%22%22%3E%3C%2Frect%3E%3Cpath%20id%3D%22secondary%22%20d%3D%22M15%2C18H14a1%2C1%2C0%2C0%2C1%2C0-2h1V13a2%2C2%2C0%2C0%2C1%2C.27-1A2%2C2%2C0%2C0%2C1%2C15%2C11V8H14a1%2C1%2C0%2C0%2C1%2C0-2h1a2%2C2%2C0%2C0%2C1%2C2%2C2v3a1%2C1%2C0%2C0%2C1%2C0%2C2v3A2%2C2%2C0%2C0%2C1%2C15%2C18Zm-4-1a1%2C1%2C0%2C0%2C0-1-1H9V13a2%2C2%2C0%2C0%2C0-.27-1A2%2C2%2C0%2C0%2C0%2C9%2C11V8h1a1%2C1%2C0%2C0%2C0%2C0-2H9A2%2C2%2C0%2C0%2C0%2C7%2C8v3a1%2C1%2C0%2C0%2C0%2C0%2C2v3a2%2C2%2C0%2C0%2C0%2C2%2C2h1A1%2C1%2C0%2C0%2C0%2C11%2C17Z%22%20style%3D%22fill%3A%20rgb(44%2C%20169%2C%20188)%3B%20--darkreader-inline-fill%3A%20%232d666f%3B%22%20data-darkreader-inline-fill%3D%22%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fsvg%3E" align="right" style="width: 6em; height: 6em; max-width: 100%;">

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
