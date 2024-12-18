// ==UserScript==
// @name         百度翻译 Plus
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  一系列针对百度翻译的功能增强
// @author       PRO-2684
// @run-at       document-end
// @match        https://fanyi.baidu.com/*
// @icon         https://fanyi.baidu.com/favicon.ico
// @license      gpl-3.0
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://update.greasyfork.org/scripts/470224/1498964/Tampermonkey%20Config.js
// ==/UserScript==

(function() {
    'use strict';
    const configDesc = {
        $default: {
            autoClose: false,
        },
        allowTextDrop: {
            name: "允许文本拖拽",
            title: "允许拖拽文本到输入框",
            type: "bool",
            value: true,
        },
        textDropReplace: {
            name: "文本拖拽替换",
            title: "拖拽文本到输入框时替换原有文本，否则追加",
            type: "bool",
            value: true,
        },
        debug: {
            name: "调试模式",
            title: "启用调试模式",
            type: "bool",
            value: false,
        }
    };
    const config = new GM_config(configDesc);
    const panel = document.querySelector(".translate-main > .trans-left");
    const wrap = panel.querySelector(".trans-input-wrap");
    const textarea = panel.querySelector("textarea");
    function hasFile(e) {
        for (const item of e.dataTransfer.items) {
            if (item.kind === "file") {
                return true;
            }
        }
        return false;
    }
    function handleDrop(e) {
        if (e.dataTransfer.items.length === 0 || hasFile(e) || !panel) {
            return; // No text or has file or not ready - ignore
        }

        // Stop baidu from processing the real drop
        e.stopPropagation();
        // Dispatch events to fake the drop
        wrap.dispatchEvent(new DragEvent("dragleave", {
            bubbles: true,
        }));

        // Set the text
        const text = e.dataTransfer.getData("text");
        if (config.get("textDropReplace")) {
            textarea.value = text;
        } else {
            textarea.value += text;
        }
        // Notify the change
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
    let textDropAllowed = false;
    function allowTextDrop(allow) {
        if (textDropAllowed && !allow) {
            panel.removeEventListener("drop", handleDrop, { capture: true });
        } else if (!textDropAllowed && allow) {
            panel.addEventListener("drop", handleDrop, { capture: true });
        }
    }
    function setDebug(debug) {
        config.debug = debug;
    }
    const callbacks = {
        allowTextDrop,
        debug: setDebug,
    };
    for (const [prop, callback] of Object.entries(callbacks)) {
        callback(config.get(prop));
    }
    config.addEventListener("set", (e) => {
        const callback = callbacks[e.detail.prop];
        if (callback) {
            callback(e.detail.after);
        }
    })
})();
