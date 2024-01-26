// ==UserScript==
// @name         Tampermonkey Config
// @name:zh-CN   Tampermonkey 配置
// @license      gpl-3.0
// @namespace    http://tampermonkey.net/
// @version      0.7.0
// @description  Simple Tampermonkey script config library
// @description:zh-CN  简易的 Tampermonkey 脚本配置库
// @author       PRO
// @match        *
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

// const debug = console.debug.bind(console, "[Tampermonkey Config]"); // Debug function
const debug = () => { };
const GM_config_event = "GM_config_event"; // Compatibility with old versions

function _GM_config_get(config_desc, prop) {
    return GM_getValue(prop, config_desc[prop].value);
}
const _GM_config_builtin_processors = {
    same: (v) => v,
    not: (v) => !v,
    int: (s) => {
        const value = parseInt(s);
        if (isNaN(value)) throw `Invalid value: ${s}, expected integer!`;
        return value;
    },
    int_range: (s, min_s, max_s) => {
        const value = parseInt(s);
        if (isNaN(value)) throw `Invalid value: ${s}, expected integer!`;
        const min = (min_s === "") ? -Infinity : parseInt(min_s);
        const max = (max_s === "") ? +Infinity : parseInt(max_s);
        if (min !== NaN && value < min) throw `Invalid value: ${s}, expected integer >= ${min}!`;
        if (max !== NaN && value > max) throw `Invalid value: ${s}, expected integer <= ${max}!`;
        return value;
    },
    float: (s) => {
        const value = parseFloat(s);
        if (isNaN(value)) throw `Invalid value: ${s}, expected float!`;
        return value;
    },
    float_range: (s, min_s, max_s) => {
        const value = parseFloat(s);
        if (isNaN(value)) throw `Invalid value: ${s}, expected float!`;
        const min = (min_s === "") ? -Infinity : parseFloat(min_s);
        const max = (max_s === "") ? +Infinity : parseFloat(max_s);
        if (min !== NaN && value < min) throw `Invalid value: ${s}, expected float >= ${min}!`;
        if (max !== NaN && value > max) throw `Invalid value: ${s}, expected float <= ${max}!`;
        return value;
    },
};
const _GM_config_builtin_formatters = {
    normal: (name, value) => `${name}: ${value}`,
    boolean: (name, value) => `${name}: ${value ? "✔" : "✘"}`,
};
const _GM_config_wrapper = {
    get: function (desc, prop) {
        // Return stored value, else default value
        const value = _GM_config_get(desc, prop);
        // Dispatch get event
        const event = new CustomEvent(GM_config_event, {
            detail: {
                type: "get",
                prop: prop,
                before: value,
                after: value
            }
        });
        window.top.dispatchEvent(event);
        return value;
    }, set: function (desc, prop, value) {
        // Dispatch set event
        const before = _GM_config_get(desc, prop);
        const event = new CustomEvent(GM_config_event, {
            detail: {
                type: "set",
                prop: prop,
                before: before,
                after: value
            }
        });
        // Store value
        const default_value = desc[prop].value;
        if (value === default_value && typeof GM_deleteValue === "function") {
            GM_deleteValue(prop); // Delete stored value if it's the same as default value
            debug(`🗑️ "${prop}" deleted`);
        } else {
            GM_setValue(prop, value);
        }
        window.top.dispatchEvent(event);
        return true;
    }
};
const _GM_config_registered = {}; // prop => id
// (Re-)register a single menu item, return its id
function _GM_config_register_item(desc, config, inputs, prop) {
    const name = desc[prop].name;
    const orig = _GM_config_get(desc, prop);
    const input = desc[prop].input;
    const input_func = typeof input === "function" ? input : inputs[input];
    const formatter = desc[prop].formatter;
    const formatter_func = typeof formatter === "function" ? formatter : _GM_config_builtin_formatters[formatter];
    const option = {
        accessKey: desc[prop].accessKey,
        autoClose: desc[prop].autoClose,
        title: desc[prop].title,
        id: _GM_config_registered[prop],
    };
    const id = GM_registerMenuCommand(formatter_func(name, orig), function () {
        let value;
        try {
            value = input_func(prop, orig);
            const processor = desc[prop].processor;
            if (typeof processor === "function") { // Process user input
                value = processor(value);
            } else if (typeof processor === "string") {
                const parts = processor.split("-");
                const processor_func = _GM_config_builtin_processors[parts[0]];
                if (processor_func !== undefined) // Process user input
                    value = processor_func(value, ...parts.slice(1));
                else // Unknown processor
                    throw `Unknown processor: ${processor}`;
            } else {
                throw `Unknown processor format: ${typeof processor}`;
            }
        } catch (error) {
            alert("⚠️ " + error);
            return;
        }
        if (value !== orig) {
            config[prop] = value;
        }
    }, option);
    debug(`+ Registered menu command: prop="${prop}", id=${id}, option=`, option);
    return id;
}
// (Re-)register menu items
function _GM_config_register(desc, config, inputs) {
    // Unregister old menu items
    for (const prop in _GM_config_registered) {
        const id = _GM_config_registered[prop];
        GM_unregisterMenuCommand(id);
        delete _GM_config_registered[prop];
        debug(`- Unregistered menu command: prop="${prop}", id=${id}`);
    }
    for (const prop in desc) {
        _GM_config_registered[prop] = _GM_config_register_item(desc, config, inputs, prop);
    }
};

function GM_config(desc, menu = true) { // Register menu items based on given config description
    // Calc true default value
    const $default = Object.assign({
        input: "prompt",
        processor: "same",
        formatter: "normal"
    }, desc["$default"] || {});
    delete desc.$default;
    // Complete desc
    for (const key in desc) {
        desc[key] = Object.assign(Object.assign({}, $default), desc[key]);
    }
    // Get proxied config
    const config = new Proxy(desc, _GM_config_wrapper);
    // Built-in inputs
    const _GM_config_builtin_inputs = {
        current: (prop, orig) => orig,
        prompt: (prop, orig) => {
            const s = prompt(`🤔 New value for ${desc[prop].name}:`, orig);
            return s === null ? orig : s;
        },
    };
    // Register menu items
    if (window === window.top) {
        if (menu) {
            _GM_config_register(desc, config, _GM_config_builtin_inputs);
        } else {
            // Register menu items after user clicks "Show configuration"
            const id = GM_registerMenuCommand("Show configuration", function () {
                _GM_config_register(desc, config, _GM_config_builtin_inputs);
            }, {
                autoClose: false,
                title: "Show configuration options for this script"
            });
            debug(`+ Registered menu command: prop="Show configuration", id=${id}`);
            _GM_config_registered[null] = id;
        }
        window.top.addEventListener(GM_config_event, (e) => { // Auto update menu items
            if (e.detail.type === "set" && e.detail.before !== e.detail.after) {
                debug(`🔧 "${e.detail.prop}" changed from ${e.detail.before} to ${e.detail.after}`);
                _GM_config_register_item(desc, config, _GM_config_builtin_inputs, e.detail.prop);
            } else if (e.detail.type === "get") {
                debug(`🔍 "${e.detail.prop}" requested, value is ${e.detail.after}`);
            }
        });
    }
    // Return proxied config
    return config;
};
