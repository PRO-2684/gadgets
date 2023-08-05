# `GM_config`

[![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

## 🪄 功能

简易的 Tampermonkey 脚本配置库。 ([Greasy Fork](https://greasyfork.org/scripts/470224)) ([GitHub](https://github.com/PRO-2684/gadgets/tree/main/GM_config))

## 🎉 特性

- 配置修改后**自动更新菜单**（无论由用户或脚本修改）
- 支持**监听配置获取/修改事件**
- 自动/手动注册菜单
- **自定义**程度高
    - 自定义配置输入方式 (`prop.input`)
    - 自定义输入数据处理方式 (`prop.processor`)
    - 自定义菜单项展现方式 (`prop.formatter`)
- **按需**重新注册菜单项，提高性能
- 自动删除与默认值相同的用户配置，降低存储开销

## 🤔 权限

这个库需要以下权限:

```javascript
// @grant        GM_setValue // 保存配置
// @grant        GM_getValue // 获取配置
// @grant        GM_deleteValue // 自动删除配置 (可选，给予后库会自动删除与默认值相同的用户配置)
// @grant        GM_registerMenuCommand // 注册菜单
// @grant        GM_unregisterMenuCommand // 更新菜单
```

若你复制粘贴了上述代码，记得**删去注释**，否则可能报错。若有，你需要删去 `@grant none`。如果你代码内使用了 `window` 对象，你可能需要 `@grant unsafeWindow` 然后 `let window = unsafeWindow`。

## 📖 使用

### 配置描述

使用这个库的第一步是创建一个配置描述。配置描述是一个字典，它的每个属性都是一个配置项的 id。每个配置项都是具有以下各个属性的字典：（`*` 表示必须提供，没有则可选）

#### 常用组合

```javascript
let config_desc = {
    // 开关
    enabled: {
        "name": "Enabled",
        "value": true,
        "input": "current",
        "processor": "not",
        "formatter": "boolean"
    },
    // 整数
    value: {
        "name": "Value",
        "value": -10,
        "processor": "int"
        // 省略的默认值：input="prompt", formatter="default"
    },
    // 自然数
    price: {
        "name": "Price",
        "value": 114,
        "processor": "int_range-1-",
    },
    // 浮点数以及正数基本一致，分别为 `float` 和 `float_range-0-`
    // 字符串
    name: {
        "name": "Name",
        "value": "Crazy Thur."
        // 省略的默认值：input="prompt", processor="same", formatter="default"
    },
}
```

#### `prop.name` *

配置项的显示名称。必须提供一个字符串。

#### `prop.value` *

配置项的默认值。可以是任意值。你需要考虑其合法性，因为此库不会验证默认值的合法性。

#### `prop.input`

> `(prop, orig) => input`

配置项的输入方式。可以提供一个字符串（内置输入方式），也可以是一个自定义函数（当菜单项被点击时触发）。它**接受配置项的名称和当前值，返回用户输入值**。若不提供输入方式，将默认使用 `prompt` 输入方式，即弹出对话框询问输入。注意，“用户输入值”也可以实际上并非由用户输入，而是由脚本提供的。例如内置输入方式 `current`。

内置输入方式：

- `prompt`：弹出对话框询问输入（默认）
- `current`：使用当前值作为输入（常与 `prop.processor=not` 配合使用，用于开关；或与自定义的 `processor` 配合使用，构成生成器）

#### `prop.processor`

> `(input) => stored`

配置项的输入值处理器。可以提供一个字符串（内置处理器），也可以是一个自定义函数。它**接受用户输入的值，返回处理后的值**。若用户输入的值不合法，处理器应该**抛出错误**。若不提供处理器，将默认使用 `same` 处理器，即直接返回用户输入。常见的使用情况是将用户输入的字符串转换为整数或者浮点数。

内置处理器：

- `same`：直接返回用户输入的字符串（默认）
- `not`：取反（常与 `prop.input=current` 配合使用，用于开关）
- `int`：转换为整数
- `int_range-<min>-<max>`：转换为整数，且限制在 `[<min>, <max>]` 范围内
    - 不建议省略 `-`，否则可能出错
    - `<min>` 和 `<max>` 可以是任意整数，若不提供则视为此端无限制
- `float`：转换为浮点数
- `float_range-<min>-<max>`：转换为浮点数，且限制在 `[<min>, <max>]` 范围内
    - 不建议省略 `-`，否则可能出错
    - `<min>` 和 `<max>` 可以是任意浮点数，若不提供则视为此端无限制

#### `prop.formatter`

> `(name, value) => string`

配置项在菜单的展现方式。展现方式可以是一个字符串（内置展现方式），也可以是一个自定义函数。它**接受配置项的名称和当前值，返回菜单项的显示文本**。若不提供展现方式，将默认使用 `default` 展现方式，即 `name: value` 的形式。

内置展现方式：

- `default`：`name: value` 的形式（默认）
- `boolean`：针对布尔值的展现方式。`true` 显示为 `name: ✔`，`false` 显示为 `name: ✘`

### 注册配置菜单

当你创建了一个配置描述后，你需要将它注册为一个配置菜单。你可以使用 `GM_config` 函数来注册配置菜单。它接受两个参数：

- `config_desc`：配置描述
- `menu`：是否自动显示菜单
    - 若为 `true`，则会自动显示菜单（默认）
    - 若为 `false`，需要用户点击 `Show configuration` 后才会显示配置菜单

```javascript
let config = GM_config(config_desc, false); // *注册配置菜单*
console.log(config.price); // *可以开始使用了 🎉*
```

### 查询/修改配置

当你注册了一个配置菜单后，你就可以使用 `GM_config` 返回的对象来查询/修改配置了。例如：

```javascript
console.log(config.price); // *查询配置*
config.price = 100; // *修改配置* (菜单项会自动更新)
```

### 监听配置的查询/修改

这个库提供了一个 `GM_config_event` 字符串，它的值表示配置项被查询/修改时会触发的事件。你可以使用 `window.addEventListener` 来监听这个事件。它的 `detail` 属性是一个对象，包含了配置变更的详情。例如：

```javascript
window.addEventListener(GM_config_event, (e) => { // *监听配置查询/修改*
    console.log(config, e.detail);
});
```

`e.detail` 对象的属性如下：

- `prop`：被查询/修改的配置项的 id
- `type`：变更类型，可能的值有：
    - `get`：查询配置
    - `set`：修改配置
- `before`：变更前的值
- `after`：变更后的值

这个功能常用于在配置变化时实时更新脚本的功能。在库内部，自动更新菜单项的功能就是通过监听这个事件来实现的。

### 总结：修改配置项过程

1. 用户点击菜单项
2. 将 `prop.name` 和当前值作为参数传入 `prop.input`，获取用户输入值
3. 将用户输入值作为参数传入 `prop.processor`，获取处理后的值
4. 保存处理后的值
5. 发出对应 `detail` 的 `GM_config_event` 事件
6. 更新菜单项（被 `GM_config_event` 事件触发）

## 👀 完整的例子

将以下测试代码安装为脚本，观察它是如何工作的：

```javascript
// ==UserScript==
// @name         Test Config
// @namespace    http://tampermonkey.net/
// @version      0.3
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
            input: "prompt", // How to get user input (Invoked when user clicks the menu command)
            // Built-in values:
            // "current": Current value will be passed to `processor` as user input (generator-like)
            // "prompt": Use `prompt` to get user input (default value)
            // <function>: Custom function to get user input, should return certain value to be processed by `processor`
            //     (prop, orig) => input
            processor: (v) => {
                if (v.length < 3) throw "Too short!";
                return v;
            }
        },
        enabled: {
            name: "Enabled",
            value: true,
            input: "current",
            processor: "not", // Process user inputs, throw error if invalid
            // Built-in processors:
            // "same": Return user input directly (default value)
            // "not": Invert boolean value
            // "int": Convert to integer
            // "int_range-min-max": Convert to integer in range [min, max], raise error if invalid ("" for no limit)
            // "float": Convert to float
            // "float_range-min-max": Convert to float in range [min, max], raise error if invalid ("" for no limit)
            // <function>: Custom function to process value
            //     (input) => stored
            formatter: "boolean", // Format value to be displayed in menu command
            // Built-in formatters:
            // "default": `${name}: ${value}`
            // "boolean": `${name}: ${value ? "✔" : "✘"}`
            // <function>: Custom function to format value
            //     (name, value) => string
        },
        val: {
            name: "Float",
            value: 11.4,
            processor: "float_range-0-" // Convert to float in range [0, +∞)
        }
    }
    let config = GM_config(config_desc, false); // Register menu commands
    window.addEventListener(GM_config_event, (e) => { // Listen to config changes
        console.log(e.detail);
    });
    window.setTimeout(() => { // Change config values, and menu commands will be updated automatically
        config.val += 1; // Remember to validate the value before setting it
    }, 5000);
})();
```

## ⚠️ 注意

- 这个项目正处于早期发展阶段