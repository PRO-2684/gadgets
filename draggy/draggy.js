// ==UserScript==
// @name         Draggy
// @name:zh-CN   Draggy
// @namespace    http://tampermonkey.net/
// @version      0.1.4
// @description  Drag a link to open in a new tab; drag a piece of text to search in a new tab.
// @description:zh-CN 拖拽链接以在新标签页中打开，拖拽文本以在新标签页中搜索。
// @tag          productivity
// @author       PRO-2684
// @match        *://*/*
// @run-at       document-start
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @license      gpl-3.0
// @grant        GM_openInTab
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
        circleOverlay: {
            name: "Circle overlay",
            title: "When to show the circle overlay.",
            value: 1,
            input: (prop, orig) => (orig + 1) % 3,
            processor: "same",
            formatter: (prop, value) => configDesc.circleOverlay.name + ": " + ["Never", "Auto", "Always"][value],
        },
        openTabInBg: {
            name: "Open tab in background",
            title: "Whether to open new tabs in the background.",
            type: "bool",
            value: false,
        },
        openTabInsert: {
            name: "Open tab insert",
            title: "Whether to insert the new tab next to the current tab. If false, the new tab will be appended to the end.",
            type: "bool",
            value: true,
        },
        searchEngine: {
            name: "Search engine",
            title: "Search engine used when dragging text. Use {} as a placeholder for the URL-encoded query.",
            type: "string",
            value: "https://www.google.com/search?q={}",
        },
        maxLength: {
            name: "Maximum text length",
            title: "Maximum length of the search term. If the length of the search term exceeds this value, it will be truncated. Set to 0 to disable this feature.",
            type: "int_range-0-1000",
            value: 100,
        },
        minDistance: {
            name: "Minimum drag distance",
            title: "Minimum distance to trigger draggy.",
            type: "int_range-1-1000",
            value: 50,
        },
        maxTimeDelta: {
            name: "Maximum time delta",
            title: "Maximum time difference between esc/drop and dragend events to consider them as separate user gesture. Usually there's no need to change this value.",
            type: "int_range-1-100",
            value: 10,
        },
        debug: {
            name: "Debug mode",
            title: "Enables debug mode.",
            type: "bool",
            value: false,
        },
    };
    const config = new GM_config(configDesc, { immediate: false });
    /**
     * Last time a drop event occurred.
     * @type {number}
     */
    let lastDrop = 0;
    /**
     * Start position of the drag event.
     * @type {{ x: number, y: number }}
     */
    let startPos = { x: 0, y: 0 };
    /**
     * Circle overlay.
     * @type {HTMLDivElement}
     */
    const circle = initOverlay();
    /**
     * Judging criteria for draggy.
     * @type {{ selection: (e: DragEvent) => string|HTMLAnchorElement|HTMLImageElement|null, handlers: (e: DragEvent) => boolean, dropEvent: (e: DragEvent) => boolean, }}
     */
    const judging = {
        selection: (e) => {
            const selection = window.getSelection();
            const selectionAncestor = commonAncestor(selection.anchorNode, selection.focusNode);
            const selectedText = selection.toString();
            // Check if we're dragging the selected text (selectionAncestor is the ancestor of e.target, or e.target is the ancestor of selectionAncestor)
            if (selectedText && selectionAncestor && (isAncestorOf(selectionAncestor, e.target) || isAncestorOf(e.target, selectionAncestor))) {
                return selectedText;
            }
            const link = e.target.closest("a[href]");
            const href = link?.getAttribute("href");
            if (href && !href.startsWith("javascript:") && href !== "#") {
                return link;
            }
            const img = e.target.closest("img[src]");
            const src = img.src;
            if (src) {
                return img;
            }
        },
        handlers: (e) => e.dataTransfer.dropEffect === "none" && e.dataTransfer.effectAllowed === "uninitialized" && !e.defaultPrevented,
        dropEvent: (e) => e.timeStamp - lastDrop > config.get("maxTimeDelta"),
    };

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
     * Finds the most recent common ancestor of two nodes.
     * @param {Node} node1 The first node.
     * @param {Node} node2 The second node.
     * @returns {Node|null} The common ancestor of the two nodes.
     */
    function commonAncestor(node1, node2) {
        const ancestors = new Set();
        for (let n = node1; n; n = n.parentNode) {
            ancestors.add(n);
        }
        for (let n = node2; n; n = n.parentNode) {
            if (ancestors.has(n)) {
                return n;
            }
        }
        return null;
    }
    /**
     * Checks if the given node is an ancestor of another node.
     * @param {Node} ancestor The ancestor node.
     * @param {Node} descendant The descendant node.
     * @returns {boolean} Whether the ancestor is an ancestor of the descendant.
     */
    function isAncestorOf(ancestor, descendant) {
        for (let n = descendant; n; n = n.parentNode) {
            if (n === ancestor) {
                return true;
            }
        }
        return false
    }
    /**
     * Opens the given URL in a new tab, respecting the user's preference.
     * @param {string} url The URL to open.
     */
    function open(url) {
        GM_openInTab(url, { active: !config.get("openTabInBg"), insert: config.get("openTabInsert") });
    }
    /**
     * Searches for the given keyword.
     * @param {string} keyword The keyword to search for.
     */
    function search(keyword) {
        const searchEngine = config.get("searchEngine");
        const maxLength = config.get("maxLength");
        const truncated = maxLength > 0 ? keyword.slice(0, maxLength) : keyword;
        const url = searchEngine.replace("{}", encodeURIComponent(truncated));
        log(`Searching for "${truncated}" using "${url}"`);
        open(url);
    }
    /**
     * Updates the circle overlay size.
     * @param {number} size The size of the circle overlay.
     */
    function onMinDistanceChange(size) {
        circle.style.setProperty("--size", size + "px");
    }
    /**
     * Creates a circle overlay.
     * @returns {HTMLDivElement} The circle overlay.
     */
    function initOverlay() {
        const circle = document.body.appendChild(document.createElement("div"));
        circle.id = "draggy-overlay";
        const style = document.head.appendChild(document.createElement("style"));
        style.id = "draggy-style";
        style.textContent = `
            body {
                > #draggy-overlay {
                    --size: 50px; /* Circle radius */
                    --center-x: calc(-1 * var(--size)); /* Hide the circle by default */
                    --center-y: calc(-1 * var(--size));
                    display: none;
                    position: fixed;
                    box-sizing: border-box;
                    width: calc(var(--size) * 2);
                    height: calc(var(--size) * 2);
                    top: calc(var(--center-y) - var(--size));
                    left: calc(var(--center-x) - var(--size));
                    border-radius: 50%;
                    border: 1px solid white; /* Circle border */
                    padding: 0;
                    margin: 0;
                    mix-blend-mode: difference; /* Invert the background */
                    background: transparent;
                    z-index: 9999999999;
                    pointer-events: none;
                }
                &[data-draggy-overlay="0"] > #draggy-overlay {  }
                &[data-draggy-overlay="1"] > #draggy-overlay[data-draggy-selection] { display: block; }
                &[data-draggy-overlay="2"] > #draggy-overlay { display: block; }
            }
        `;
        return circle;
    }
    /**
     * Toggles the circle overlay.
     * @param {number} mode When to show the circle overlay.
     */
    function toggleOverlay(mode) {
        document.body.setAttribute("data-draggy-overlay", mode);
    }

    // Event listeners
    document.addEventListener("drop", (e) => {
        lastDrop = e.timeStamp;
        log("Drop event at", e.timeStamp);
    }, { passive: true });
    document.addEventListener("dragstart", (e) => {
        if (!judging.selection(e)) {
            circle.toggleAttribute("data-draggy-selection", false);
        } else {
            circle.toggleAttribute("data-draggy-selection", true);
        }
        const { x, y } = e;
        startPos = { x, y };
        circle.style.setProperty("--center-x", x + "px");
        circle.style.setProperty("--center-y", y + "px");
        log("Drag start at", startPos);
    }, { passive: true });
    document.addEventListener("dragend", (e) => {
        circle.style.removeProperty("--center-x");
        circle.style.removeProperty("--center-y");
        if (!judging.handlers(e)) {
            log("Draggy interrupted by other handler(s)");
            return;
        }
        if (!judging.dropEvent(e)) {
            log("Draggy interrupted by drop event");
            return;
        }
        const { x, y } = e;
        const [dx, dy] = [x - startPos.x, y - startPos.y];
        const distance = Math.hypot(dx, dy);
        if (distance < config.get("minDistance")) {
            log("Draggy interrupted by short drag distance:", distance);
            return;
        }
        log("Draggy starts processing...");
        e.preventDefault();
        const data = judging.selection(e);
        if (data instanceof HTMLAnchorElement) {
            open(data.href);
        } else if (data instanceof HTMLImageElement) {
            open(data.src);
        } else if (typeof data === "string") {
            search(data);
        } else {
            log("Draggy can't find selected text or a valid link");
        }
    }, { passive: false });

    // Dynamic configuration
    const callbacks = {
        circleOverlay: toggleOverlay,
        minDistance: onMinDistanceChange,
    };
    for (const [prop, callback] of Object.entries(callbacks)) { // Initialize
        callback(config.get(prop));
    }
    config.addEventListener("set", (e) => { // Update
        const { prop, after } = e.detail;
        const callback = callbacks[prop];
        callback?.(after);
    });

    log(`${version} initialized successfully 🎉`);
})();
