// ==UserScript==
// @name         Draggy
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Drag a link to open in a new tab; drag a piece of text to search in a new tab.
// @author       PRO-2684
// @match        *://*/*
// @run-at       document-start
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @license      gpl-3.0
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://update.greasyfork.org/scripts/470224/1456932/Tampermonkey%20Config.js
// ==/UserScript==
(function () {
    "use strict";
    const { name, version } = GM.info.script;
    const configDesc = {
        $default: {
            autoClose: false,
        },
        debug: {
            name: "Debug mode",
            title: "Enables debug mode.",
            type: "bool",
            value: false,
        },
        searchEngine: {
            name: "Search engine",
            title: "Search engine used when dragging text. Use {} as a placeholder for the URL-encoded query.",
            type: "string",
            value: "https://www.google.com/search?q={}",
        },
        maxTimeDelta: {
            name: "Maximum time delta",
            title: "Maximum time difference between esc/drop and dragend events to consider them as separate user gesture. Usually there's no need to change this value.",
            type: "int_range-1-100",
            value: 10,
        },
    };
    // TODO: ESC to cancel; drag distance threshold & circle overlay
    const config = new GM_config(configDesc, { immediate: false });
    /**
     * Last time a drop event occurred.
     * @type {number}
     */
    let lastDrop = 0;
    /**
     * Logs the given arguments if debug mode is enabled.
     * @param {...any} args The arguments to log.
     */
    function log(...args) {
        if (config.get("debug")) {
            console.log(`[${name}]`, ...args);
        }
    }
    /**
     * Searches for the given keyword.
     * @param {string} keyword The keyword to search for.
     */
    function search(keyword) {
        const searchEngine = config.get("searchEngine");
        const url = searchEngine.replace("{}", encodeURIComponent(keyword));
        log(`Searching for "${keyword}" using "${url}"`);
        window.open(url, "_blank");
    }
    document.addEventListener("drop", (e) => {
        lastDrop = e.timeStamp;
        log("Drop event at", e.timeStamp);
    }, { passive: true });
    document.addEventListener("dragend", (e) => {
        if (e.timeStamp - lastDrop <= config.get("maxTimeDelta")) { // The gesture has been recognized as a drop and thus handled.
            log("Draggy interrupted by drop event");
            return;
        }
        if (e.dataTransfer.dropEffect !== "none" || e.dataTransfer.effectAllowed !== "uninitialized" || e.defaultPrevented) { // Only process drops that were not handled by the browser or other scripts.
            log("Draggy interrupted by other handler(s)");
            return;
        }
        log("Draggy starts processing...");
        e.preventDefault();
        const selectedText = window.getSelection()?.toString();
        if (selectedText) {
            search(selectedText);
            return;
        }
        const link = e.target.closest("a[href]");
        if (!link?.href) return;
        window.open(link.href, "_blank");
    }, { passive: false });
    log(`${version} initialized successfully 🎉`);
})();
