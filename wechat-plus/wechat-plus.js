// ==UserScript==
// @name         WeChat Plus
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  针对微信公众号文章的增强脚本
// @author       PRO-2684
// @match        https://mp.weixin.qq.com/s/*
// @run-at       document-start
// @icon         https://res.wx.qq.com/a/wx_fed/assets/res/MjliNWVm.svg
// @license      gpl-3.0
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://github.com/PRO-2684/GM_config/releases/download/v1.2.2/config.min.js#md5=c45f9b0d19ba69bb2d44918746c4d7ae
// ==/UserScript==

(function () {
    'use strict';
    const { name, version } = GM_info.script;
    const idPrefix = "wechat-plus-";
    const $ = document.querySelector.bind(document);
    const debug = console.debug.bind(console, `[${name}@${version}]`);
    const error = console.error.bind(console, `[${name}@${version}]`);
    const configDesc = {
        $default: {
            autoClose: false,
        },
        viewCover: {
            name: "🖼️ 查看封面",
            title: "在新标签页中打开封面",
            type: "action",
        },
        showSummary: {
            name: "📄 显示摘要",
            type: "bool",
        },
        allowCopy: {
            name: "📋 允许复制",
            title: "允许复制所有内容",
            type: "bool",
        },
        hideBottomBar: {
            name: "⬇️ 隐藏底栏",
            title: "隐藏毫无作用的底栏",
            type: "bool",
        },
        blockReport: {
            name: "🚫 屏蔽上报*",
            title: "屏蔽信息上报，避免隐私泄露，需要刷新页面生效",
            type: "bool",
        },
    };
    const config = new GM_config(configDesc);

    // Helper functions
    /**
     * Resolves when the document is ready.
     */
    async function onReady() {
        return new Promise((resolve) => {
            if (document.readyState === "complete") {
                resolve();
            } else {
                document.addEventListener("DOMContentLoaded", () => {
                    resolve();
                }, { once: true });
            }
        });
    }
    /**
     * Toggles the given style on or off.
     */
    function toggleStyle(id, toggle) {
        const existing = document.getElementById(idPrefix + id);
        if (existing && !toggle) {
            existing.remove();
        } else if (!existing && toggle) {
            const styleElement = document.createElement("style");
            styleElement.id = idPrefix + id;
            styleElement.textContent = styles[id];
            document.head.appendChild(styleElement);
        }
    }

    // Main functions
    function viewCover() {
        const meta = $("meta[property='og:image']");
        const url = meta?.content;
        if (url) {
            window.open(url, "_blank");
        } else {
            alert("Cannot find cover image URL.");
        }
    }
    function showSummary(show) {
        const block = $("#meta_content");
        if (!block) {
            error("Cannot find meta content block.");
            return;
        }
        const summary = block.querySelector("#summary");
        if (summary && !show) {
            summary.remove();
        } else if (!summary && show) {
            const meta = $("meta[name='description']");
            const description = meta?.content;
            if (!description) {
                error("Cannot find summary description.");
                return;
            }
            const summary = document.createElement("span");
            summary.id = "summary";
            summary.style.display = "block";
            summary.style.borderLeft = "0.2em solid";
            summary.style.paddingLeft = "0.5em";
            summary.classList.add("rich_media_meta", "rich_media_meta_text");
            summary.textContent = description;
            block.appendChild(summary);
        }
    }
    function allowCopy(allow) {
        const body = document.body;
        body.classList.toggle("use-femenu", !allow);
    }
    const hideBottomBar = "#unlogin_bottom_bar { display: none !important; }" +
        "body#activity-detail { padding-bottom: 0 !important; }";
    function blockReport() {
        function shouldBlock(url) {
            const blockList = new Set([
                // Additional info, like albums, etc.
                // "mp.weixin.qq.com/mp/getappmsgext",

                // CSP report, can't be blocked by UserScript - Use [uBlock Origin](https://github.com/gorhill/uBlock) to block it
                // "mp.weixin.qq.com/mp/fereport",

                // Will return error anyway (errmsg: "no session")
                "mp.weixin.qq.com/mp/appmsg_comment",
                "mp.weixin.qq.com/mp/relatedsearchword",
                "mp.weixin.qq.com/mp/getbizbanner",
                // Information collection
                "mp.weixin.qq.com/mp/getappmsgad",
                "mp.weixin.qq.com/mp/jsmonitor",
                "mp.weixin.qq.com/mp/wapcommreport",
                "mp.weixin.qq.com/mp/appmsgreport",
                "badjs.weixinbridge.com/badjs",
                "badjs.weixinbridge.com/report",
                "open.weixin.qq.com/pcopensdk/report",
            ]);
            url = new URL(url, location.href);
            const identifier = url.hostname + url.pathname;
            return blockList.has(identifier);
        }
        // Overwrite `XMLHttpRequest`
        const originalOpen = unsafeWindow.XMLHttpRequest.prototype.open;
        unsafeWindow.XMLHttpRequest.prototype.open = function (...args) {
            const url = args[1];
            if (shouldBlock(url)) {
                debug("Blocked opening:", url);
                this._url = url;
            } else {
                return originalOpen.apply(this, args);
            }
        }
        const originalSet = unsafeWindow.XMLHttpRequest.prototype.setRequestHeader;
        unsafeWindow.XMLHttpRequest.prototype.setRequestHeader = function (...args) {
            if (this._url) {
                debug("Blocked setting header:", this._url, ...args);
            } else {
                return originalSet.apply(this, args);
            }
        }
        const originalSend = unsafeWindow.XMLHttpRequest.prototype.send;
        unsafeWindow.XMLHttpRequest.prototype.send = function (...args) {
            if (this._url) {
                debug("Blocked sending:", this._url, ...args);
            } else {
                return originalSend.apply(this, args);
            }
        }
        // Filter setting `src` of images
        const { get, set } = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
        Object.defineProperty(HTMLImageElement.prototype, "src", {
            get() {
                return get.call(this);
            },
            set(url) {
                if (shouldBlock(url)) {
                    debug("Blocked image url:", url);
                    return url;
                } else {
                    return set.call(this, url);
                }
            },
        });
    }

    // Once: Functions that are called once when the script is loaded.
    if (config.get("blockReport")) {
        blockReport();
    }

    // Actions: Functions that are called when the user clicks on it.
    const actions = {
        viewCover,
    };
    config.addEventListener("get", (e) => {
        const action = actions[e.detail.prop];
        if (action) {
            action();
        }
    });

    // Callbacks: Functions that are called when the config is changed.
    const callbacks = {
        showSummary,
        allowCopy,
    };
    onReady().then(() => {
        for (const [prop, callback] of Object.entries(callbacks)) {
            callback(config.get(prop));
        }
    });

    // Styles: CSS styles that can be toggled on and off.
    const styles = {
        hideBottomBar,
    };
    for (const prop of Object.keys(styles)) {
        toggleStyle(prop, config.get(prop));
    }

    config.addEventListener("set", (e) => {
        const callback = callbacks[e.detail.prop];
        if (callback) {
            onReady().then(() => {
                callback(e.detail.after);
            });
        }
        if (e.detail.prop in styles) {
            toggleStyle(e.detail.prop, e.detail.after);
        }
    });
})();

