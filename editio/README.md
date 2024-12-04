<img src="./editio.svg" align="right" style="width: 6em; height: 6em; max-width: 100%;">

## ✨ Introduction

Editio is a simple script that adds some extra features to inputs and textareas, inspired by Visual Studio Code. It's lightweight and (theoretically) applies to all inputs and textareas on all websites.

## 🪄 Features & Configuation

- **🖇️ Pairing**: Pairing brackets and quotes
    - **➕ Auto close**: Autoclose brackets and quotes (Similar to [`editor.autoClosingBrackets`](https://pro-2684.github.io/?page=redirect&url=vscode%3A%2F%2Fsettings%2Feditor.autoClosingBrackets) in VSCode)
    - **➖ Auto delete**: Remove adjacent closing quotes or brackets (Similar to [`editor.autoClosingDelete`](https://pro-2684.github.io/?page=redirect&url=vscode%3A%2F%2Fsettings%2Feditor.autoClosingDelete) in VSCode)
    - **🚫 Auto overtype**: Type over closing brackets (Similar to [`editor.autoClosingOvertype`](https://pro-2684.github.io/?page=redirect&url=vscode%3A%2F%2Fsettings%2Feditor.autoClosingOvertype) in VSCode)
        - The input character is a closing one and the same as the character after the cursor
        - The character before the cursor is the respective opening one
        - Doesn't work for pairs with the same opening and closing characters
    - **🔁 Jumping**: Jump between paired brackets
        - Press <kbd>Ctrl</kbd> + <kbd>Q</kbd> to jump to the matching bracket
        - Doesn't work for pairs with the same opening and closing characters
    - **📜 Pairs**: A list of characters that should be paired (The length should be even)
- **↔️ Tabulator**: Tab-related features
    - **↪️ Tab out**: Pressing (<kbd>Shift</kbd>+) <kbd>Tab</kbd> to move to the next (or previous) character specified (Similar to the extension [`albert.TabOut`](https://pro-2684.github.io/?page=redirect&url=vscode%3Aextension%2Falbert.TabOut))
    - **📜 Tab out chars**: Characters to tab out of
- **🔗 URL**: URL-related features
    - **📋 Paste into selection**: Paste the URL into the selection in Markdown format
    - **🔍 Recognized schemes**: Recognized URL schemes for the URL-related features
- **⚙️ Advanced**: Advanced options
    - **🔒 Capture**: Set [`capture`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#capture) to true for the event listeners
        - If enabled, Editio's handlers are likely to override the website's handlers
    - **🚫 Default prevented**: Don't handle the event if it's [`defaultPrevented`](https://developer.mozilla.org/en-US/docs/Web/API/Event/defaultPrevented)
        - If disabled, Editio might handle the event again, even after it's been handled by the website
    - **🐞 Debug**: Enable debug mode

## 📃 Notes

I've done my best to make undo/redo history work as similar to VSCode as possible. However, there are still some minor differences. Contributions are welcome!
