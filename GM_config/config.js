// ==UserScript==
// @name         Tampermonkey Config
// @name:zh-CN   Tampermonkey 配置
// @license      gpl-3.0
// @namespace    http://tampermonkey.net/
// @version      1.1.5
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
     * @type {string}
     */
    static get version() {
        return "1.1.5";
    }
    /**
     * Built-in processors for user input
     * @type {Object<string, Function>}
     */
    static #builtinProcessors = {
        same: (v) => v,
        not: (v) => !v,
        int: (s) => {
            const value = parseInt(s);
            if (isNaN(value)) throw `Invalid value: ${s}, expected integer!`;
            return value;
        },
        int_range: (s, minStr, maxStr) => {
            const value = parseInt(s);
            if (isNaN(value)) throw `Invalid value: ${s}, expected integer!`;
            const min = (minStr === "") ? -Infinity : parseInt(minStr);
            const max = (maxStr === "") ? +Infinity : parseInt(maxStr);
            if (min !== NaN && value < min) throw `Invalid value: ${s}, expected integer >= ${min}!`;
            if (max !== NaN && value > max) throw `Invalid value: ${s}, expected integer <= ${max}!`;
            return value;
        },
        float: (s) => {
            const value = parseFloat(s);
            if (isNaN(value)) throw `Invalid value: ${s}, expected float!`;
            return value;
        },
        float_range: (s, minStr, maxStr) => {
            const value = parseFloat(s);
            if (isNaN(value)) throw `Invalid value: ${s}, expected float!`;
            const min = (minStr === "") ? -Infinity : parseFloat(minStr);
            const max = (maxStr === "") ? +Infinity : parseFloat(maxStr);
            if (min !== NaN && value < min) throw `Invalid value: ${s}, expected float >= ${min}!`;
            if (max !== NaN && value > max) throw `Invalid value: ${s}, expected float <= ${max}!`;
            return value;
        },
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
    #builtinInputs = {
        prompt: (prop, orig) => {
            const s = window.prompt(`🤔 New value for ${this.#getProp(prop).name}:`, orig);
            return s === null ? orig : s;
        },
        current: (prop, orig) => orig,
        action: (prop, orig) => {
            this.#dispatch(false, { prop, before: orig, after: orig, remote: false });
            return orig;
        },
        folder: (prop, orig) => {
            const last = GM_config.#dottedToList(prop).pop();
            this.down(last);
            this.#dispatch(false, { prop, before: orig, after: orig, remote: false });
            return orig;
        },
    };
    /**
     * The built-in types
     */
    #builtinTypes = {
        str: { // String
            value: "",
            input: "prompt",
            processor: "same",
            formatter: "normal",
        },
        bool: { // Boolean
            value: false,
            input: "current",
            processor: "not",
            formatter: "boolean",
        },
        int: { // Integer
            value: 0,
            input: "prompt",
            processor: "int",
            formatter: "normal",
        },
        float: { // Float
            value: 0.0,
            input: "prompt",
            processor: "float",
            formatter: "normal",
        },
        action: { // Action
            value: null,
            input: "action",
            processor: "same",
            formatter: "name_only",
            autoClose: true,
        },
        folder: { // Folder
            value: null,
            items: {},
            input: "folder",
            processor: "same",
            formatter: "folder",
            autoClose: false,
        },
    };
    /**
     * Built-in formatters for user input
     * @type {Object<string, Function>}
     */
    #builtinFormatters = {
        normal: (name, value) => `${name}: ${value}`,
        boolean: (name, value) => `${name}: ${value ? "✔" : "✘"}`,
        name_only: (name, value) => name,
        folder: (name, value) => `${this.#folderDisplay.prefix}${name}${this.#folderDisplay.suffix}`,
    };
    /**
     * A mapping for the registered menu items, from property to menu id
     */
    #registered = {};
    /**
     * Controls the display of the folder
     * @type { {prefix: string, suffix: string, parent: string} }
     */
    #folderDisplay = {
        prefix: "",
        suffix: " >",
        parentText: "< Back",
        parentTitle: "Return to parent folder",
    };
    /**
     * The current path we're at
     * @type {string[]}
     */
    #currentPath = [];
    /**
     * Cache for current config description
     * @type {Object|null}
     */
    #currentDescCache = null;
    /**
     * Cache for config values
     * @type {{[prop: string]: any}}
     */
    #configCache = {};
    /**
     * The current path we're at
     * @type {string[]}
     */
    get currentPath() {
        return [...this.#currentPath];
    }
    /**
     * Get the config description at the current path
     * @type {Object}
     */
    get #currentDesc() {
        if (this.#currentDescCache) return this.#currentDescCache;
        let desc = this.#desc;
        for (const path of this.#currentPath) {
            desc = desc[path].items;
        }
        this.#currentDescCache = desc;
        return desc;
    }
    /**
     * The constructor of the GM_config class
     * @param {Object} desc The config description object
     * @param {Object} [options] Optional settings
     * @param {boolean} [options.immediate=true] Whether to register menu items immediately
     * @param {boolean} [options.debug=false] Whether to show debug information
     */
    constructor(desc, options = {}) { // Register menu items based on given config description
        super();
        // Handle value change events
        /**
         * Handle value change events
         * @param {string} prop The dotted property name
         * @param {any} before The value before the change
         * @param {any} after The value after the change
         * @param {boolean} remote Whether the change is remote
         */
        function onValueChange(prop, before, after, remote) {
            const defaultValue = this.#getProp(prop).value;
            // If `before` or `after` is `undefined`, replace it with default value
            if (before === undefined) before = defaultValue;
            if (after === undefined) after = defaultValue;
            // Update cache, if present (so as not to cache config values that are not accessed)
            if (prop in this.#configCache) {
                this.#configCache[prop] = after;
            }
            // Dispatch set event
            this.#dispatch(true, { prop, before, after, remote });
        }
        // Complete desc & setup value change listeners
        function initDesc(desc, path = [], parentDefault = {}) {
            // Calc true default value for current level
            const $default = Object.assign({}, parentDefault, desc["$default"] ?? {});
            delete desc.$default;
            for (const key in desc) {
                const fullPath = [...path, key];
                desc[key] = Object.assign({}, $default, this.#builtinTypes[desc[key].type] ?? {}, desc[key]);
                if (desc[key].type === "folder") {
                    initDesc.call(this, desc[key].items, fullPath, $default);
                } else {
                    GM_addValueChangeListener(GM_config.#listToDotted(fullPath), onValueChange.bind(this));
                }
            }
        }
        this.#desc = desc;
        initDesc.call(this, this.#desc, [], {
            input: "prompt",
            processor: "same",
            formatter: "normal"
        });
        // Set options
        this.debug = options.debug ?? this.debug;
        Object.assign(this.#folderDisplay, options.folderDisplay ?? {});
        // Proxied config
        const proxyCache = {};
        /**
         * Handlers for the proxied config object
         * @param {string} basePath The base path
         */
        const handlers = (basePath) => {
            return {
                has: (target, prop) => {
                    const normalized = GM_config.#normalizeProp(`${basePath}.${prop}`);
                    return this.#getProp(normalized) !== undefined;
                },
                get: (target, prop) => {
                    const normalized = GM_config.#normalizeProp(`${basePath}.${prop}`);
                    const desc = this.#getProp(normalized);
                    if (desc === undefined) return undefined;
                    if (desc.type === "folder") {
                        if (!proxyCache[normalized]) {
                            proxyCache[normalized] = new Proxy({}, handlers(normalized));
                        }
                        return proxyCache[normalized];
                    } else {
                        return this.get(normalized);
                    }
                },
                set: (target, prop, value) => {
                    return this.set(`${basePath}.${prop}`, value);
                },
                ownKeys: (target) => {
                    return this.list(basePath);
                },
                getOwnPropertyDescriptor: (target, prop) => {
                    return { enumerable: true, configurable: true };
                }
            }
        }
        this.proxy = new Proxy({}, handlers(""));
        // Register menu items
        if (window === window.top) {
            if (options.immediate ?? true) {
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
                        this.#registerItem(e.detail.prop);
                    } else {
                        this.#log(`+ Skipped updating menu since it's not registered: prop="${e.detail.prop}"`);
                    }
                }
            });
            this.addEventListener("get", (e) => {
                this.#log(`🔍 "${e.detail.prop}" requested, value is ${e.detail.after}`);
            });
        }
    }
    /**
     * If given a function, calls it with following arguments; otherwise, returns the given value
     * @param {Function|any} value The value or function to be called
     * @param  {...any} args The arguments to be passed to the function
     */
    static #call(value, ...args) {
        return typeof value === "function" ? value(...args) : value;
    }
    /**
     * Convert a dotted string to a list
     * @param {string} dotted The dotted string
     * @returns {string[]} The list
     */
    static #dottedToList(dotted) {
        return dotted.split(".").filter(s => s);
    }
    /**
     * Convert a list to a dotted string
     * @param {string[]} list The list
     * @returns {string} The dotted string
     */
    static #listToDotted(list) {
        return list.join(".");
    }
    /**
     * Normalize a property name
     * @param {string} prop The property name
     * @returns {string} The normalized property name
     */
    static #normalizeProp(prop) {
        return GM_config.#listToDotted(GM_config.#dottedToList(prop));
    }
    /**
     * Get the value of a property
     * @param {string} prop The dotted property name
     * @returns {any} The value of the property
     */
    get(prop) {
        const normalized = GM_config.#normalizeProp(prop);
        const defaultValue = this.#getProp(prop).value;
        // Return stored value, else default value
        const value = this.#get(normalized, defaultValue);
        // Dispatch get event
        this.#dispatch(false, {
            prop: normalized,
            before: value,
            after: value,
            remote: false
        });
        return value;
    }
    /**
     * Set the value of a property
     * @param {string} prop The dotted property name
     * @param {any} value The value to be set
     * @returns {boolean} Whether the value is set successfully
     */
    set(prop, value) {
        const normalized = GM_config.#normalizeProp(prop);
        // Store value
        const desc = this.#getProp(normalized);
        if (desc === undefined) return false; // Property not found
        const defaultValue = desc.value;
        if (value === defaultValue && typeof GM_deleteValue === "function") {
            GM_deleteValue(normalized); // Delete stored value if it's the same as default value
            this.#log(`🗑️ "${normalized}" deleted`);
        } else {
            GM_setValue(normalized, value);
        }
        // Dispatch set event (will be handled by value change listeners)
        return true;
    }
    /**
     * List all properties at the given path
     * @param {string|null|undefined} prop The dotted property name of a folder, or nullish for root
     */
    list(prop) {
        const normalized = GM_config.#normalizeProp(prop ?? "");
        if (normalized) {
            return Object.keys(this.#getProp(normalized)?.items ?? {});
        } else {
            return Object.keys(this.#desc);
        }
    }
    /**
     * Get the description of a property
     * @param {string|string[]} path The path to the property, either a dotted string or a list
     * @returns {Object|undefined} The description of the property, or `undefined` if not found
     */
    #getProp(path) {
        if (typeof path === "string") {
            path = GM_config.#dottedToList(path);
        }
        let desc = this.#desc;
        for (const key of path.slice(0, -1)) {
            desc = desc?.[key]?.items;
        }
        return desc ? desc[path[path.length - 1]] : undefined;
    }
    /**
     * Get the value of a property (only for internal use; won't trigger events)
     * @param {string} prop The dotted property name
     * @param {any} defaultValue The default value if not found
     * @returns {any} The value of the property, `undefined` if not found
     */
    #get(prop, defaultValue) {
        // Use cache if present
        if (prop in this.#configCache) return this.#configCache[prop];
        // Otherwise, get value from storage
        const value = GM_getValue(prop, defaultValue);
        this.#configCache[prop] = value; // Cache the value
        return value;
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
     * Go to the parent folder
     * @returns {string | null} The name of the parent folder, or `null` if at root
     */
    up() {
        const value = this.#currentPath.pop();
        this.#log(`⬆️ Went up to ${GM_config.#listToDotted(this.#currentPath) || "#root"}`);
        this.#register();
        return value ?? null;
    }
    /**
     * Go to a subfolder
     * @param {string} name The name of the subfolder
     * @returns {boolean} Whether the operation is successful
     */
    down(name) {
        // Check if the property exists and is a folder
        const currentDesc = this.#currentDesc;
        if (!(name in currentDesc && currentDesc[name].type === "folder")) {
            this.#log(`❌ Cannot go down to ${name} - not a folder`);
            return false;
        }
        this.#currentPath.push(name);
        this.#log(`⬇️ Went down to ${GM_config.#listToDotted(this.#currentPath)}`);
        this.#register();
        return true;
    }
    /**
     * Register menu items at the current path
     */
    #register() {
        this.#currentDescCache = null; // Clear cache
        // Unregister old menu items
        for (const prop in this.#registered) {
            const id = this.#registered[prop];
            GM_unregisterMenuCommand(id);
            delete this.#registered[prop];
            this.#log(`- Unregistered menu command: prop="${prop}", id=${id}`);
        }
        // Register parent menu item (if not at root)
        if (this.#currentPath.length) {
            const id = GM_registerMenuCommand(this.#folderDisplay.parentText, () => {
                this.up();
            }, {
                autoClose: false,
                title: this.#folderDisplay.parentTitle
            });
            this.#registered[null] = id;
            this.#log(`+ Registered menu command: prop=null, id=${id}`);
        }
        // Register new menu items
        for (const prop in this.#currentDesc) {
            const fullProp = GM_config.#listToDotted([...this.#currentPath, prop]);
            this.#registered[fullProp] = this.#registerItem(fullProp);
        }
    }
    /**
     * (Re-)register a single menu item, return its menu id
     * @param {string} prop The dotted property name
     */
    #registerItem(prop) {
        const { name, value, input, processor, formatter, accessKey, autoClose, title } = this.#getProp(prop);
        const orig = this.#get(prop, value);
        const inputFunc = typeof input === "function" ? input : this.#builtinInputs[input];
        const formatterFunc = typeof formatter === "function" ? formatter : this.#builtinFormatters[formatter];
        const option = {
            accessKey: GM_config.#call(accessKey, prop, name, orig),
            autoClose: GM_config.#call(autoClose, prop, name, orig),
            title: GM_config.#call(title, prop, name, orig),
            id: this.#registered[prop],
        };
        const id = GM_registerMenuCommand(formatterFunc(name, orig), () => {
            let value;
            try {
                value = inputFunc(prop, orig);
                if (typeof processor === "function") { // Process user input
                    value = processor(value);
                } else if (typeof processor === "string") {
                    const parts = processor.split("-");
                    const processorFunc = GM_config.#builtinProcessors[parts[0]];
                    if (processorFunc !== undefined) // Process user input
                        value = processorFunc(value, ...parts.slice(1));
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
