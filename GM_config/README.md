# `GM_config`

[![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

## 🪄 Function

Simple config lib for Tampermonkey scripts. ([Greasy Fork](https://greasyfork.org/scripts/470224)) ([GitHub](https://github.com/PRO-2684/gadgets/tree/main/GM_config))

## 🎉 Features

- Automatically register menu
- Automatically update menu after config modifications (also support those by your script)
- Support listening for config get, set events

## 🤔 Permission

This library needs the following permissions to work:

```javascript
// @grant        GM_setValue // Save your config
// @grant        GM_getValue // Get your config
// @grant        GM_registerMenuCommand // Register menu
// @grant        GM_unregisterMenuCommand // Update menu
```

**Delete the comment** if you copied and pasted the code, or there might be errors. You may want to delete `@grant none` (if present). If you used `window` object in your script, try `@grant unsafeWindow` and then `let window = unsafeWindow`.

## 📖 Usage

```javascript
let config_desc = { // *Config description*
    password: {
        name: "Password", // Display name
        value: "tmp", // Default value
        processor: (v) => { // Process user inputs, throw error if invalid
            if (v.length < 3) throw "Too short!";
            return v;
        }
    },
    enabled: {
        name: "Enabled",
        value: true,
        processor: GM_config_builtin_processors.boolean // You can use builtin processors
    },
    price: {
        name: "Price",
        value: 10,
        processor: GM_config_builtin_processors.integer(0, 100) // Some builtin processors accept arguments
    },
    foo: {
        name: "Foo",
        value: "bar"
        // You may omit processor if you don't need to validate or process user inputs
    }
}

let config = GM_config(config_desc); // *Register menu commands*
console.log(config.price); // *Start using config as you wish 🎉*
window.addEventListener(GM_config_event, (e) => { // *Listen to config changes*
    console.log(config, e.detail);
});
```

## 📦 Built-in processors

|Name|Accept|Argument|Example|
|-|-|-|-|
|`boolean`|`true` or `false`|None|`GM_config_builtin_processors.boolean`|
|`integer`|Any integer in range [`min`, `max`]|`min`, `max` (`undefined` infers as no limit)|`GM_config_builtin_processors.integer(1, undefined)` (Any positive integer)|
|`values`|Any value in given array `accepted`|`accepted`|`GM_config_builtin_processors.values(["a", "b", "c"])` (Accepts "a", "b" or "c")|

## 👀 Working example

Install below code as a script, and see how does it work:

```javascript
// ==UserScript==
// @name         Test Config
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  This is an example to demostrate the usage of greasyfork.org/scripts/470224.
// @author       PRO
// @match        https://greasyfork.org/*
// @icon         https://greasyfork.org/vite/assets/blacklogo16-bc64b9f7.png
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @require      https://greasyfork.org/scripts/470224-tampermonkey-config/code/Tampermonkey%20Config.js
// @license      gpl-3.0
// ==/UserScript==

(function() {
    'use strict';
    let config_desc = { // Config description
        password: {
            name: "Password", // Display name
            value: "tmp", // Default value
            processor: (v) => { // Process user inputs, throw error if invalid
                if (v.length < 3) throw "Too short!";
                return v;
            }
        },
        enabled: {
            name: "Enabled",
            value: true,
            processor: GM_config_builtin_processors.boolean // You can use builtin processors
        },
        val: {
            name: "Float",
            value: 11.4,
            processor: parseFloat
        }
    }
    let config = GM_config(config_desc); // Register menu commands
    window.addEventListener(GM_config_event, (e) => { // Listen to config changes
        console.log(config, e.detail);
    });
    window.setTimeout(() => { // Change config values, and menu commands will be updated automatically
        config.val += 1;
    }, 2000);
})();
```

## ⚠️ Note

- This project is in early development.