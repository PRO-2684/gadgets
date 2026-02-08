// ==UserScript==
// @name         pURLfy for Tampermonkey
// @name:zh-CN   pURLfy for Tampermonkey
// @namespace    http://tampermonkey.net/
// @version      0.5.8
// @description  The ultimate URL purifier - for Tampermonkey
// @description:zh-cn 终极 URL 净化器 - Tampermonkey 版本
// @icon         https://github.com/PRO-2684/pURLfy/raw/main/images/logo.svg
// @author       PRO
// @match        *://*/*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @grant        GM_getResourceText
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      *
// @require      https://cdn.jsdelivr.net/npm/@trim21/gm-fetch@0.3.0
// @require      https://update.greasyfork.org/scripts/492078/1499254/pURLfy.js
// @require      https://github.com/PRO-2684/GM_config/releases/download/v1.2.2/config.min.js#md5=c45f9b0d19ba69bb2d44918746c4d7ae
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
    const window = unsafeWindow;
    const configDesc = {
        $default: {
            autoClose: false,
        },
        rules: {
            name: "📖 Rules Settings",
            title: "Enable or disable rules",
            type: "folder",
            items: {
                tracking: {
                    name: "Tracking",
                    title: "Rules for purifying tracking links",
                    type: "bool",
                    value: true,
                },
                outgoing: {
                    name: "Outgoing",
                    title: "Rules for purifying outgoing links",
                    type: "bool",
                    value: true,
                },
                shortener: {
                    name: "Shortener",
                    title: "Rules for restoring shortened links",
                    type: "bool",
                    value: true,
                },
                alternative: {
                    name: "Alternative",
                    title: "Redirects you from some websites to their better alternatives",
                    type: "bool",
                    value: false,
                },
                other: {
                    name: "Other",
                    title: "Rules for purifying other types of links",
                    type: "bool",
                    value: false,
                },
                removeTextFragment: {
                    name: "Remove Text Fragment",
                    title: "Remove Text Fragments from URL",
                    type: "bool",
                    value: false,
                },
            },
        },
        hooks: {
            name: "🪝 Hooks Settings",
            title: "Enable or disable hooks",
            type: "folder",
            items: {
                locationHref: {
                    name: "location.href",
                    title: "Check location.href",
                    type: "bool",
                    value: true,
                },
                click: {
                    name: "click",
                    title: "Intercept `click` events",
                    type: "bool",
                    value: true,
                },
                mousedown: {
                    name: "mousedown",
                    title: "Intercept `mousedown` events",
                    type: "bool",
                    value: true,
                },
                auxclick: {
                    name: "auxclick",
                    title: "Intercept `auxclick` events",
                    type: "bool",
                    value: true,
                },
                touchstart: {
                    name: "touchstart",
                    title: "Intercept `touchstart` events",
                    type: "bool",
                    value: true,
                },
                windowOpen: {
                    name: "window.open",
                    title: "Hook `window.open` calls",
                    type: "bool",
                    value: true,
                },
                pushState: {
                    name: "pushState",
                    title: "Hook `history.pushState` calls",
                    type: "bool",
                    value: false,
                },
                replaceState: {
                    name: "replaceState",
                    title: "Hook `history.replaceState` calls",
                    type: "bool",
                    value: false,
                },
                bing: {
                    name: "Bing",
                    title: "Site-specific hook for Bing, seems to be unnecessary for now",
                    type: "bool",
                    value: false,
                },
            },
        },
        statistics: {
            name: "📊 Statistics",
            title: "Show statistics",
            type: "folder",
            items: {
                $default: {
                    input: (prop, orig) =>
                        confirm(`Reset "${prop}"?`) ? 0 : orig,
                    processor: "same",
                    formatter: "normal",
                },
                url: {
                    name: "URL",
                    title: "Number of links purified",
                    value: 0,
                },
                param: {
                    name: "Parameter",
                    title: "Number of parameters removed",
                    value: 0,
                },
                decoded: {
                    name: "Decoded",
                    title: "Number of URLs decoded (`param` mode)",
                    value: 0,
                },
                redirected: {
                    name: "Redirected",
                    title: "Number of URLs redirected (`redirect` mode)",
                    value: 0,
                },
                visited: {
                    name: "Visited",
                    title: "Number of URLs visited (`visit` mode)",
                    value: 0,
                },
                char: {
                    name: "Character",
                    title: "Number of characters deleted",
                    value: 0,
                },
            },
        },
        advanced: {
            name: "⚙️ Advanced options",
            title: "Advanced options",
            type: "folder",
            items: {
                purify: {
                    name: "Purify URL",
                    title: "Manually purify a URL",
                    type: "action",
                },
                senseless: {
                    name: "Senseless Mode",
                    title: "Enable senseless mode",
                    type: "bool",
                    value: true,
                },
                disableBeacon: {
                    name: "Disable Beacon",
                    title: "Overwrite `navigator.sendBeacon` to a no-op function",
                    type: "bool",
                    value: false,
                },
                debug: {
                    name: "Debug Mode",
                    title: "Enable debug mode",
                    type: "bool",
                    value: false,
                },
            },
        },
    };
    const config = new GM_config(configDesc);
    function log(...args) {
        if (config.get("advanced.debug"))
            console.log("[pURLfy for Tampermonkey]", ...args);
    }
    // Initialize pURLfy core
    const purifier = new Purlfy({
        fetchEnabled: true,
        lambdaEnabled: true,
        fetch: GM_fetch,
        log: config.get("advanced.debug") ? undefined : () => {},
    });
    async function purify(url) {
        if (config.get("rules.removeTextFragment")) {
            // Remove Text Fragment
            const index = url.indexOf("#:~:");
            if (index !== -1) url = url.slice(0, index);
        }
        return purifier.purify(url);
    }
    // Import rules
    for (const key of config.list("rules")) {
        const enabled = config.get(`rules.${key}`);
        if (enabled) {
            log(`Importing rules: ${key}`);
            const rules = JSON.parse(GM_getResourceText(`rules-${key}`));
            purifier.importRules(rules);
        }
    }
    // Senseless mode
    const senseless = config.get("advanced.senseless");
    log(`Senseless mode is ${senseless ? "enabled" : "disabled"}.`);
    // Statistics listener
    purifier.addEventListener("statisticschange", (e) => {
        log("Statistics increment:", e.detail);
        for (const [key, increment] of Object.entries(e.detail)) {
            config.set(
                `statistics.${key}`,
                config.get(`statistics.${key}`) + increment,
            );
        }
    });
    // Hooks
    const hooks = [];
    class Hook {
        // Dummy class for hooks
        name;
        enabled;
        constructor(name) {
            // Register a hook
            this.name = name;
            // hooks.set(name, this);
            hooks.push(this);
            this.enabled = config.get(`hooks.${name}`);
        }
        toast(content) {
            // Indicate that a URL has been intercepted
            log(`Hook "${this.name}": ${content}`);
        }
        async enable() {
            // Enable the hook
            throw new Error("Over-ride me!");
        }
        async disable() {
            // Disable the hook
            throw new Error("Over-ride me!");
        }
    }
    // Check location.href (not really a hook, actually)
    const locationHook = new Hook("locationHref");
    locationHook.enable = async function () {
        // Intercept location.href
        const original = location.href;
        const purified = (await purify(original)).url;
        if (original !== purified) {
            this.toast(`Redirect: "${original}" -> "${purified}"`);
            if (senseless) {
                history.replaceState(null, "", purified);
            } else {
                window.stop(); // Stop loading
                location.replace(purified);
            }
        }
    }.bind(locationHook);
    locationHook.disable = async function () {}; // Do nothing
    // Mouse-related hooks
    const tagNames = new Set(["A", "AREA"]);
    function cloneAndStop(e) {
        // Clone an event and stop the original
        const newEvt = new e.constructor(e.type, e);
        e.preventDefault();
        e.stopImmediatePropagation();
        return newEvt;
    }
    async function mouseHandler(e) {
        // Intercept mouse events
        const ele = e.composedPath().find((ele) => tagNames.has(ele.tagName));
        if (
            ele &&
            !ele.hasAttribute(tag2) &&
            ele.href &&
            !ele.getAttribute("href").startsWith("#")
        ) {
            ele.removeAttribute("ping"); // Remove `ping` attribute
            const href = ele.href;
            if (!href.startsWith("https://") && !href.startsWith("http://"))
                return; // Ignore non-HTTP(S) URLs
            if (!ele.hasAttribute(tag1)) {
                // The first to intercept
                ele.toggleAttribute(tag1, true);
                const newEvt = senseless ? null : cloneAndStop(e);
                this.toast(`Intercepted: "${href}"`);
                const purified = await purify(href);
                if (purified.url !== href) {
                    ele.href = purified.url;
                    // if (ele.innerHTML === href) ele.innerHTML = purified.url; // Update the text
                    if (
                        ele.childNodes?.length === 1 &&
                        ele.firstChild.nodeType === Node.TEXT_NODE &&
                        ele.firstChild.textContent === href
                    ) {
                        // Update the text
                        ele.firstChild.textContent = purified.url;
                    }
                    this.toast(`Processed: "${ele.href}"`);
                } else {
                    this.toast(`Same: "${ele.href}"`);
                }
                ele.toggleAttribute(tag2, true);
                ele.removeAttribute(tag1);
                senseless || ele.dispatchEvent(newEvt);
                ele.dispatchEvent(
                    new Event(eventName, { bubbles: false, cancelable: true }),
                );
            } else {
                // Someone else has intercepted
                if (!senseless) {
                    const newEvt = cloneAndStop(e);
                    this.toast(`Waiting: "${ele.href}"`);
                    ele.addEventListener(
                        eventName,
                        function () {
                            log(`Waited: "${ele.href}"`);
                            ele.dispatchEvent(newEvt);
                        },
                        { once: true },
                    );
                }
            }
        }
    }
    ["click", "mousedown", "auxclick"].forEach((name) => {
        const hook = new Hook(name);
        hook.handler = mouseHandler.bind(hook);
        hook.enable = async function () {
            document.addEventListener(name, this.handler, { capture: true });
        };
        hook.disable = async function () {
            document.removeEventListener(name, this.handler, { capture: true });
        };
    });
    // Listen to `touchstart` event
    async function touchstartHandler(e) {
        // Always "senseless"
        const ele = e.composedPath().find((ele) => tagNames.has(ele.tagName));
        if (
            ele &&
            !ele.hasAttribute(tag1) &&
            !ele.hasAttribute(tag2) &&
            ele.href &&
            !ele.getAttribute("href").startsWith("#")
        ) {
            ele.removeAttribute("ping"); // Remove `ping` attribute
            const href = ele.href;
            if (!href.startsWith("https://") && !href.startsWith("http://"))
                return; // Ignore non-HTTP(S) URLs
            ele.toggleAttribute(tag1, true);
            this.toast(`Intercepted: "${href}"`);
            const purified = await purify(href);
            if (purified.url !== href) {
                ele.href = purified.url;
                if (ele.innerHTML === href) ele.innerHTML = purified.url; // Update the text
                this.toast(`Processed: "${ele.href}"`);
            } else {
                this.toast(`Same: "${ele.href}"`);
            }
            ele.toggleAttribute(tag2, true);
            ele.removeAttribute(tag1);
            ele.dispatchEvent(
                new Event(eventName, { bubbles: false, cancelable: true }),
            );
        }
    }
    const touchstartHook = new Hook("touchstart");
    touchstartHook.handler = touchstartHandler.bind(touchstartHook);
    touchstartHook.enable = async function () {
        document.addEventListener("touchstart", this.handler, {
            capture: true,
        });
    };
    touchstartHook.disable = async function () {
        document.removeEventListener("touchstart", this.handler, {
            capture: true,
        });
    };
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
    //         purify(url.href).then(result => {
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
    const openHook = new Hook("windowOpen");
    openHook.original = window.open.bind(window);
    openHook.patched = function (url, target, features) {
        // Intercept window.open
        url = url?.toString() ?? "about:blank";
        if (
            url &&
            url !== "about:blank" &&
            (url.startsWith("http://") || url.startsWith("https://"))
        ) {
            this.toast(`Intercepted: "${url}"`);
            purify(url).then((purified) => {
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
    };
    openHook.disable = async function () {
        window.open = this.original;
    };
    function patch(orig) {
        // Patch history functions
        function patched(...args) {
            const url = args[2];
            if (
                url &&
                (url.startsWith("http://") ||
                    url.startsWith("https://") ||
                    url.startsWith("//") ||
                    url.startsWith("/") ||
                    url.startsWith("?"))
            ) {
                this.toast(`Intercepted: "${url}"`);
                const resolved = new URL(url, location.href).href;
                purify(resolved).then((purified) => {
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
    };
    pushStateHook.disable = async function () {
        history.pushState = pushStateHook.original;
    };
    const replaceStateHook = new Hook("replaceState");
    replaceStateHook.original = history.replaceState;
    replaceStateHook.patched = patch(replaceStateHook.original).bind(
        replaceStateHook,
    );
    replaceStateHook.enable = async function () {
        history.replaceState = replaceStateHook.patched;
    };
    replaceStateHook.disable = async function () {
        history.replaceState = replaceStateHook.original;
    };
    // Site-specific hooks
    switch (location.hostname) {
        case "www.bing.com":
        case "cn.bing.com": {
            // Bing
            // Hook `addEventListener`
            const bingHook = new Hook("bing");
            bingHook.blacklist = {
                A: new Set(["mouseenter", "mouseleave", "mousedown"]),
                P: new Set(["mouseover", "mouseout", "click"]),
            };
            bingHook.original = HTMLElement.prototype.addEventListener;
            bingHook.patched = function (type, listener, options) {
                if (
                    bingHook.blacklist[this.tagName] &&
                    bingHook.blacklist[this.tagName].has(type)
                ) {
                    // Block events
                    return;
                }
                return bingHook.original.call(this, type, listener, options);
            };
            bingHook.enable = async function () {
                HTMLElement.prototype.addEventListener = bingHook.patched;
            };
            bingHook.disable = async function () {
                HTMLElement.prototype.addEventListener = bingHook.original;
            };
            break;
        }
        default: {
            break;
        }
    }
    // Is there more hooks to add?
    // Enable hooks
    const promises = [];
    for (const hook of hooks) {
        hook.enabled &&
            promises.push(
                hook.enable().then(() => {
                    log(`Hook "${hook.name}" enabled.`);
                }),
            );
    }
    Promise.all(promises).then(() => {
        log(`[core ${Purlfy.version}] Initialized successfully! 🎉`);
    });
    // advanced.disableBeacon
    if (config.get("advanced.disableBeacon")) {
        Object.defineProperty(navigator, "sendBeacon", {
            value: (...args) => {
                log("Blocked `navigator.sendBeacon`:", ...args);
                return false;
            },
            writable: false,
            configurable: false,
        });
    }
    // Manual purify
    function trim(url) {
        // Leave at most 100 characters
        return url.length > 100 ? url.slice(0, 100) + "..." : url;
    }
    function showPurify() {
        const url = prompt("Enter the URL to purify:", location.href);
        if (!url) return;
        purify(url).then((result) => {
            GM_setClipboard(result.url);
            alert(
                `Original: ${trim(url)}\nResult (copied): ${trim(result.url)}\nMatched rule: ${result.rule}`,
            );
        });
    }
    config.addEventListener("get", (e) => {
        if (e.detail.prop === "advanced.purify") {
            showPurify();
        }
    });
})();
