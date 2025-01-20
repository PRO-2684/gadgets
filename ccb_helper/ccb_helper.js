// ==UserScript==
// @name         建行网银助手
// @namespace    http://tampermonkey.net/
// @version      0.1.3
// @description  中国建设银行网银助手，优化建行网银的体验
// @author       PRO-2684
// @match        https://ebanking2.ccb.com.cn/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ccb.com.cn
// @license      gpl-3.0
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://github.com/PRO-2684/GM_config/releases/download/v1.2.1/config.min.js#md5=525526b8f0b6b8606cedf08c651163c2
// ==/UserScript==

(function() {
    'use strict';
    const configDesc = {
        "$default": {
            value: true,
            input: "current",
            processor: "not",
            formatter: "boolean",
            autoClose: false
        },
        "disable-small-window": { name: "禁用小窗口", title: "不再使用小窗口打开新页面" },
    };
    const config = new GM_config(configDesc);
    const log = console.log.bind(console, "[ccb_helper]");
    // == 禁用小窗口 ==
    const originalOpen = unsafeWindow.open.bind(unsafeWindow);
    function filteredOpen(url, target, features) {
        log("Intercepted open", url, target, features);
        return originalOpen(url, target);
    };
    function disableSmallWindow(enabled) {
        if (enabled) {
            unsafeWindow.open = filteredOpen;
        } else {
            unsafeWindow.open = originalOpen;
        }
    }
    const callbacks = {
        "disable-small-window": disableSmallWindow,
    };
    for (const prop in callbacks) {
        const value = config.get(prop);
        callbacks[prop](value);
    }
    config.addEventListener("set", e => {
        const callback = callbacks[e.detail.prop];
        if (callback && (e.detail.before !== e.detail.after)) {
            callback(e.detail.after);
        }
    });
})();
