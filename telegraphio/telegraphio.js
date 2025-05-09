// ==UserScript==
// @name         Telegraphio
// @name:zh-CN   Telegraphio
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Various enhancements for Telegraph
// @description:zh-CN 对 Telegraph 的各种增强
// @tag          productivity
// @author       PRO-2684
// @match        https://telegra.ph/*
// @run-at       document-end
// @icon         https://telegra.ph/images/favicon_2x.png
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

(function () {
    const { name, version } = GM_info.script;
    const $ = document.querySelector.bind(document);
    const debug = console.debug.bind(console, `[${name}@${version}]`);
    const error = console.error.bind(console, `[${name}@${version}]`);

    const configDesc = {
        "$default": {
            autoClose: false
        },
        mdPlus: {
            name: "Markdown +",
            title: "Enable extended Markdown support",
            type: "bool",
        },
        formatPlus: {
            name: "Format +",
            title: "Enable extended format support",
            type: "bool",
        },
        shortcutPlus: {
            name: "Shortcut +",
            title: "Enable extended shortcut support",
            type: "bool",
        },
    };
    const config = new GM_config(configDesc);

    const { quill, Quill } = unsafeWindow;
    if (!quill || !Quill) {
        error("Quill not found");
        return;
    }
    debug("Quill found");

    if (config.get("mdPlus")) {
        // Helper function for prefix-based bindings
        function addPrefixBinding(prefixRegex, formatName) {
            quill.keyboard.addBinding({
                key: " ",
                prefix: prefixRegex,
            }, function (range, context) {
                const prefixLength = context.prefix.length;
                const position = range.index - prefixLength;
                this.quill.scroll.deleteAt(position, prefixLength);
                this.quill.formatLine(position, 1, formatName, true, Quill.sources.USER);
                this.quill.setSelection(position, Quill.sources.SILENT);
            });
        }
        // Header (`# `)
        addPrefixBinding(/^#$/, "blockHeader");
        // Sub header (`## `)
        addPrefixBinding(/^##$/, "blockSubheader");
        // Quote (`> `)
        addPrefixBinding(/^>$/, "blockBlockquote");

        // TODO: Bold & italic (& Underline?)
        // **Bold**, *Italic*

        // TODO: Link
        // [Link](https://example.com)
    }
    if (config.get("formatPlus")) {
        // Strikethrough
        quill.keyboard.addBinding({
            key: "X",
            shortKey: true,
            shiftKey: true,
        }, function (range, context) {
            this.quill.formatText(range.index, range.length, "strike", true, Quill.sources.USER);
        });
    }
    if (config.get("shortcutPlus")) {
        //  Helper function for pasting link into text
        function applyLinkToSelection(delta, link) {
            const selection = quill.selection.savedRange;
            if (link && selection?.length) {
                const text = quill.getText(selection.index, selection.length);
                delta.ops.pop();
                delta.insert(text, { link });
            }
            return delta;
        }

        // For plain text links
        const linkRegex = /^((?:https?|tg):\/\/\S+|www\.\S+)$/;
        quill.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {
            const pasted = delta.ops.at(-1)?.insert;
            const match = pasted?.match(linkRegex);
            return match ? applyLinkToSelection(delta, match[0]) : delta;
        });

        // For HTML anchor elements
        quill.clipboard.addMatcher("A", function (node, delta) {
            const link = delta.ops.at(-1)?.attributes?.link;
            return applyLinkToSelection(delta, link);
        });
    }
})();
