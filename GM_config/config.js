// ==UserScript==
// @name         Tampermonkey Config
// @name:zh-CN   Tampermonkey 配置
// @license      gpl-3.0
// @namespace    http://tampermonkey.net/
// @version      0.2.3
// @description  Simple Tampermonkey script config library
// @description:zh-CN  简易的 Tampermonkey 脚本配置库
// @author       PRO
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

let _GM_config_wrapper = {
    get: function (target, name) {
        // Return stored value, if any
        let value = GM_getValue(name);
        if (value !== undefined) {
            return value;
        }
        // Return default value
        return target[name].value;
    }
    , set: function (target, name, value) {
        let processor = target[name].processor;
        if (processor)
            value = target[name].processor(value);
        // Store value
        GM_setValue(name, value);
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
        let val = config[k];
        let id = GM_registerMenuCommand(`${name}: ${val}`, function () {
            let new_value = prompt(`🤔 New value for ${name}:`, val);
            if (new_value !== null) {
                try {
                    config[k] = new_value;
                } catch (error) {
                    alert(`⚠️ ${error}`);
                }
                _GM_config_register(desc, config);
                // console.log(`Set ${k} to ${new_value}`); // DEBUG
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
