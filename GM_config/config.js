// ==UserScript==
// @name         Tampermonkey Config
// @name:zh-CN   Tampermonkey 配置
// @license      gpl-3.0
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Simple Tampermonkey script config library
// @description:zh-CN  简易的 Tampermonkey 脚本配置库
// @author       PRO
// @match        *
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// ==/UserScript==

class GM_config extends EventTarget {
    /**
     * The version of the GM_config library
     */
    static get version() {
        return "1.0.0";
    }
    /**
     * Built-in processors for user input
     * @type {Object<string, Function>}
     */
    static #builtin_processors = {
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
    /**
     * Built-in formatters for user input
     * @type {Object<string, Function>}
     */
    static #builtin_formatters = {
        normal: (name, value) => `${name}: ${value}`,
        boolean: (name, value) => `${name}: ${value ? "✔" : "✘"}`,
    };
    /**
     * The proxied config object, to be initialized in the constructor
     */
    proxy = {};
    /**
     * Whether to show debug information
     * @type {boolean}
     */
    debug = false;
    /**
     * The config description object, to be initialized in the constructor
     */
    #desc = {};
    /**
     * The built-in input functions
     * @type {Object<string, Function>}
     */
    #builtin_inputs = {
        current: (prop, orig) => orig,
        prompt: (prop, orig) => {
            const s = prompt(`🤔 New value for ${this.#desc[prop].name}:`, orig);
            return s === null ? orig : s;
        },
    };
    /**
     * A mapping for the registered menu items, from property to menu id
     */
    #registered = {};
    /**
     * The constructor of the GM_config class
     * @param {Object} desc The config description object
     * @param {Object} [options] Optional settings
     * @param {boolean} [options.immediate=true] Whether to register menu items immediately
     * @param {boolean} [options.debug=false] Whether to show debug information
     */
    constructor(desc, options) { // Register menu items based on given config description
        super();
        // Calc true default value
        const $default = Object.assign({
            input: "prompt",
            processor: "same",
            formatter: "normal"
        }, desc["$default"] ?? {});
        Object.assign(this.#desc, desc);
        delete this.#desc.$default;
        // Handle value change events
        function onValueChange(prop, before, after, remote) {
            const defaultValue = this.#desc[prop].value;
            // If `before` or `after` is `undefined`, replace it with default value
            if (before === undefined) before = defaultValue;
            if (after === undefined) after = defaultValue;
            this.#dispatch(true, { prop, before, after, remote });
        }
        // Complete desc & setup value change listeners
        for (const key in this.#desc) {
            this.#desc[key] = Object.assign({}, $default, this.#desc[key]);
            GM_addValueChangeListener(key, onValueChange.bind(this));
        }
        // Proxied config
        this.proxy = new Proxy(this.#desc, {
            get: (desc, prop) => {
                return this.get(prop);
            },
            set: (desc, prop, value) => {
                return this.set(prop, value);
            }
        });
        // Register menu items
        if (window === window.top) {
            if (options?.immediate ?? true) {
                this.#register();
            } else {
                // Register menu items after user clicks "Show configuration"
                const id = GM_registerMenuCommand("Show configuration", () => {
                    this.#register();
                }, {
                    autoClose: false,
                    title: "Show configuration options for this script"
                });
                this.#log(`+ Registered menu command: prop="Show configuration", id=${id}`);
                this.#registered[null] = id;
            }
            this.addEventListener("set", (e) => { // Auto update menu items
                if (e.detail.before !== e.detail.after) {
                    this.#log(`🔧 "${e.detail.prop}" changed from ${e.detail.before} to ${e.detail.after}, remote: ${e.detail.remote}`);
                    const id = this.#registered[e.detail.prop];
                    if (id !== undefined) {
                        this.#register_item(e.detail.prop);
                    } else {
                        this.#log(`+ Skipped updating menu since it's not registered: prop="${e.detail.prop}"`);
                    }
                }
            });
            this.addEventListener("get", (e) => {
                this.#log(`🔍 "${e.detail.prop}" requested, value is ${e.detail.after}`);
            });
        }
        this.debug = options?.debug ?? this.debug;
    }
    /**
     * Get the value of a property
     * @param {string} prop The property name
     * @returns {any} The value of the property
     */
    get(prop) {
        // Return stored value, else default value
        const value = this.#get(prop);
        // Dispatch get event
        this.#dispatch(false, {
            prop,
            before: value,
            after: value,
            remote: false
        });
        return value;
    }
    /**
     * Set the value of a property
     * @param {string} prop The property name
     * @param {any} value The value to be set
     * @returns {boolean} Whether the value is set successfully
     */
    set(prop, value) {
        // Store value
        const default_value = this.#desc[prop].value;
        if (value === default_value && typeof GM_deleteValue === "function") {
            GM_deleteValue(prop); // Delete stored value if it's the same as default value
            this.#log(`🗑️ "${prop}" deleted`);
        } else {
            GM_setValue(prop, value);
        }
        // Dispatch set event (will be handled by value change listeners)
        return true;
    }
    /**
     * Get the value of a property (only for internal use; won't trigger events)
     * @param {string} prop The property name
     * @returns {any} The value of the property
     */
    #get(prop) {
        return GM_getValue(prop, this.#desc[prop].value);
    }
    /**
     * Log a message if debug is enabled
     * @param  {...any} args The message to log
     */
    #log(...args) {
        if (this.debug) {
            console.log("[GM_config]", ...args);
        }
    }
    /**
     * Dispatches the event
     * @param {string} isSet Whether the event is a set event (`true` for set, `false` for get)
     * @param {Object} detail The detail object
     * @param {string} detail.prop The property name
     * @param {any} detail.before The value before the operation
     * @param {any} detail.after The value after the operation
     * @param {boolean} detail.remote Whether the operation is remote (always `false` for `get`)
     * @returns {boolean} Always `true`
     */
    #dispatch(isSet, detail) {
        const event = new CustomEvent(isSet ? "set" : "get", {
            detail: detail
        });
        return this.dispatchEvent(event);
    }
    /**
     * Register menu items
     */
    #register() {
        // Unregister old menu items
        for (const prop in this.#registered) {
            const id = this.#registered[prop];
            GM_unregisterMenuCommand(id);
            delete this.#registered[prop];
            this.#log(`- Unregistered menu command: prop="${prop}", id=${id}`);
        }
        for (const prop in this.#desc) {
            this.#registered[prop] = this.#register_item(prop);
        }
    }
    /**
     * (Re-)register a single menu item, return its menu id
     * @param {string} prop The property
     */
    #register_item(prop) {
        const name = this.#desc[prop].name;
        const orig = this.#get(prop);
        const input = this.#desc[prop].input;
        const input_func = typeof input === "function" ? input : this.#builtin_inputs[input];
        const formatter = this.#desc[prop].formatter;
        const formatter_func = typeof formatter === "function" ? formatter : GM_config.#builtin_formatters[formatter];
        const option = {
            accessKey: this.#desc[prop].accessKey,
            autoClose: this.#desc[prop].autoClose,
            title: this.#desc[prop].title,
            id: this.#registered[prop],
        };
        const id = GM_registerMenuCommand(formatter_func(name, orig), () => {
            let value;
            try {
                value = input_func(prop, orig);
                const processor = this.#desc[prop].processor;
                if (typeof processor === "function") { // Process user input
                    value = processor(value);
                } else if (typeof processor === "string") {
                    const parts = processor.split("-");
                    const processor_func = GM_config.#builtin_processors[parts[0]];
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
                this.set(prop, value);
            }
        }, option);
        this.#log(`+ Registered menu command: prop="${prop}", id=${id}, option=`, option);
        return id;
    }
}
