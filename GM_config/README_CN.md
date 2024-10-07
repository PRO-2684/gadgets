# `GM_config`

[![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

## 🪄 功能

简易的 Tampermonkey 脚本配置库。 ([Greasy Fork](https://greasyfork.org/scripts/470224)) ([GitHub](https://github.com/PRO-2684/gadgets/tree/main/GM_config))

## 🎉 特性

- 配置修改后**自动更新菜单**（无论由用户或脚本修改）
- 支持**监听配置获取/修改事件**
- 支持**多标签页同步**
- 支持**文件夹**（嵌套配置项）
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

使用这个库的第一步是创建一个配置描述。配置描述是一个字典，它的每个属性 (除了可能的 `$default` 外) 都是一个配置项的 id。需要注意的是，不允许 `.` 出现在配置项的 id 中。

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

- `str`：字符串
- `bool`：布尔值
- `int`：整数
- `float`：浮点数
- `action`：点击时调用函数
    - 你不应该覆盖此类型的 `prop.input` 和 `prop.processor` 属性
    - 为实现回调，请使用 `config.addEventListener` 监听此属性的 `get` 事件
- `folder`：一个含有其它配置项的文件夹
    - 你需要覆盖 `prop.items` 来在文件夹下创建配置项，其格式与顶层配置描述 `configDesc` 相同
    - 你可以在文件夹内使用 `$default`
    - 你可以随你喜欢嵌套任意多的文件夹
    - 通过句点访问嵌套的配置项，例如：
        - `config.get("folder1.folder2.item")`
        - `config.proxy["folder1.folder2.item"]`
        - `config.proxy.folder1.folder2.item`
        - `config.proxy["folder1.folder2"].item`

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
- `action`：派发 `get` 事件，返回原值（内部用于 `action` 类型）
- `folder`：进入由配置项 id 指定的文件夹。在此之后，派发 `get` 事件，返回原值（内部用于 `folder` 类型）

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
- `name_only`: 仅显示名称，不显示值（内部用于 `action` 类型）
- `folder`: 使用 `options.folderDisplay.prefix` 和 `options.folderDisplay.suffix` 包裹名称（内部用于 `folder` 类型）

#### 其它 Tampermonkey 提供的属性

支持 `prop.accessKey`, `prop.autoClose`, `prop.title` (要求 TM >=4.20.0)。如果提供的是一个函数，那么它将被调用，传入参数为 `name` 和 `value`，返回的字符串将被传递给 Tampermonkey。详细信息请参考 [Tampermonkey 文档](https://www.tampermonkey.net/documentation.php#api:GM_registerMenuCommand)。

#### 优先级

属性的优先级如下（从高到低）：

1. 你为配置项明确设置的属性
2. `type` 隐含的属性
3. 你为此文件夹的 `$default` 设置的属性
4. 计算后父文件夹的 `$default`
5. `$default` 的默认值

### 注册配置菜单

当你创建了一个配置描述后，你可以使用 `GM_config` 构造函数来将其注册为配置菜单。它接受如下两个参数：

- `configDesc`：配置描述
- `options`：选项（可选）
    - `immediate`：是否立即注册菜单
        - 若为 `true`，则会立即注册菜单（默认）
        - 若为 `false`，需要用户点击 `Show configuration` 后才会注册配置菜单
    - `debug`：是否开启调试模式。若为 `true`，会输出调试信息。默认为 `false`。（随时可以通过 `config.debug` 来修改）
    - `folderDisplay`：控制 `folder` 类型的展现方式
        - `prefix`：文件夹名称前缀，默认为空字符串
        - `suffix`：文件夹名称后缀，默认为 ` >`
        - `parentText`：父文件夹的文本，默认为 `< Back`
        - `parentTitle`：父文件夹的标题，默认为 `Return to parent folder`

```javascript
const config = new GM_config(configDesc, { immediate: false }); // *注册配置菜单*
console.log(config.get("price")); // *可以开始使用了 🎉*
```

### 查询/修改/枚举配置

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

如果你想要枚举给定文件夹下的配置项，可以使用 `config.list(folder)`。例如：

```javascript
console.log(config.list("someFolder.folder")); // *枚举 someFolder.folder 下的配置项*
```

由于 `config.proxy` 是可枚举并且深度代理的，你可以使用 `for` 或者 `Object.keys` 来枚举配置项。例如：

```javascript
for (const [name, value] of Object.entries(config.proxy.someFolder.folder)) {
    console.log(name, value);
}
console.log(Object.keys(config.proxy.someFolder.folder));
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

- `prop`：被查询/修改的配置项的 id。
- `before`：变更前的值。
- `after`：变更后的值。
- `remote`：表名此修改是否由其它脚本实例造成的，`get` 事件中此属性总为 `false` (无法检测其它脚本实例获取配置)。

这个功能常用于在配置变化时实时更新脚本的功能。在库内部，自动更新菜单项的功能就是通过这个功能来实现的。

### 总结：修改配置项过程

1. 用户点击菜单项
2. 将 `prop.name` 和当前值作为参数传入 `prop.input`，获取用户输入值
3. 将用户输入值作为参数传入 `prop.processor`，获取处理后的值
4. 保存处理后的值
5. 发出对应 `detail` 的事件
6. 更新菜单项（被上述事件触发）

## 👀 完整的例子

安装 [此测试代码](https://github.com/PRO-2684/gadgets/raw/refs/heads/main/GM_config/test_config.user.js)，观察它是如何工作的；或者，你也可以安装 [Greasy Fork Enhance](https://greasyfork.org/scripts/467078) 来体验这个库的功能。

## ⚠️ 注意

这个项目正处于早期发展阶段，接口可能会发生变化。如果你有建议或者在使用过程中遇到了问题，欢迎提出 issue 或者 PR。
