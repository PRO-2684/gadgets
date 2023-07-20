# `GM_config`
## 🪄 功能

简易的 Tampermonkey 脚本配置库。 ([Greasy Fork](https://greasyfork.org/scripts/470224))

## 🤔 权限

这个库需要以下权限:

```javascript
// @grant        GM_setValue // 保存配置
// @grant        GM_getValue // 获取配置
// @grant        GM_registerMenuCommand // 注册菜单
// @grant        GM_unregisterMenuCommand // 更新菜单
```

若你复制粘贴了上述代码，记得**删去注释**，否则可能报错。若有，你需要删去 `@grant none`。如果你代码内使用了 `window` 对象，你可能需要 `@grant unsafeWindow` 然后 `let window = unsafeWindow`。

## 📖 使用

```javascript
let config_desc = { // 配置描述
    password: {
        name: "Password", // 显示名称
        value: "tmp", // 默认值
        processor: (v) => { // 处理用户输入，若不合法则报错
            if (v.length < 3) throw "Too short!";
            return v;
        }
    },
    enabled: {
        name: "Enabled",
        value: true,
        processor: GM_config_builtin_processors.boolean // 你可以使用内置处理器
    },
    price: {
        name: "Price",
        value: 10,
        processor: GM_config_builtin_processors.integer(0, 100) // 部分内置处理器需要参数
    },
    foo: {
        name: "Foo",
        value: "bar"
        // 若你认为不需要验证或处理用户输入，你也可以忽略 processor 项
    }
}

let config = GM_config(config_desc); // 注册菜单命令
console.log(config.price); // 可以开始使用了 🎉
```

## 📦 内置处理器

|名称|接受值|参数|例子|
|-|-|-|-|
|`boolean`|`true` 或 `false`|无|`GM_config_builtin_processors.boolean`|
|`integer`|任意 [`min`, `max`] 区间内的整数|`min`, `max` (`undefined` 认为是没有限制)|`GM_config_builtin_processors.integer(1, undefined)` (任意正整数)|
|`values`|任意数组 `accepted` 内的值|`accepted`|`GM_config_builtin_processors.values(["a", "b", "c"])` (允许 "a", "b" 或 "c")|

## 👀 完整的例子

将以下代码安装为脚本，观察它是如何工作的：

```javascript
// ==UserScript==
// @name         Test Config
// @namespace    http://tampermonkey.net/
// @version      0.1
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
    window.setInterval(()=>{
        if (config.enabled) {
            console.log(config.password);
            console.log(config.val);
        }
    }, 1000);

})();
```

## ⚠️ 注意

- 这个项目正处于早期发展阶段
- 尽量避免在你的脚本里修改配置。若你确实需要这么做，记得调用 `_GM_config_register(config_desc, config);` 以便更新展示的菜单