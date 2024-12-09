// ==UserScript==
// @name         Test Config
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  This is an example to demostrate the usage of [GM_config](greasyfork.org/scripts/470224)
// @author       PRO
// @match        https://greasyfork.org/*
// @icon         https://greasyfork.org/vite/assets/blacklogo16-bc64b9f7.png
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @grant        unsafeWindow
// @require      https://update.greasyfork.org/scripts/470224/1499741/Tampermonkey%20Config.js
// @license      gpl-3.0
// ==/UserScript==

(function() {
    'use strict';
    const configDesc = { // Config description
        $default: {
            autoClose: false
        },
        enabled: {
            name: "Enabled",
            title: (prop, name, value) => value ? "Disable some feature" : "Enable some feature",
            value: true,
            // The following can be replaced by `type: "bool"`
            input: "current",
            processor: "not", // Process user inputs, throw error if invalid
            formatter: "boolean", // Format value to be displayed in menu command
        },
        simple: {
            name: "Simple",
            title: "This folder contains some simple properties",
            type: "folder",
            items: {
                anyString: {
                    name: "Any String",
                    type: "str"
                },
                anyBoolean: {
                    name: "Any boolean",
                    type: "bool"
                },
                anyInteger:{
                    name: "Any integer",
                    type: "int"
                },
                anyFloat: {
                    name: "Any float",
                    type: "float"
                },
                val: {
                    name: "Positive float",
                    value: 11.4,
                    processor: "float", // Convert to float in range [0, +∞)
                    min: 0 // Minimum value
                },
                someAction: {
                    name: "Some action",
                    title: "Click me!",
                    type: "action"
                },
            }
        },
        someFolder: {
            name: "Some folder",
            title: "This is a folder starting with `- `, with subfolders ending with `/`",
            type: "folder",
            folderDisplay: {
                prefix: "- "
            },
            items: {
                $default: {
                    formatter: (prop, value, desc) => `${desc.name}: ${value ? "✔" : "✘"} ~`,
                    folderDisplay: {
                        suffix: "/"
                    }
                },
                item1: {
                    name: "Item 1",
                    type: "bool"
                },
                folder: {
                    name: "Another nested folder",
                    title: "My subfolders should also end with `/` (inherited from my parent)",
                    type: "folder",
                    items: {
                        inherited: {
                            name: "Inherited formatter",
                            title: 'This property should inherit formatter from "Some folder", so that it will end with "~"',
                            value: false,
                            input: "current",
                            processor: "not",
                        },
                        nothing: {
                            name: "Nothing here",
                            type: "action"
                        },
                        yetAnotherFolder: {
                            name: "Yet another folder",
                            type: "folder"
                        }
                    }
                }
            }
        },
        password: {
            name: "Password", // Display name
            value: "tmp", // Default value
            input: "prompt", // How to get user input (Invoked when user clicks the menu command)
            processor: (prop, input, desc) => {
                if (input.length < 3) throw "Too short!";
                return input;
            }
        },
    }
    const config = new GM_config(configDesc, { immediate: false, debug: true }); // Register menu commands
    function someAction() {
        console.log("Action is invoked!");
    }
    config.addEventListener("get", (e) => { // Listen to `get` events for `someAction`
        if (e.detail.prop === "simple.someAction") {
            someAction();
        }
    });
    config.addEventListener("set", (e) => { // Listen to config changes
        console.log(e.detail);
    });
    window.setTimeout(() => { // List config keys
        // Using `config.list()`
        console.log("Root", config.list());
        console.log("Some folder", config.list("someFolder"));
        console.log("Another nested folder", config.list("someFolder.folder"));
        // Using proxy
        for (const [k, v] of Object.entries(config.proxy)) {
            console.log(k, v);
        }
        for (const key in config.proxy.someFolder.folder) {
            console.log("Another nested folder", key);
        }
    }, 1000);
    window.setTimeout(() => { // Change config values, and menu commands will be updated automatically
        config.proxy["simple.val"] += 1; // Remember to validate the value before setting it
    }, 5000);
    unsafeWindow.config = config; // Export config object for debugging
    // Try calling `config.down("someFolder")` in the console...
})();
