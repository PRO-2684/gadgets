// ==UserScript==
// @name         百度翻译 Plus
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  一系列针对百度翻译的功能增强
// @author       PRO-2684
// @run-at       document-start
// @match        https://fanyi.baidu.com/*
// @icon         https://fanyi.baidu.com/favicon.ico
// @license      gpl-3.0
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://update.greasyfork.org/scripts/470224/1460555/Tampermonkey%20Config.js
// ==/UserScript==

(function() {
    'use strict';
    const $ = document.querySelector.bind(document);
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
    function hasFile(e) {
        for (const item of e.dataTransfer.items) {
            if (item.kind === "file") {
                return true;
            }
        }
        return false;
    }
    function handleDrop(e) {
        const el = $(".translate-main > .trans-left");
        if (e.dataTransfer.items.length === 0 || hasFile(e) || !el) {
            return; // No text or has file or not ready - ignore
        }

        // Stop baidu from processing the real drop
        e.stopPropagation();
        // Dispatch events to fake the drop
        el.dispatchEvent(new DragEvent("drop", {
            ...e,
            dataTransfer: new DataTransfer(), // Make an empty data transfer so as to prevent infinite loop and baidu's processing
        }));

        // Set the text
        const textarea = el.querySelector("textarea");
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
            document.removeEventListener("drop", handleDrop, { capture: true });
        } else if (!textDropAllowed && allow) {
            document.addEventListener("drop", handleDrop, { capture: true });
        }
    }
    function setDebug(debug) {
        config.debug = debug;
    }
    const callbacks = {
        allowTextDrop: allowTextDrop,
        debug: setDebug,
    };
    allowTextDrop(config.get("allowTextDrop"));
    config.addEventListener("set", (e) => {
        const callback = callbacks[e.detail.prop];
        if (callback) {
            callback(e.detail.after);
        }
    })
})();
