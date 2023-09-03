// ==UserScript==
// @name         Tampermonkey Config
// @name:zh-CN   Tampermonkey 配置
// @license      gpl-3.0
// @namespace    http://tampermonkey.net/
// @version      0.5.3
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
// Adapted from https://stackoverflow.com/a/6832721
// Returns 1 if a > b, -1 if a < b, 0 if a == b
function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');
    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }
    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }
    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }
    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }
    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }
        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }
    if (v1parts.length != v2parts.length) {
        return -1;
    }
    return 0;
}
function supports(minVer) { // Minimum version of Tampermonkey required
    return typeof GM_info === "object" && GM_info.scriptHandler === "Tampermonkey" && versionCompare(GM_info.version, minVer) >= 0;
}
const supportsOption = supports("4.20.0");
debug(`Tampermonkey ${GM_info.version} detected, ${supportsOption ? "supports" : "does not support"} menu command options`);
const registerMenuCommand = supportsOption ? GM_registerMenuCommand : (name, func, option) => GM_registerMenuCommand(name, func, option && option.accessKey);
function _GM_config_get(config_desc, prop) {
    let value = GM_getValue(prop, undefined);
    if (value !== undefined) {
        return value;
    } else {
        return config_desc[prop].value;
    }
}
const _GM_config_builtin_processors = {
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
const _GM_config_builtin_formatters = {
    default: (name, value) => `${name}: ${value}`,
    boolean: (name, value) => `${name}: ${value ? "✔" : "✘"}`,
};
const _GM_config_wrapper = {
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
        window.top.dispatchEvent(event);
        return value;
    }
    , set: function (desc, prop, value) {
        // Dispatch set event
        let before = _GM_config_get(desc, prop);
        let event = new CustomEvent(GM_config_event, {
            detail: {
                type: "set",
                prop: prop,
                before: before,
                after: value
            }
        });
        // Store value
        let default_value = desc[prop].value;
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

let _GM_config_registered = []; // Items: [id, prop]
// (Re-)register menu items on demand
function _GM_config_register(desc, config, until = undefined) {
    // `until` is the first property to be re-registered
    // If `until` is undefined, all properties will be re-registered
    let _GM_config_builtin_inputs = {
        current: (prop, orig) => { return orig },
        prompt: (prop, orig) => {
            let s = prompt(`🤔 New value for ${desc[prop].name}:`, orig);
            if (s === null) return orig;
            return s;
        },
    };
    // Unregister old menu items
    let id, prop, pack;
    let flag = true;
    while (pack = _GM_config_registered.pop()) {
        [id, prop] = pack; // prop=null means the menu command is currently a placeholder ("Show configuration")
        GM_unregisterMenuCommand(id);
        debug(`- Unregistered menu command: prop="${prop}", id=${id}`);
        if (prop === until) { // Nobody in their right mind would use `null` as a property name
            flag = false;
            break;
        }
    }
    for (let prop in desc) {
        if (prop === until) {
            flag = true;
        }
        if (!flag) continue;
        let name = desc[prop].name;
        let orig = _GM_config_get(desc, prop);
        let input = desc[prop].input || "prompt";
        let input_func = typeof input === "function" ? input : _GM_config_builtin_inputs[input];
        let formatter = desc[prop].formatter || "default";
        let formatter_func = typeof formatter === "function" ? formatter : _GM_config_builtin_formatters[formatter];
        let option = {
            accessKey: desc[prop].accessKey,
            autoClose: desc[prop].autoClose,
            title: desc[prop].title
        };
        let id = registerMenuCommand(formatter_func(name, orig), function () {
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
                alert("⚠️ " + error);
                return;
            }
            if (value !== orig) {
                config[prop] = value;
            }
        }, option);
        debug(`+ Registered menu command: prop="${prop}", id=${id}, option=`, option);
        _GM_config_registered.push([id, prop]);
    }
};

function GM_config(desc, menu = true) { // Register menu items based on given config description
    // Get proxied config
    let config = new Proxy(desc, _GM_config_wrapper);
    // Register menu items
    if (window === window.top) {
        if (menu) {
            _GM_config_register(desc, config);
        } else {
            // Register menu items after user clicks "Show configuration"
            let id = registerMenuCommand("Show configuration", function () {
                _GM_config_register(desc, config);
            }, {
                autoClose: false,
                title: "Show configuration options for this script"
            });
            debug(`+ Registered menu command: prop="Show configuration", id=${id}`);
            _GM_config_registered.push([id, null]);
        }
        window.top.addEventListener(GM_config_event, (e) => { // Auto update menu items
            if (e.detail.type === "set" && e.detail.before !== e.detail.after) {
                debug(`🔧 "${e.detail.prop}" changed from ${e.detail.before} to ${e.detail.after}`);
                _GM_config_register(desc, config, e.detail.prop);
            } else if (e.detail.type === "get") {
                debug(`🔍 "${e.detail.prop}" requested, value is ${e.detail.after}`);
            }
        });
    }
    // Return proxied config
    return config;
};
