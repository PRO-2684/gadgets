// ==UserScript==
// @name         pURLfy for Tampermonkey
// @name:zh-CN   pURLfy for Tampermonkey
// @namespace    http://tampermonkey.net/
// @version      0.1.4
// @description  The ultimate URL purifier - for Tampermonkey
// @description:zh-cn 终极 URL 净化器 - Tampermonkey 版本
// @author       PRO
// @match        *://*/*
// @run-at       document-start
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @require      https://update.greasyfork.org/scripts/492078/1360585/pURLfy.js
// @resource     rules https://cdn.jsdelivr.net/gh/PRO-2684/pURLfy@0.2.2/rules/cn.json
// @license      gpl-3.0
// ==/UserScript==

(function () {
    const tag = "purlfy-purified";
    const log = console.log.bind(console, "[pURLfy for Tampermonkey]");
    const window = unsafeWindow;
    const initStatistics = {
        url: 0,
        param: 0,
        decoded: 0,
        redirected: 0,
        char: 0
    };
    // Initialize pURLfy core
    const purifier = new Purlfy({
        redirectEnabled: false,
        lambdaEnabled: true,
    });
    const rules = JSON.parse(GM_getResourceText("rules"));
    purifier.importRules(rules);
    purifier.addEventListener("statisticschange", e => {
        log("Statistics increment:", e.detail);
        const statistics = GM_getValue("statistics", { ...initStatistics });
        for (const [key, increment] of Object.entries(e.detail)) {
            statistics[key] += increment;
        }
        GM_setValue("statistics", statistics);
        log("Statistics updated to:", statistics);
    });
    // Hooks
    const hooks = new Map();
    class Hook { // Dummy class for hooks
        name;
        constructor(name) { // Register a hook
            this.name = name;
            hooks.set(name, this);
        }
        toast(content) { // Indicate that a URL has been intercepted
            log(`Hook "${this.name}": ${content}`);
        }
        async enable() { // Enable the hook
            throw new Error("Over-ride me!");
        }
        async disable() { // Disable the hook
            throw new Error("Over-ride me!");
        }
    }
    // Check location.href (not really a hook, actually)
    const locationHook = new Hook("location.href");
    locationHook.enable = async function () { // Intercept location.href
        const original = location.href;
        const purified = (await purifier.purify(original)).url;
        if (original !== purified) {
            window.stop(); // Stop loading
            this.toast(`Redirect: "${original}" -> "${purified}"`);
            location.replace(purified);
        }
    }.bind(locationHook);
    locationHook.disable = async function () { } // Do nothing
    // Mouse-related hooks
    async function mouseHandler(e) {
        const ele = e.target.closest("a");
        if (ele && !ele.hasAttribute(tag) && ele.href) {
            const href = ele.href;
            if (!href.startsWith("https://") && !href.startsWith("http://")) return; // Ignore non-HTTP(S) URLs
            const hrefURL = new URL(ele.href);
            if (hrefURL.hostname === location.hostname && hrefURL.pathname === location.pathname) return; // Ignore same-page URLs
            this.toast(`Intercepted: "${ele.href}"`);
            e.preventDefault();
            e.stopImmediatePropagation();
            ele.toggleAttribute(tag);
            const url = ele.href;
            const purified = await purifier.purify(url);
            ele.href = purified.url;
            ele.dispatchEvent(new MouseEvent(e.type, e));
        }
    }
    ["click", "mousedown"].forEach((name) => {
        const hook = new Hook(name);
        hook.handler = mouseHandler.bind(hook);
        hook.enable = async function () {
            document.addEventListener(name, this.handler, true);
        }
        hook.disable = async function () {
            document.removeEventListener(name, this.handler, true);
        }
    });
    // Intercept window.open
    const openHook = new Hook("window.open");
    openHook.original = window.open.bind(window);
    openHook.patched = async function (url, target, features) { // Intercept window.open
        this.toast(`Intercepted: "${url}"`);
        const purified = await purifier.purify(url);
        return this.original(purified.url, target, features);
    }.bind(openHook);
    openHook.enable = async function () {
        window.open = this.patched;
    }
    openHook.disable = async function () {
        window.open = this.original;
    }
    // Is there more hooks to add?
    // Enable hooks
    const promises = [];
    for (const [name, hook] of hooks) {
        let enabled = GM_getValue(`hook.${name}`, null);
        if (enabled === null) {
            enabled = true;
            GM_setValue(`hook.${name}`, enabled);
        }
        enabled && promises.push(hook.enable().then(() => {
            log(`Hook "${name}" enabled.`);
        }));
    }
    Promise.all(promises).then(() => {
        log("Initialized successfully! 🎉");
    });
    // Statistics
    function showStatistics() {
        const statistics = GM_getValue("statistics", { ...initStatistics });
        const text = Object.entries(statistics).map(([key, value]) => `${key}: ${value}`).join(", ");
        const r = confirm(text + "\nDo you want to reset the statistics?");
        if (!r) return;
        GM_setValue("statistics", initStatistics);
        log("Statistics reset.");
    };
    GM_registerMenuCommand("Show Statistics", showStatistics);
})();
