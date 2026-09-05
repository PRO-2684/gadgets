// ==UserScript==
// @name         Noop Scroll
// @namespace    http://tampermonkey.net/
// @version      0.2.0
// @description  NiceScroll compatibility with native scrolling
// @author       PRO-2684
// @match        none
// @run-at       document-start
// @license      gpl-3.0
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    const { name, version } = GM_info.script;
    const debug = console.debug.bind(console, `[${name}@${version}]`);
    const warn = console.warn.bind(console, `[${name}@${version}]`);
    const installed = new WeakSet();

    // Ordinary plugin assignments must succeed, including in strict mode,
    // while callers continue to receive our replacement.
    function retain(object, key, value) {
        Object.defineProperty(object, key, {
            configurable: true,
            enumerable: true,
            get: () => value,
            set() {},
        });
    }

    function install($) {
        if (typeof $ !== "function" || !$.fn?.jquery || installed.has($.fn)) return;
        const DATA_KEY = "__nicescroll";

        function Collection(instances = []) {
            this.length = 0;
            Array.prototype.push.apply(this, instances);
        }
        Collection.prototype.name = "nicescrollarray";
        Collection.prototype.push = Array.prototype.push;
        Collection.prototype.eq = function (index) { return this[index]; };
        Collection.prototype.each = function (callback) {
            // Snapshot because remove() also changes the global collection.
            for (const [index, instance] of Array.from(this).entries()) {
                if (callback.call(instance, index, instance) === false) break;
            }
            return this;
        };
        for (const method of ["show", "hide", "toggle", "onResize", "resize", "remove", "stop", "doScrollPos"]) {
            Collection.prototype[method] = function (...args) {
                return this.each(function () { this[method](...args); });
            };
        }

        const registry = new Collection();
        registry.options = { ...$.nicescroll?.options };
        // Best effort when installed late: use the library's own teardown.
        for (const instance of Array.from($.nicescroll || [])) instance.remove?.();

        function makeInstance(target, wrapper, options) {
            const opt = { ...registry.options, ...options };
            let doc = $(wrapper || opt.doc || target);
            if (wrapper && doc.length > 1) doc = $(wrapper, target);
            const win = $(opt.win || (wrapper || opt.doc ? target : doc));
            opt.doc = doc;
            opt.win = win;
            const viewport = win[0];
            const ispage = viewport === unsafeWindow || viewport === document ||
                viewport === document.body || viewport === document.documentElement;
            const scroller = () => ispage ? document.scrollingElement || document.documentElement : viewport;
            const restored = [];
            // ponytail: repair only recognized containers, never global CSS rules.
            for (const element of new Set(ispage ? [document.documentElement, document.body] : [viewport])) {
                if (!element?.style) continue;
                const computed = unsafeWindow.getComputedStyle(element);
                for (const property of ["overflow-x", "overflow-y"]) {
                    const overflow = computed.getPropertyValue(property);
                    if (!["hidden", "clip"].includes(overflow) && (ispage || overflow !== "visible")) continue;
                    restored.push([element, property, element.style.getPropertyValue(property), element.style.getPropertyPriority(property)]);
                    element.style.setProperty(property, "auto", "important");
                }
            }
            const instance = {
                name: "nicescroll", version, me: $(target), doc, win, opt,
                ispage, ishwscroll: false,
                getScrollTop() { return scroller()?.scrollTop || 0; },
                getScrollLeft() { return scroller()?.scrollLeft || 0; },
                setScrollTop(y) { return this.doScrollTop(y); },
                setScrollLeft(x) { return this.doScrollLeft(x); },
                doScrollTop(y) { return this.doScrollPos(this.getScrollLeft(), y); },
                doScrollLeft(x) { return this.doScrollPos(x, this.getScrollTop()); },
                doScrollPos(x, y) {
                    scroller()?.scrollTo({ left: x, top: y, behavior: "instant" });
                    return this;
                },
                remove() {
                    if ($.data(target, DATA_KEY) !== this) return this;
                    $.removeData(target, DATA_KEY);
                    const index = Array.prototype.indexOf.call(registry, this);
                    if (index !== -1) Array.prototype.splice.call(registry, index, 1);
                    for (const [element, property, value, priority] of restored) {
                        if (element.style.getPropertyValue(property) === "auto" &&
                            element.style.getPropertyPriority(property) === "important") {
                            element.style.setProperty(property, value, priority);
                        }
                    }
                    return this;
                },
            };
            for (const method of ["show", "hide", "toggle", "onResize", "resize", "stop", "hideCursor", "showCursor"]) {
                instance[method] = function () { return this; };
            }
            registry.push(instance);
            $.data(target, DATA_KEY, instance);
            return instance;
        }

        retain($.fn, "niceScroll", function (wrapper, options) {
            if (wrapper && typeof wrapper === "object" && !wrapper.jquery && !wrapper.nodeType && wrapper !== unsafeWindow) {
                options = wrapper;
                wrapper = null;
            }
            const result = new Collection();
            this.each(function () {
                result.push($.data(this, DATA_KEY) || makeInstance(this, wrapper, options));
            });
            return result.length === 1 ? result[0] : result;
        });
        retain($.fn, "getNiceScroll", function (index) {
            if (index !== undefined) return this[index] && $.data(this[index], DATA_KEY) || false;
            const result = new Collection();
            this.each(function () {
                const instance = $.data(this, DATA_KEY);
                if (instance) result.push(instance);
            });
            return result;
        });
        retain($, "nicescroll", registry);
        const pseudos = $.expr.pseudos || $.expr[":"];
        pseudos.nicescroll = element => $.data(element, DATA_KEY) !== undefined;
        installed.add($.fn);
        debug("Native NiceScroll adapter installed");
    }

    function tryInstall(value) {
        try { install(value); } catch (error) { warn("Could not install NiceScroll adapter", error); }
    }
    function probe() {
        tryInstall(unsafeWindow.jQuery);
        tryInstall(unsafeWindow.$);
    }
    for (const key of ["jQuery", "$"]) {
        const descriptor = Object.getOwnPropertyDescriptor(unsafeWindow, key);
        let value = unsafeWindow[key];
        tryInstall(value);
        // Respect existing accessors and non-configurable globals. Script load
        // events below provide best-effort discovery for those cases.
        if (descriptor && (!descriptor.configurable || descriptor.get || descriptor.set || !descriptor.writable)) continue;
        Object.defineProperty(unsafeWindow, key, {
            configurable: true,
            enumerable: descriptor?.enumerable ?? true,
            get: () => value,
            set(next) { value = next; tryInstall(next); },
        });
    }

    // No subtree observation. Document/html discover roots; head/body discover
    // direct script children. Observers detect opportunities, not cancel loads.
    const watched = new WeakSet();
    const observer = new MutationObserver(() => { watchRoots(); probe(); });
    function watchRoots() {
        for (const root of [document, document.documentElement, document.head, document.body]) {
            if (!root || watched.has(root)) continue;
            watched.add(root);
            observer.observe(root, { childList: true });
            if (root === document.head || root === document.body) {
                root.addEventListener("load", event => {
                    if (event.target.tagName === "SCRIPT" && event.target.parentNode === root) probe();
                }, true);
            }
        }
    }
    watchRoots();
    document.addEventListener("DOMContentLoaded", () => { watchRoots(); probe(); }, { once: true });
})();
