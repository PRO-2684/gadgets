// ==UserScript==
// @name         pURLfy for Tampermonkey
// @name:zh-CN   pURLfy for Tampermonkey
// @namespace    http://tampermonkey.net/
// @version      0.4.8
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
// @require      https://cdn.jsdelivr.net/npm/@trim21/gm-fetch@0.1.15
// @require      https://update.greasyfork.org/scripts/492078/1443165/pURLfy.js
// @resource     rules-tracking https://cdn.jsdelivr.net/gh/PRO-2684/pURLfy-rules@core-0.3.x/tracking.min.json
// @resource     rules-outgoing https://cdn.jsdelivr.net/gh/PRO-2684/pURLfy-rules@core-0.3.x/outgoing.min.json
// @resource     rules-shortener https://cdn.jsdelivr.net/gh/PRO-2684/pURLfy-rules@core-0.3.x/shortener.min.json
// @resource     rules-alternative https://cdn.jsdelivr.net/gh/PRO-2684/pURLfy-rules@core-0.3.x/alternative.min.json
// @resource     rules-other https://cdn.jsdelivr.net/gh/PRO-2684/pURLfy-rules@core-0.3.x/other.min.json
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
        "tracking": true,
        "outgoing": true,
        "shortener": true,
        "alternative": false,
        "other": false
    };
    // Initialize pURLfy core
    const purifier = new Purlfy({
        fetchEnabled: true,
        lambdaEnabled: true,
        fetch: GM_fetch,
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
    // Senseless mode
    const senseless = GM_getValue("senseless", true);
    log(`Senseless mode is ${senseless ? "enabled" : "disabled"}.`);
    GM_setValue("senseless", senseless);
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
    function cloneAndStop(e) { // Clone an event and stop the original
        const newEvt = new e.constructor(e.type, e);
        e.preventDefault();
        e.stopImmediatePropagation();
        return newEvt;
    }
    async function mouseHandler(e) { // Intercept mouse events
        const ele = e.composedPath().find(ele => ele.tagName === "A");
        if (ele && !ele.hasAttribute(tag2) && ele.href && !ele.getAttribute("href").startsWith("#")) {
            const href = ele.href;
            if (!href.startsWith("https://") && !href.startsWith("http://")) return; // Ignore non-HTTP(S) URLs
            if (!ele.hasAttribute(tag1)) { // The first to intercept
                ele.toggleAttribute(tag1, true);
                const newEvt = senseless ? null : cloneAndStop(e);
                this.toast(`Intercepted: "${href}"`);
                const purified = await purifier.purify(href);
                if (purified.url !== href) {
                    ele.href = purified.url;
                    // if (ele.innerHTML === href) ele.innerHTML = purified.url; // Update the text
                    if (ele.childNodes?.length === 1
                        && ele.firstChild.nodeType === Node.TEXT_NODE
                        && ele.firstChild.textContent === href) { // Update the text
                        ele.firstChild.textContent = purified.url;
                    }
                    this.toast(`Processed: "${ele.href}"`);
                } else {
                    this.toast(`Same: "${ele.href}"`);
                }
                ele.toggleAttribute(tag2, true);
                ele.removeAttribute(tag1);
                senseless || ele.dispatchEvent(newEvt);
                ele.dispatchEvent(new Event(eventName, { bubbles: false, cancelable: true }));
            } else { // Someone else has intercepted
                if (!senseless) {
                    const newEvt = cloneAndStop(e);
                    this.toast(`Waiting: "${ele.href}"`);
                    ele.addEventListener(eventName, function () {
                        log(`Waited: "${ele.href}"`);
                        ele.dispatchEvent(newEvt);
                    }, { once: true });
                }
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
    // Listen to `touchstart` event
    async function touchstartHandler(e) { // Always "senseless"
        const ele = e.composedPath().find(ele => ele.tagName === "A");
        if (ele && !ele.hasAttribute(tag1) && !ele.hasAttribute(tag2) && ele.href && !ele.getAttribute("href").startsWith("#")) {
            const href = ele.href;
            if (!href.startsWith("https://") && !href.startsWith("http://")) return; // Ignore non-HTTP(S) URLs
            ele.toggleAttribute(tag1, true);
            this.toast(`Intercepted: "${href}"`);
            const purified = await purifier.purify(href);
            if (purified.url !== href) {
                ele.href = purified.url;
                if (ele.innerHTML === href) ele.innerHTML = purified.url; // Update the text
                this.toast(`Processed: "${ele.href}"`);
            } else {
                this.toast(`Same: "${ele.href}"`);
            }
            ele.toggleAttribute(tag2, true);
            ele.removeAttribute(tag1);
            ele.dispatchEvent(new Event(eventName, { bubbles: false, cancelable: true }));
        }
    }
    const touchstartHook = new Hook("touchstart");
    touchstartHook.handler = touchstartHandler.bind(touchstartHook);
    touchstartHook.enable = async function () {
        document.addEventListener("touchstart", this.handler, { capture: true });
    }
    touchstartHook.disable = async function () {
        document.removeEventListener("touchstart", this.handler, { capture: true });
    }
    // Hook form submit
    // function submitHandler(e) { // Always "senseless"
    //     let submitter = e.submitter;
    //     const form = submitter.form;
    //     if (!form || form.method !== "get" || form.hasAttribute(tag2)) return;
    //     const url = new URL(form.action, location.href);
    //     if (url.protocol !== "http:" && url.protocol !== "https:") return; // Ignore non-HTTP(S) URLs
    //     if (!form.hasAttribute(tag1)) { // The first to intercept
    //         e.preventDefault();
    //         e.stopImmediatePropagation();
    //         form.toggleAttribute(tag1, true);
    //         for (const input of form.elements) {
    //             url.searchParams.set(input.name, input.value);
    //         }
    //         this.toast(`Intercepted: "${url.href}"`);
    //         purifier.purify(url.href).then(result => {
    //             this.toast(`Processed: "${result.url}"`);
    //             const purified = new URL(result.url);
    //             if (purified.href !== url.href) {
    //                 form.action = purified.origin + purified.pathname;
    //                 for (const input of form.elements) {
    //                     if (input.name) {
    //                         if (purified.searchParams.has(input.name)) {
    //                             input.value = purified.searchParams.get(input.name);
    //                             purified.searchParams.delete(input.name);
    //                             input.toggleAttribute("disabled", false);
    //                         } else {
    //                             input.value = "";
    //                             input.toggleAttribute("disabled", true);
    //                             if (submitter === input) submitter = undefined;
    //                         }
    //                     }
    //                 }
    //                 for (const [key, value] of purified.searchParams) {
    //                     const input = document.createElement("input");
    //                     input.type = "hidden";
    //                     input.name = key;
    //                     input.value = value;
    //                     form.appendChild(input);
    //                 }
    //             } else {
    //                 this.toast(`Same: "${form.action}"`);
    //             }
    //             form.toggleAttribute(tag2, true);
    //             form.removeAttribute(tag1);
    //             form.dispatchEvent(new Event(eventName, { bubbles: false, cancelable: true }));
    //             form.requestSubmit(submitter);
    //         });
    //     }
    // }
    // const submitHook = new Hook("submit");
    // submitHook.handler = submitHandler.bind(submitHook);
    // submitHook.enable = async function () {
    //     document.addEventListener("submit", this.handler, { capture: true });
    // }
    // submitHook.disable = async function () {
    //     document.removeEventListener("submit", this.handler, { capture: true });
    // }
    // Intercept window.open
    const openHook = new Hook("window.open");
    openHook.original = window.open.bind(window);
    openHook.patched = function (url, target, features) { // Intercept window.open
        if (url && url !== "about:blank" && (url.startsWith("http://") || url.startsWith("https://"))) {
            this.toast(`Intercepted: "${url}"`);
            purifier.purify(url).then(purified => {
                this.toast(`Processed: "${purified.url}"`);
                this.original(purified.url, target, features);
            });
            return true; // Ideally, return a window object; however, it's impossible to do so
        } else {
            return this.original(url, target, features);
        }
    }.bind(openHook);
    openHook.enable = async function () {
        window.open = this.patched;
    }
    openHook.disable = async function () {
        window.open = this.original;
    }
    function patch(orig) { // Patch history functions
        function patched(...args) {
            const url = args[2];
            if (url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//") || url.startsWith("/") || url.startsWith("?"))) {
                this.toast(`Intercepted: "${url}"`);
                const resolved = new URL(url, location.href).href;
                purifier.purify(resolved).then(purified => {
                    this.toast(`Processed: "${purified.url}"`);
                    args[2] = purified.url;
                    orig.apply(history, args);
                });
            } else {
                orig.apply(history, args);
            }
        }
        return patched;
    }
    const pushStateHook = new Hook("pushState");
    pushStateHook.original = history.pushState;
    pushStateHook.patched = patch(pushStateHook.original).bind(pushStateHook);
    pushStateHook.enable = async function () {
        history.pushState = pushStateHook.patched;
    }
    pushStateHook.disable = async function () {
        history.pushState = pushStateHook.original;
    }
    const replaceStateHook = new Hook("replaceState");
    replaceStateHook.original = history.replaceState;
    replaceStateHook.patched = patch(replaceStateHook.original).bind(replaceStateHook);
    replaceStateHook.enable = async function () {
        history.replaceState = replaceStateHook.patched;
    }
    replaceStateHook.disable = async function () {
        history.replaceState = replaceStateHook.original;
    }
    // Site-specific hooks
    switch (location.hostname) {
        case "www.bing.com":
        case "cn.bing.com": { // Bing
            // Hook `addEventListener`
            const bingHook = new Hook("cn.bing.com");
            bingHook.blacklist = { "A": new Set(["mouseenter", "mouseleave", "mousedown"]), "P": new Set(["mouseover", "mouseout", "click"]) }
            bingHook.original = HTMLElement.prototype.addEventListener;
            bingHook.patched = function (type, listener, options) {
                if (bingHook.blacklist[this.tagName] && bingHook.blacklist[this.tagName].has(type)) { // Block events
                    return;
                }
                return bingHook.original.call(this, type, listener, options);
            };
            bingHook.enable = async function () {
                HTMLElement.prototype.addEventListener = bingHook.patched;
            }
            bingHook.disable = async function () {
                HTMLElement.prototype.addEventListener = bingHook.original;
            }
            break;
        }
        default: {
            break;
        }
    }
    // Is there more hooks to add?
    // Enable hooks
    const promises = [];
    const hooksCfg = GM_getValue("hooks", {
        "location.href": true,
        "click": true,
        "mousedown": true,
        "auxclick": true,
        "touchstart": true,
        "window.open": true,
        "pushState": false,
        "replaceState": false,
        "cn.bing.com": true
    }); // Load hook configs
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
        log(`[core ${Purlfy.version}] Initialized successfully! 🎉`);
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
        const text = Object.entries(statistics).map(([key, value]) => `${key}: ${value}`).join(", ") + `\npURLfy core version: ${Purlfy.version}`;
        const r = confirm(text + "\nDo you want to reset the statistics?");
        if (!r) return;
        GM_setValue("statistics", initStatistics);
        log("Statistics reset.");
    };
    GM_registerMenuCommand("Show Statistics", showStatistics);
})();
