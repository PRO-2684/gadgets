// ==UserScript==
// @name         Tampermonkey Config
// @name:zh-CN   Tampermonkey 配置
// @license      gpl-3.0
// @namespace    http://tampermonkey.net/
// @version      0.3.0
// @description  Simple Tampermonkey script config library
// @description:zh-CN  简易的 Tampermonkey 脚本配置库
// @author       PRO
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

let GM_config_event = `GM_config_${Math.random().toString(36).slice(2)}`;
function _GM_config_get(config_desc, prop) {
    return GM_getValue(prop) || config_desc[prop].value;
}
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
    , set: function (target, prop, value) {
        let orig = _GM_config_get(target, prop); // Original value
        let processor = target[prop].processor;
        if (processor)
            value = target[prop].processor(value); // New value
        // Store value
        GM_setValue(prop, value);
        // Dispatch set event
        let event = new CustomEvent(GM_config_event, {
            detail: {
                type: "set",
                prop: prop,
                before: orig,
                after: value
            }
        });
        window.dispatchEvent(event);
        return true;
    }
};

let _GM_config_menu_ids = [];

function _GM_config_register(desc, config) {
    // Unregister old menu commands
    let id;
    while (id = _GM_config_menu_ids.pop()) GM_unregisterMenuCommand(id);
    for (let k in desc) {
        // console.log(k, v); // DEBUG
        let name = desc[k].name;
        let val = _GM_config_get(desc, k);
        let id = GM_registerMenuCommand(`${name}: ${val}`, function () {
            let new_value = prompt(`🤔 New value for ${name}:`, val);
            if (new_value !== null) {
                try {
                    config[k] = new_value;
                } catch (error) {
                    alert(`⚠️ ${error}`);
                }
            }
        });
        _GM_config_menu_ids.push(id);
    }
};

function GM_config(desc) { // Register menu commands based on given config description
    // Get proxied config
    let config = new Proxy(desc, _GM_config_wrapper);
    // Register menu commands
    _GM_config_register(desc, config);
    window.addEventListener(GM_config_event, (e) => { // Auto update menu commands
        if (e.detail.type === "set") {
            // console.log(`🔧 ${e.detail.prop} changed from ${e.detail.before} to ${e.detail.after}`); // DEBUG
            _GM_config_register(desc, config);
        };
    });
    // Return proxied config
    return config;
};

let GM_config_builtin_processors = {
    boolean: (v) => {
        switch (v) {
            case "true":
                return true;
            case "false":
                return false;
            default:
                throw `Invalid value: ${v}, expected "true" or "false"!`;
        }
    },
    integer: (min, max) => (v) => {
        v = parseInt(v);
        if (isNaN(v)) throw `Invalid value, expected integer!`;
        if ((min !== undefined && v < min) || (max !== undefined && v > max)) throw `Out of range: ${v}, expected [${min}, ${max}]!`;
        return v;
    },
    values: (accepted) => (v) => {
        if (!accepted.includes(v)) throw `Invalid value: ${v}, expected one of ${accepted}!`;
        return v;
    }
};
