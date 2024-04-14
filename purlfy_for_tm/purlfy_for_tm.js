// ==UserScript==
// @name         pURLfy for Tampermonkey
// @name:zh-CN   pURLfy for Tampermonkey
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  The ultimate URL purifier - for Tampermonkey
// @author       PRO
// @match        *://*/*
// @run-at       document-start
// @grant        GM_getResourceText
// @grant        unsafeWindow
// @require      https://update.greasyfork.org/scripts/492078/pURLfy.js
// @resource     rules https://cdn.jsdelivr.net/gh/PRO-2684/pURLfy@latest/rules/cn.json
// @license      gpl-3.0
// ==/UserScript==

(function () {
    const tag = "purlfy-purified";
    const log = console.log.bind(console, "[pURLfy for Tampermonkey]");
    const window = unsafeWindow;
    // Initialize pURLfy core
    const purifier = new Purlfy({
        redirectEnabled: false,
        lambdaEnabled: true,
    });
    const rules = JSON.parse(GM_getResourceText("rules"));
    purifier.importRules(rules);
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
        if (ele && !ele.hasAttribute(tag)) {
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
        promises.push(hook.enable().then(() => {
            log(`Hook "${name}" enabled.`);
        }));
    }
    Promise.all(promises).then(() => {
        log("Initialized successfully! 🎉");
    });
})();
