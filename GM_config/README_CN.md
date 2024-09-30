# `GM_config`

[![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

## 🪄 功能

简易的 Tampermonkey 脚本配置库。 ([Greasy Fork](https://greasyfork.org/scripts/470224)) ([GitHub](https://github.com/PRO-2684/gadgets/tree/main/GM_config))

## 🎉 特性

- 配置修改后**自动更新菜单**（无论由用户或脚本修改）
- 支持**监听配置获取/修改事件**
- 支持**多标签页同步**
- 自动/手动注册菜单
- **自定义**程度高
    - 自定义配置输入方式 (`prop.input`)
    - 自定义输入数据处理方式 (`prop.processor`)
    - 自定义菜单项展现方式 (`prop.formatter`)
- 自动删除与默认值相同的用户配置，降低存储开销

## 🤔 权限

这个库需要以下权限:

```javascript
// @grant        GM_setValue // 保存配置
// @grant        GM_getValue // 获取配置
// @grant        GM_deleteValue // 自动删除配置 (可选，给予后库会自动删除与默认值相同的用户配置)
// @grant        GM_registerMenuCommand // 注册菜单
// @grant        GM_unregisterMenuCommand // 更新菜单
// @grant        GM_addValueChangeListener // 监听配置变化
```

若你复制粘贴了上述代码，记得**删去注释**，否则可能报错。若有，你需要删去 `@grant none`。如果你代码内使用了 `window` 对象，你可能需要 `@grant unsafeWindow` 然后 `let window = unsafeWindow`。

## 📖 使用

### 确认版本

```javascript
console.log(GM_config.version); // *输出版本*
```

### 配置描述

使用这个库的第一步是创建一个配置描述。配置描述是一个字典，它的每个属性 (除了可能的 `$default` 外) 都是一个配置项的 id。

#### `$default`

通过使用 `$default`，你可以方便地创建大量相同类型的配置项。若未在配置描述中提供 `$default`，则会对配置项中未指定的属性使用如下值：

```javascript
{ // 优先级：最低
    input: "prompt",
    processor: "same",
    formatter: "normal"
}
```

若你想要修改默认值，你可以在配置描述中提供 `$default` 从而覆盖上述默认值。例如：

```javascript
const configDesc = {
    "$default": { // 优先级：低
        value: true,
        input: "current",
        processor: "not",
        formatter: "boolean"
    },
    switch_true: {
        name: "Switch true"
    },
    switch_false: {
        name: "Switch false",
        value: false // 优先级：最高
    }
}
```

但是，通常来说，后续提到的 `prop.type` 才是用于创建相似配置项的最佳选择，而 `$default` 只被用于将 `autoClose` 设置为 `false`：

```javascript
const configDesc = {
    "$default": {
        autoClose: false
    },
    // ...
}
```

#### `prop.type`

配置项的类型，用于快速设置常见的属性集。当前支持的类型有：

```javascript
static #builtin_types = {
    str: { // 字符串
        value: "",
        input: "prompt",
        processor: "same",
        formatter: "normal",
    },
    bool: { // 布尔值
        value: false,
        input: "current",
        processor: "not",
        formatter: "boolean",
    },
    int: { // 整数
        value: 0,
        input: "prompt",
        processor: "int",
        formatter: "normal",
    },
    float: { // 浮点数
        value: 0.0,
        input: "prompt",
        processor: "float",
        formatter: "normal",
    },
    action: { // 动作
        value: null,
        input: () => null, // 使用你的函数覆盖此值，记得返回 `null`
        processor: "same",
        formatter: (name) => name,
        autoClose: true,
    }
};
```

你可以像这样使用它们：

```javascript
const configDesc = {
    switch_true: {
        name: "Switch true",
        type: "bool" // 优先级：高
    },
    switch_false: {
        name: "Switch false",
        type: "bool", // 优先级：高
        value: false // 优先级：最高
    }
}
```

#### `prop.name`

配置项的显示名称。必须提供一个字符串。

#### `prop.value`

配置项的默认值，可以是任意值。你需要考虑其合法性，因为此库不会验证默认值的合法性。

#### `prop.input`

> `(prop, orig) => input`

配置项的输入方式。可以提供一个字符串（内置输入方式），也可以是一个自定义函数（当菜单项被点击时触发）。它**接受配置项的名称和当前值，返回用户输入值**。若 `prop.input` 和 `$default.input` 均未指定，将使用 `prompt`，即弹出对话框询问输入。注意，“用户输入值”也可以实际上并非由用户输入，而是由脚本提供的。例如内置输入方式 `current`。

内置输入方式：

- `prompt`：弹出对话框询问输入（默认）
- `current`：使用当前值作为输入（常与 `prop.processor=not` 配合使用，用于开关；或与自定义的 `processor` 配合使用，构成生成器）

#### `prop.processor`

> `(input) => stored`

配置项的输入值处理器。可以提供一个字符串（内置处理器），也可以是一个自定义函数。它**接受用户输入的值，返回处理后的值**。若用户输入的值不合法，处理器应该**抛出错误**。若 `prop.processor` 和 `$default.processor` 均未指定，将默认使用 `same` 处理器，即直接返回用户输入。常见的使用情况是将用户输入的字符串转换为整数或者浮点数。

内置处理器：

- `same`：直接返回用户输入的字符串
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

配置项在菜单的展现方式。展现方式可以是一个字符串（内置展现方式），也可以是一个自定义函数。它**接受配置项的名称和当前值，返回菜单项的显示文本**。若 `prop.formatter` 和 `$default.formatter` 均未指定，则使用 `normal` 展现方式。

内置展现方式：

- `normal`：`name: value` 的形式
- `boolean`：针对布尔值的展现方式。`true` 显示为 `name: ✔`，`false` 显示为 `name: ✘`

#### 其它 Tampermonkey 提供的属性

支持 `prop.accessKey`, `prop.autoClose`, `prop.title` (要求 TM >=4.20.0)。详细信息请参考 [Tampermonkey 文档](https://www.tampermonkey.net/documentation.php#api:GM_registerMenuCommand)。

#### 优先级

属性的优先级如下（从高到低）：

1. 你为配置项明确设置的属性
2. `type` 隐含的属性
3. 你为 `$default` 设置的属性
4. `$default` 的默认值

### 注册配置菜单

当你创建了一个配置描述后，你可以使用 `GM_config` 构造函数来将其注册为配置菜单。它接受如下两个参数：

- `configDesc`：配置描述
- `options`：选项（可选）
    - `immediate`：是否立即注册菜单
        - 若为 `true`，则会立即注册菜单（默认）
        - 若为 `false`，需要用户点击 `Show configuration` 后才会注册配置菜单
    - `debug`：是否开启调试模式。若为 `true`，会输出调试信息。默认为 `false`。（随时可以通过 `config.debug` 来修改）

```javascript
const config = new GM_config(configDesc, { immediate: false }); // *注册配置菜单*
console.log(config.get("price")); // *可以开始使用了 🎉*
```

### 查询/修改配置

当你注册了一个配置菜单后，你就可以使用 `GM_config` 返回的对象来查询/修改配置了。例如：

```javascript
console.log(config.get("price")); // *查询配置*
config.set("price", 100); // *修改配置* (菜单项会自动更新)
```

或者，你也可以通过 `config.proxy` 来查询/修改配置。例如：

```javascript
console.log(config.proxy.price); // *查询配置*
config.proxy.price = 100; // *修改配置* (菜单项会自动更新)
```

### 监听配置的查询/修改

你可以通过调用 `config.addEventListener(type, listener, options?)` 来监听配置的查询/修改：

```javascript
config.addEventListener("set", (e) => {
    console.log(e.detail); // *配置被修改*
});
config.addEventListener("get", (e) => {
    console.log(e.detail); // *配置被查询*
});
```

需要注意的是，`get` 事件仅在当前窗口的脚本获取配置时触发，而 `set` 事件会在所有窗口的脚本修改配置时触发。`set` 的这一特性使得多标签页同步成为可能。

正如你所想，你可以通过 `config.removeEventListener(type, listener, options?)` 来移除监听器。这两个接口与 [`EventTarget.addEventListener`](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener) 和 [`EventTarget.removeEventListener`](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/removeEventListener) 的用法完全一致。

`e.detail` 对象的属性如下：

- `prop`：被查询/修改的配置项的 id
- `before`：变更前的值
- `after`：变更后的值
- `remote`：表名此修改是否由其它标签页的脚本示例造成的，`get` 事件中此属性总为 `false`

这个功能常用于在配置变化时实时更新脚本的功能。在库内部，自动更新菜单项的功能就是通过这个功能来实现的。

### 总结：修改配置项过程

1. 用户点击菜单项
2. 将 `prop.name` 和当前值作为参数传入 `prop.input`，获取用户输入值
3. 将用户输入值作为参数传入 `prop.processor`，获取处理后的值
4. 保存处理后的值
5. 发出对应 `detail` 的事件
6. 更新菜单项（被上述事件触发）

## 👀 完整的例子

将以下测试代码安装为脚本，观察它是如何工作的：

```javascript
// ==UserScript==
// @name         Test Config
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  This is an example to demostrate the usage of greasyfork.org/scripts/470224.
// @author       PRO
// @match        https://greasyfork.org/*
// @icon         https://greasyfork.org/vite/assets/blacklogo16-bc64b9f7.png
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://update.greasyfork.org/scripts/470224/1448594/Tampermonkey%20Config.js
// @license      gpl-3.0
// ==/UserScript==

(function() {
    'use strict';
    const configDesc = { // Config description
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
            // "normal": `${name}: ${value}`
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
    const config = new GM_config(configDesc, { immediate: false, debug: true }); // Register menu commands
    config.addEventListener("set", (e) => { // Listen to config changes
        console.log(e.detail);
    });
    window.setTimeout(() => { // Change config values, and menu commands will be updated automatically
        config.proxy.val += 1; // Remember to validate the value before setting it
    }, 5000);
})();
```

或者，你也可以安装这个脚本来体验这个库的功能：[Greasy Fork Enhance](https://greasyfork.org/scripts/467078)

## ⚠️ 注意

这个项目正处于早期发展阶段，接口可能会发生变化。如果你有建议或者在使用过程中遇到了问题，欢迎提出 issue 或者 PR。
