// ==UserScript==
// @name         Editio
// @name:zh-CN   Editio
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Add some extra features to inputs and textareas
// @description:zh-CN 给输入框和文本框添加一些额外功能
// @tag          productivity
// @author       PRO-2684
// @match        *://*/*
// @run-at       document-start
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @license      gpl-3.0
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://update.greasyfork.org/scripts/470224/1459364/Tampermonkey%20Config.js
// ==/UserScript==

(function () {
    const configDesc = {
        "$default": {
            autoClose: false
        },
        pairing: {
            name: "🖇️ Pairing",
            title: "Pairing brackets and quotes",
            type: "folder",
            items: {
                autoClose: {
                    name: "➕ Auto close",
                    title: "Autoclose brackets and quotes (Similar to `editor.autoClosingBrackets` in VSCode)",
                    type: "bool",
                    value: true
                },
                autoDelete: {
                    name: "➖ Auto delete",
                    title: "Remove adjacent closing quotes or brackets (Similar to `editor.autoClosingDelete` in VSCode)",
                    type: "bool",
                    value: true
                },
                autoOvertype: {
                    name: "🚫 Auto overtype",
                    title: "Type over closing brackets - won't work for pairs with the same opening and closing characters (Similar to `editor.autoClosingOvertype` in VSCode)",
                    type: "bool",
                    value: false
                },
                pairs: {
                    name: "📜 Pairs",
                    title: "A list of characters that should be paired",
                    type: "str",
                    value: "()[]{}<>\"\"''``",
                    processor: (input) => {
                        if (input.length % 2 !== 0) {
                            throw new TypeError(`The length should be even, but got ${input.length}`);
                        }
                        return input;
                    }
                }
            }
        }
    };
    const config = new GM_config(configDesc);

    // Pairing
    /**
     * Pairs of characters we should consider.
     * @type {Record<string, string>}
     */
    let pairs = {};
    /**
     * Reverse pairs of characters.
     * @type {Record<string, string>}
     */
    let reversePairs = {};
    /**
     * Handle the InputEvent of type "insertText", so as to auto close and overtype on brackets and quotes
     * @param {InputEvent} e The InputEvent.
     */
    function onInsertText(e) {
        /**
         * The input or textarea element that triggered the event.
         * @type {HTMLInputElement | HTMLTextAreaElement}
         */
        const el = e.target;
        const { selectionStart: start, selectionEnd: end, value } = el;
        if ((e.data in pairs) && config.get("pairing.autoClose")) { // The input character is paired and autoClose feature is enabled
            e.preventDefault();
            e.stopImmediatePropagation();
            const wrapped = `${e.data}${value.substring(start, end)}${pairs[e.data]}`;
            document.execCommand("insertText", false, wrapped); // Wrap the selected text with the pair
            el.setSelectionRange(start + 1, end + 1);
        } else if ((e.data in reversePairs) && (start === end) && config.get("pairing.autoOvertype")) { // The input character is a closing one, nothing selected and autoOvertype feature is enabled
            const charBefore = value.charAt(start - 1);
            const charAfter = value.charAt(start);
            if (charBefore === reversePairs[e.data] && charAfter === e.data) { // The character before the cursor is the respective opening one and the character after the cursor is the same as the input character
                e.preventDefault();
                e.stopImmediatePropagation();
                el.setSelectionRange(start + 1, start + 1); // Move the cursor to the right
            }
        }
    }
    /**
     * Handle the InputEvent of type "deleteContentBackward", so as to auto delete the adjacent right bracket or quote
     * @param {InputEvent} e The InputEvent.
     */
    function onBackspace(e) {
        const el = e.target;
        const { selectionStart: start, selectionEnd: end, value } = el;
        if (start === end && start > 0 && end < value.length) {
            const charBefore = value.charAt(start - 1);
            const charAfter = value.charAt(start);
            if (pairs[charBefore] === charAfter && config.get("pairing.autoDelete")) {
                e.preventDefault();
                e.stopImmediatePropagation();
                el.setSelectionRange(start - 1, start + 1);
                document.execCommand("delete");
            }
        }
    }
    /**
     * Whether we should handle the InputEvent on the target.
     * @param {HTMLElement} target The target element.
     */
    function validTarget(target) {
        // Only handle the InputEvent on input and textarea
        return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    }
    /**
     * Handlers for different types of InputEvent.
     * @type {Record<string, (e: InputEvent) => void>}
     */
    const inputHandlers = {
        "insertText": onInsertText,
        "deleteContentBackward": onBackspace,
    }
    /**
     * Handle the InputEvent.
     * @param {InputEvent} e The InputEvent.
     */
    function onInput(e) {
        if (e.isComposing || e.defaultPrevented || !validTarget(e.target)) return;
        const handler = inputHandlers[e.inputType];
        if (handler) handler(e);
    }

    // Set up
    document.addEventListener("beforeinput", onInput, { capture: false, passive: false });
    /**
     * Prop-specific handlers for config changes.
     * @type {Record<string, (value: any) => void>}
     */
    const configChangeHandlers = {
        "pairing.pairs": (value) => {
            pairs = {};
            reversePairs = {};
            for (let i = 0; i < value.length; i += 2) {
                pairs[value.charAt(i)] = value.charAt(i + 1);
                reversePairs[value.charAt(i + 1)] = value.charAt(i);
            }
        }
    };
    config.addEventListener("set", e => {
        const handler = configChangeHandlers[e.detail.prop];
        if (handler) handler(e.detail.after);
    });
    for (const [prop, handler] of Object.entries(configChangeHandlers)) {
        handler(config.get(prop));
    }
})();
