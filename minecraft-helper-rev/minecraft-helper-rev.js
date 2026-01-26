// ==UserScript==
// @name         Minecraft Helper Rev
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  Helpful script dedicated to Minecraft players.
// @author       PRO
// @license      gpl-3.0
// @match        https://www.minecraft.net/*
// @match        https://www.curseforge.com/*
// @match        https://modrinth.com/*
// @icon         https://www.minecraft.net/etc.clientlibs/minecraftnet/clientlibs/clientlib-site/resources/favicon.ico
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://github.com/PRO-2684/GM_config/releases/download/v1.2.2/config.min.js#md5=c45f9b0d19ba69bb2d44918746c4d7ae
// ==/UserScript==

(function () {
    "use strict";
    const { name, version } = GM_info.script;
    const debug = console.debug.bind(console, `[${name}@${version}]`);
    const warn = console.warn.bind(console, `[${name}@${version}]`);

    GM_config.extend("list", {
        value: [],
        processor: (_prop, input, _desc) =>
            input.split(",").map((s) => s.trim()),
        formatter: (_prop, value, desc) => `${desc.name}: ${value.join(", ")}`,
    });

    const configDesc = {
        $default: {
            autoClose: false,
        },
        general: {
            name: "⚙️ General",
            title: "General settings",
            type: "folder",
            items: {
                timeout: {
                    name: "Timeout",
                    title: "General timeout value in milliseconds",
                    type: "int",
                    value: 500,
                    min: 1,
                },
            },
        },
        minecraft: {
            name: "🪓 Minecraft.net",
            title: "Settings for Minecraft.net",
            type: "folder",
            items: {
                autoStay: {
                    name: "Auto Stay",
                    title: "Automatically click the 'Stay on Minecraft.net' button",
                    type: "bool",
                    value: true,
                },
            },
        },
        curseforge: {
            name: "📦 CurseForge",
            title: "Settings for CurseForge",
            type: "folder",
            items: {
                autoMod: {
                    name: "Auto Navigate to MC Mods",
                    title: "Automatically navigate to MC Mods on the homepage",
                    type: "bool",
                    value: true,
                },
                highlightFiles: {
                    name: "Highlight Files Tab",
                    title: "Highlight the Files tab on mod pages",
                    type: "bool",
                    value: true,
                },
                highlightBorder: {
                    name: "Highlight Border Style",
                    title: "CSS border style for highlighting the Files tab",
                    value: "rgb(241, 100, 54) 0.2em solid",
                },
                shortcut: {
                    name: "Keyboard Shortcuts",
                    title: "Enable keyboard shortcuts",
                    type: "bool",
                    value: true,
                },
            },
        },
        modrinth: {
            name: "🔧 Modrinth",
            title: "Settings for Modrinth",
            type: "folder",
            items: {
                autoMod: {
                    name: "Auto Navigate to Mods",
                    title: "Automatically navigate to the Mods page on the homepage",
                    type: "bool",
                    value: true,
                },
                shortcut: {
                    name: "Keyboard Shortcuts",
                    title: "Enable keyboard shortcuts",
                    type: "bool",
                    value: true,
                },
                filter: {
                    name: "Filter",
                    title: "Default filters applied when searching for mods",
                    type: "folder",
                    items: {
                        loader: {
                            name: "Loader",
                            title: "Default loader(s) for mod searches",
                            type: "list",
                            value: ["fabric"],
                        },
                        version: {
                            name: "Version",
                            title: "Default Minecraft version(s) for mod searches",
                            type: "list",
                            value: [],
                        },
                        channel: {
                            name: "Channel",
                            title: "Default channel(s) for mod searches",
                            type: "list",
                            value: [],
                        },
                    },
                },
            },
        },
    };
    const config = new GM_config(configDesc);
    /**
     * Try to click an element or execute the function.
     * @param {string | Function} target The query selector or function.
     * @returns {boolean} Whether the action was successful.
     */
    function clickOrExecute(target) {
        if (typeof target === "string") {
            const ele = document.querySelector(target);
            if (ele) {
                ele.click();
                return true;
            }
            return false;
        } else if (typeof target === "function") {
            return target() || false;
        }
        return false;
    }
    /**
     * Setup shortcuts.
     * @param {string[]} targets The selectors or functions. [left, right, pre-search, search]
     * @param {Function} filter The filter function.
     * @param {number} timeout Timeout in milliseconds.
     */
    function setupShortcuts(targets, filter, timeout) {
        const nodeNames = ["INPUT", "TEXTAREA"];
        document.addEventListener("keydown", (e) => {
            if (
                !nodeNames.includes(document.activeElement.nodeName) &&
                !e.altKey &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.shiftKey
            ) {
                switch (e.key) {
                    case "ArrowLeft":
                        clickOrExecute(targets[0]);
                        break;
                    case "ArrowRight":
                        clickOrExecute(targets[1]);
                        break;
                    case "f":
                        filter();
                        break;
                    case "s":
                        if (targets[2]) {
                            clickOrExecute(targets[2]);
                            window.setTimeout(() => {
                                const search = document.querySelector(
                                    targets[3],
                                );
                                if (search) search.focus();
                            }, timeout);
                        } else {
                            const search = document.querySelector(targets[3]);
                            if (search) search.focus();
                        }
                        e.preventDefault();
                        break;
                    default:
                        break;
                }
            } else if (document.activeElement.value == "") {
                switch (e.key) {
                    case "Escape":
                        document.activeElement.blur();
                        break;
                    case "ArrowLeft":
                        clickOrExecute(targets[0]);
                        break;
                    case "ArrowRight":
                        clickOrExecute(targets[1]);
                        break;
                    default:
                        break;
                }
            }
        });
        debug("⚙️ Shortcuts installed!");
    }
    switch (window.location.host) {
        case "www.minecraft.net": {
            config.down("minecraft");
            if (config.get("minecraft.autoStay")) {
                let attempts = 16;
                const timer = window.setInterval(() => {
                    const success =
                        clickOrExecute(
                            "button[data-aem-contentname='close-icon']",
                        ) || clickOrExecute("button.btn.btn-link#popup-btn");
                    if (success) {
                        debug("✋ Auto stayed!");
                        window.clearInterval(timer);
                    } else if (--attempts <= 0) {
                        warn("❌ Auto stay failed!");
                        window.clearInterval(timer);
                    }
                }, config.get("general.timeout"));
            }
            break;
        }
        case "www.curseforge.com": {
            config.down("curseforge");
            if (
                config.get("curseforge.autoMod") &&
                window.location.pathname == "/"
            ) {
                debug("🛣️ Navigating to mc mods...");
                window.location.pathname = "/minecraft/mc-mods";
            }
            const tabs = document.getElementsByClassName("project-tabs");
            let fileTab = undefined;
            if (tabs.length) {
                for (const tab of tabs[0].children) {
                    if (tab.textContent == "Files") {
                        fileTab = tab;
                        break;
                    }
                }
            }
            if (
                config.get("curseforge.highlightFiles") &&
                window.location.pathname != "/"
            ) {
                fileTab.style.border = config.get("curseforge.highlightBorder");
            }
            if (config.get("curseforge.shortcut")) {
                setupShortcuts(
                    [".btn-prev", ".btn-next", "", "input.search-input-field"],
                    () => {
                        fileTab?.firstElementChild?.click();
                    },
                );
            }
            break;
        }
        case "modrinth.com": {
            config.down("modrinth");
            if (
                window.location.pathname == "/" &&
                config.get("modrinth.autoMod")
            ) {
                debug("🛣️ Navigating to mod search page...");
                clickOrExecute("a[href='/discover/mods']");
            }
            function filter() {
                const router =
                    document.getElementById("__nuxt").__vue_app__.$nuxt.$router;
                if (router.currentRoute.value.name === "type-id") {
                    const path = router.currentRoute.value.path;
                    router.push({
                        path: path + "/versions",
                        query: {
                            l: config.get("modrinth.filter.loader"),
                            g: config.get("modrinth.filter.version"),
                            c: config.get("modrinth.filter.channel"),
                        },
                    });
                }
            }
            if (config.get("modrinth.shortcut")) {
                setupShortcuts(
                    [
                        ".btn-wrapper > a[aria-label='Previous Page']",
                        ".btn-wrapper > a[aria-label='Next Page']",
                        () => {
                            const router =
                                document.getElementById("__nuxt").__vue_app__
                                    .$nuxt.$router;
                            router.push("/discover/mods");
                        },
                        "input[placeholder='Search mods...']",
                    ],
                    filter,
                );
            }
            break;
        }
    }
})();
