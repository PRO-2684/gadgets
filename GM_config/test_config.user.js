// ==UserScript==
// @name         Test Config
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  This is an example to demostrate the usage of greasyfork.org/scripts/470224.
// @author       PRO
// @match        https://greasyfork.org/*
// @icon         https://greasyfork.org/vite/assets/blacklogo16-bc64b9f7.png
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://update.greasyfork.org/scripts/470224/1456701/Tampermonkey%20Config.js
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
                    processor: "float_range-0-" // Convert to float in range [0, +∞)
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
            title: "This is a folder",
            type: "folder",
            items: {
                $default: {
                    formatter: (name, value) => `${name}: ${value ? "✔" : "✘"} ~`
                },
                item1: {
                    name: "Item 1",
                    type: "bool"
                },
                folder: {
                    name: "Another nested folder",
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
                        }
                    }
                }
            }
        },
        password: {
            name: "Password", // Display name
            value: "tmp", // Default value
            input: "prompt", // How to get user input (Invoked when user clicks the menu command)
            processor: (v) => {
                if (v.length < 3) throw "Too short!";
                return v;
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
    window.setTimeout(() => { // Change config values, and menu commands will be updated automatically
        config.proxy["simple.val"] += 1; // Remember to validate the value before setting it
    }, 5000);
})();
