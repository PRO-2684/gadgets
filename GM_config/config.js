// ==UserScript==
// @name         Tampermonkey Config
// @name:zh-CN   Tampermonkey 配置
// @license      gpl-3.0
// @namespace    http://tampermonkey.net/
// @version      0.4.0
// @description  Simple Tampermonkey script config library
// @description:zh-CN  简易的 Tampermonkey 脚本配置库
// @author       PRO
// @match        *
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

let debug = (...args) => console.debug("[Tampermonkey Config]", ...args);
let GM_config_event = `GM_config_${Math.random().toString(36).slice(2)}`;
function _GM_config_get(config_desc, prop) {
    let value = GM_getValue(prop, undefined);
    if (value !== undefined) {
        return value;
    } else {
        return config_desc[prop].value;
    }
}

let _GM_config_builtin_processors = {
    same: (v) => v,
    not: (v) => !v,
    int: (s) => {
        let value = parseInt(s);
        if (isNaN(value)) throw `Invalid value: ${s}, expected integer!`;
    },
    int_range: (s, min_s, max_s) => {
        let value = parseInt(s);
        if (isNaN(value)) throw `Invalid value: ${s}, expected integer!`;
        let min = (min_s === "") ? -Infinity : parseInt(min_s);
        let max = (max_s === "") ? +Infinity : parseInt(max_s);
        if (min !== NaN && value < min) throw `Invalid value: ${s}, expected integer >= ${min}!`;
        if (max !== NaN && value > max) throw `Invalid value: ${s}, expected integer <= ${max}!`;
        return value;
    },
    float: (s) => {
        let value = parseFloat(s);
        if (isNaN(value)) throw `Invalid value: ${s}, expected float!`;
    },
    float_range: (s, min_s, max_s) => {
        let value = parseFloat(s);
        if (isNaN(value)) throw `Invalid value: ${s}, expected float!`;
        let min = (min_s === "") ? -Infinity : parseFloat(min_s);
        let max = (max_s === "") ? +Infinity : parseFloat(max_s);
        if (min !== NaN && value < min) throw `Invalid value: ${s}, expected float >= ${min}!`;
        if (max !== NaN && value > max) throw `Invalid value: ${s}, expected float <= ${max}!`;
        return value;
    },
};
let _GM_config_builtin_formatters = {
    default: (name, value) => `${name}: ${value}`,
    boolean: (name, value) => `${name}: ${value ? "✔" : "✘"}`,
};
let _GM_config_wrapper = {
    get: function (target, prop) {
        // Return stored value, else default value
        let value = _GM_config_get(target, prop);
        // Dispatch get event
        let event = new CustomEvent(GM_config_event, {
            detail: {
                type: "get",
                prop: prop,
                before: value,
                after: value
            }
        });
        window.dispatchEvent(event);
        return value;
    }
    , set: function (desc, prop, value) {
        // Dispatch set event
        let event = new CustomEvent(GM_config_event, {
            detail: {
                type: "set",
                prop: prop,
                before: _GM_config_get(desc, prop),
                after: value
            }
        });
        // Store value
        GM_setValue(prop, value);
        window.dispatchEvent(event);
        return true;
    }
};

let _GM_config_menu_ids = [];
function _GM_config_register(desc, config) {
    let _GM_config_builtin_inputs = {
        current: (prop, orig) => { return orig },
        prompt: (prop, orig) => {
            let s = prompt(`🤔 New value for ${desc[prop].name}:`, orig);
            if (s === null) return orig;
            return s;
        },
    };
    // Unregister old menu commands
    let id;
    while (id = _GM_config_menu_ids.pop()) GM_unregisterMenuCommand(id);
    for (let prop in desc) {
        let name = desc[prop].name;
        let orig = _GM_config_get(desc, prop);
        let input = desc[prop].input || "prompt";
        let input_func = typeof input === "function" ? input : _GM_config_builtin_inputs[input];
        let formatter = desc[prop].formatter || "default";
        let formatter_func = typeof formatter === "function" ? formatter : _GM_config_builtin_formatters[formatter];
        let id = GM_registerMenuCommand(formatter_func(name, orig), function () {
            let value;
            try {
                value = input_func(prop, orig);
                let processor = desc[prop].processor || "same";
                if (typeof processor === "function") { // Process user input
                    value = processor(value);
                } else if (typeof processor === "string") {
                    let parts = processor.split("-");
                    let processor_func = _GM_config_builtin_processors[parts[0]];
                    if (processor_func !== undefined) // Process user input
                        value = processor_func(value, ...parts.slice(1));
                    else // Unknown processor
                        throw `Unknown processor: ${processor}`;
                } else {
                    throw `Unknown processor format: ${typeof processor}`;
                }
            } catch (error) {
                alert("⚠️ "+error);
                return;
            }
            if (value !== orig) {
                config[prop] = value;
            }
        });
        _GM_config_menu_ids.push(id);
    }
};

function GM_config(desc, menu=true) { // Register menu commands based on given config description
    // Get proxied config
    let config = new Proxy(desc, _GM_config_wrapper);
    // Register menu commands
    if (menu) {
        _GM_config_register(desc, config);
    } else {
        // Register menu commands after user clicks "Show configuration"
        let id = GM_registerMenuCommand("Show configuration", function () {
            // GM_unregisterMenuCommand(id);
            _GM_config_register(desc, config);
        });
        _GM_config_menu_ids.push(id);
    }
    window.addEventListener(GM_config_event, (e) => { // Auto update menu commands
        if (e.detail.type === "set" && e.detail.before !== e.detail.after) {
            debug(`🔧 "${e.detail.prop}" changed from ${e.detail.before} to ${e.detail.after}`); // DEBUG
            _GM_config_register(desc, config);
        } else if (e.detail.type === "get") {
            debug(`🔍 "${e.detail.prop}" requested, value is ${e.detail.after}`); // DEBUG
        }
    });
    // Return proxied config
    return config;
};
