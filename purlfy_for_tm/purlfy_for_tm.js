// ==UserScript==
// @name         pURLfy for Tampermonkey
// @name:zh-CN   pURLfy for Tampermonkey
// @namespace    http://tampermonkey.net/
// @version      0.2.0
// @description  The ultimate URL purifier - for Tampermonkey
// @description:zh-cn 终极 URL 净化器 - Tampermonkey 版本
// @icon         https://github.com/PRO-2684/pURLfy/raw/main/images/logo.svg
// @author       PRO
// @match        *://*/*
// @run-at       document-start
// @grant        GM_getResourceText
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      *
// @require      https://update.greasyfork.org/scripts/492078/1369519/pURLfy.js
// @resource     rules-cn https://cdn.jsdelivr.net/gh/PRO-2684/pURLfy-rules@core-0.3.x/cn.min.json
// @resource     rules-alternative https://cdn.jsdelivr.net/gh/PRO-2684/pURLfy-rules@core-0.3.x/alternative.min.json
// @license      gpl-3.0
// ==/UserScript==

(function () {
    const tag1 = "purlfy-purifying";
    const tag2 = "purlfy-purified";
    const eventName = "purlfy-purify-done";
    const log = console.log.bind(console, "[pURLfy for Tampermonkey]");
    const window = unsafeWindow;
    const initStatistics = {
        url: 0,
        param: 0,
        decoded: 0,
        redirected: 0,
        visited: 0,
        char: 0
    };
    const initRulesCfg = {
        "cn": true,
        "alternative": false
    };
    // Initialize pURLfy core
    const purifier = new Purlfy({
        fetchEnabled: true,
        lambdaEnabled: true,
        fetch: async function (url, options) {
            // Adapted from https://github.com/AlttiRi/gm_fetch
            function normalize(gm_response) {
                const headers = new Headers();
                for (const line of gm_response.responseHeaders.trim().split("\n")) {
                    const [key, ...values] = line.split(": ");
                    headers.append(key, values.join(": "));
                }
                const r = new Response(gm_response.response, {
                    status: gm_response.status,
                    statusText: gm_response.statusText,
                    headers: headers,
                    url: gm_response.finalUrl || url
                });
                Object.defineProperty(r, "url", { value: gm_response.finalUrl || url });
                return r;
            }
            return new Promise((resolve, reject) => {
                // Fetch with GM_xmlhttpRequest
                GM_xmlhttpRequest({
                    url: url,
                    method: "GET",
                    responseType: "arraybuffer",
                    onload: function (gm_response) {
                        resolve(normalize(gm_response));
                    },
                    onerror: function (error) {
                        reject(error);
                    },
                    ...options
                });
            });
        }
    });
    // Import rules
    const rulesCfg = GM_getValue("rules", { ...initRulesCfg });
    for (const key in initRulesCfg) {
        const enabled = rulesCfg[key] ?? initRulesCfg[key];
        rulesCfg[key] = enabled;
        if (enabled) {
            log(`Importing rules: ${key}`);
            const rules = JSON.parse(GM_getResourceText(`rules-${key}`));
            purifier.importRules(rules);
        }
    }
    GM_setValue("rules", rulesCfg);
    // Statistics listener
    purifier.addEventListener("statisticschange", e => {
        log("Statistics increment:", e.detail);
        const statistics = GM_getValue("statistics", { ...initStatistics });
        for (const [key, increment] of Object.entries(e.detail)) {
            statistics[key] = (statistics[key] ?? 0) + increment;
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
    function cloneAndStop(e, stop=true) { // Clone an event and stop the original
        const newEvt = new e.constructor(e.type, e);
        stop && e.preventDefault();
        stop && e.stopImmediatePropagation();
        return newEvt;
    }
    async function mouseHandler(e) { // Intercept mouse events
        const ele = e.target.tagName === "A" ? e.target : e.target.closest("a");
        if (ele && !ele.hasAttribute(tag2) && ele.href) {
            if (!ele.hasAttribute(tag1)) { // The first to intercept
                ele.toggleAttribute(tag1, true);
                const href = ele.href;
                if (!href.startsWith("https://") && !href.startsWith("http://")) return; // Ignore non-HTTP(S) URLs
                const newEvt = cloneAndStop(e);
                this.toast(`Intercepted: "${ele.href}"`);
                const url = ele.href;
                const purified = await purifier.purify(url);
                ele.href = purified.url;
                this.toast(`Processed: "${ele.href}"`);
                ele.toggleAttribute(tag2, true);
                ele.removeAttribute(tag1);
                ele.dispatchEvent(newEvt);
                ele.dispatchEvent(new Event(eventName, { bubbles: false, cancelable: true }));
            } else { // Someone else has intercepted
                const newEvt = cloneAndStop(e);
                this.toast(`Waiting: "${ele.href}"`);
                ele.addEventListener(eventName, function () {
                    log(`Waited: "${ele.href}"`);
                    ele.dispatchEvent(newEvt);
                }, { once: true });
            }
        }
    }
    ["click", "mousedown", "auxclick"].forEach((name) => {
        const hook = new Hook(name);
        hook.handler = mouseHandler.bind(hook);
        hook.enable = async function () {
            document.addEventListener(name, this.handler, { capture: true });
        }
        hook.disable = async function () {
            document.removeEventListener(name, this.handler, { capture: true });
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
    const hooksCfg = GM_getValue("hooks", {}); // Load hook configs
    for (const [name, hook] of hooks) {
        let enabled = hooksCfg[name];
        if (enabled === undefined) {
            enabled = true;
            hooksCfg[name] = enabled;
        }
        enabled && promises.push(hook.enable().then(() => {
            log(`Hook "${name}" enabled.`);
        }));
    }
    GM_setValue("hooks", hooksCfg); // Save hook configs
    Promise.all(promises).then(() => {
        log("Initialized successfully! 🎉");
    });
    // Manual purify
    function trim(url) { // Leave at most 100 characters
        return url.length > 100 ? url.slice(0, 100) + "..." : url;
    }
    function showPurify() {
        const url = prompt("Enter the URL to purify:", location.href);
        if (!url) return;
        purifier.purify(url).then(result => {
            GM_setClipboard(result.url);
            alert(`Original: ${trim(url)}\nResult (copied): ${trim(result.url)}\nMatched rule: ${result.rule}`);
        });
    };
    GM_registerMenuCommand("Purify URL", showPurify);
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
