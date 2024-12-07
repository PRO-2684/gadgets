// ==UserScript==
// @name         Editio
// @name:zh-CN   Editio
// @namespace    http://tampermonkey.net/
// @version      0.2.0
// @description  Some Visual Studio Code's useful features ported to the web!
// @description:zh-CN 将 Visual Studio Code 的部分实用功能移植到 Web 上！
// @tag          productivity
// @author       PRO-2684
// @match        *://*/*
// @run-at       document-start
// @icon         https://github.com/PRO-2684/gadgets/raw/refs/heads/main/editio/editio.svg
// @license      gpl-3.0
// @grant        unsafeWindow
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
                jumping: {
                    name: "🔁 Jumping",
                    title: "Jump between paired brackets - won't work for pairs with the same opening and closing characters",
                    type: "bool",
                    value: true
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
        },
        tabulator: {
            name: "↔️ Tabulator",
            title: "Tab-related features",
            type: "folder",
            items: {
                tabOut: {
                    name: "↪️ Tab out",
                    title: "Pressing (Shift+) Tab to move to the next (or previous) character specified",
                    type: "bool",
                    value: true
                },
                tabOutChars: {
                    name: "📜 Tab out chars",
                    title: "Characters to tab out of",
                    type: "str",
                    value: "()[]{}<>\"'`,:;.",
                }
            }
        },
        url: {
            name: "🔗 URL",
            title: "URL-related features",
            type: "folder",
            items: {
                pasteIntoSelection: {
                    name: "📋 Paste into selection",
                    title: "Paste the URL into the selection in Markdown format",
                    type: "bool",
                    value: true
                },
                recognizedSchemes: {
                    name: "🔍 Recognized schemes",
                    title: "Recognized URL schemes for the URL-related features",
                    value: ["http", "https", "ftp", "ws", "wss"],
                    input: (prop, orig) => {
                        return prompt("🤔 Enter the recognized schemes separated by spaces, or leave empty for any", orig.join(" "));
                    },
                    processor: (input) => {
                        if (input === null) throw new Error("User cancelled the operation");
                        return input.split(" ")
                            .map(s => s.trim())
                            .filter(s => s);
                    },
                    formatter: (name, value) => {
                        if (value.length === 0) {
                            return `${name}: *ANY*`;
                        } else {
                            return `${name}: ${value.join(" ")}`;
                        }
                    }
                }
            }
        },
        mouse: {
            name: "🖱️ Mouse",
            title: "Mouse-related features",
            type: "folder",
            items: {
                fastScroll: {
                    name: "🚀 Fast scroll",
                    title: "Scroll faster when holding the Alt key",
                    type: "bool",
                    value: false
                },
                fastScrollSensitivity: {
                    name: "🎚️ Fast scroll sensitivity",
                    title: "Scrolling speed multiplier when pressing `Alt`",
                    type: "int",
                    value: 5,
                    processor: "int_range-1-10"
                },
                consecutiveScrollThreshold: {
                    name: "⏱️ Consecutive scroll threshold",
                    title: "The threshold of time difference for the scroll to be considered consecutive",
                    type: "int",
                    value: 200,
                    processor: "int_range-0-1000"
                }
            }
        },
        advanced: {
            name: "⚙️ Advanced",
            title: "Advanced options",
            type: "folder",
            items: {
                capture: {
                    name: "🔒 Capture",
                    title: "Set `capture` to true for the event listeners",
                    type: "bool",
                    value: false
                },
                defaultPrevented: {
                    name: "🚫 Default prevented",
                    title: "Don't handle the event if it's `defaultPrevented`",
                    type: "bool",
                    value: true
                },
                debug: {
                    name: "🐞 Debug",
                    title: "Enable debug mode",
                    type: "bool",
                    value: false
                }
            }
        }
    };
    const config = new GM_config(configDesc);
    const editio = {}; // Variables to expose if debug mode is enabled

    // Pairing
    // Input-related
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
        const el = e.composedPath()[0];
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
        const el = e.composedPath()[0];
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
    // Jumping
    /**
     * Find the other character's index in the given text.
     * @param {string} text The text to search in.
     * @param {number} pos The position of the character.
     * @returns {number | null} The position of the other character in the pair, or null if not found.
     */
    function findOtherIndex(text, pos) {
        const char = text.charAt(pos);
        const [isPair, isReversePair] = [char in pairs, char in reversePairs];
        if (isPair === isReversePair) return null; // Either not a pair or with the same opening and closing characters
        const other = isPair ? pairs[char] : reversePairs[char];
        const direction = isPair ? 1 : -1; // Searches forwards for the closing character, or backwards for the opening character
        let count = 0;
        for (let i = pos + direction; i >= 0 && i < text.length; i += direction) {
            if (text.charAt(i) === char) {
                count++;
            } else if (text.charAt(i) === other) {
                if (count === 0) return i;
                count--;
            }
        }
        return null;
    }
    /**
     * Handle shortcuts for jumping between paired brackets.
     * @param {KeyboardEvent} e The KeyboardEvent.
     * @returns {boolean} Whether the event is handled.
     */
    function jumpingHandler(e) {
        // Ctrl + Q
        if (!e.ctrlKey || e.altKey || e.shiftKey || e.metaKey || e.key !== "q" || !config.get("pairing.jumping")) return;
        /**
         * The target element.
         * @type {HTMLInputElement | HTMLTextAreaElement}
         */
        const el = e.composedPath()[0];
        const { selectionStart: start, selectionEnd: end, value } = el;
        const diff = Math.abs(end - start);
        if (!(diff <= 1) || typeof start === "undefined") return; // Only handle the scenario where one or none character is selected and the cursor is inside the element
        const otherIndex = findOtherIndex(value, Math.min(start, end)) // Try pairing the character selected or the one after the cursor
            ?? (diff ? null : findOtherIndex(value, start - 1)); // If not found, try the character before the cursor
        if (otherIndex !== null) {
            e.preventDefault();
            e.stopImmediatePropagation();
            el.setSelectionRange(otherIndex, otherIndex + 1);
            return true;
        }
        return false;
    }

    // Tabulator
    /**
     * Characters to tab out of.
     * @type {Set<string>}
     */
    let tabOutChars = new Set();
    /**
     * Find the character as the destination of the tab out action.
     * @param {string} text The text to search in.
     * @param {number} pos The position of the cursor.
     * @param {number} direction The direction to search in.
     * @returns {number} The position of the character to tab out of, or -1 if not found.
     */
    function findNextPos(text, pos, direction) {
        // A position is valid if and only if the character at that position OR BEFORE that position is in the tabOutChars
        for (let i = pos + direction; i >= 0 && i <= text.length; i += direction) { // `i <= text.length` is intentional, so as to handle the scenario where the cursor should be moved to the end of the text
            if (tabOutChars.has(text.charAt(i)) || tabOutChars.has(text.charAt(i - 1))) return i;
        }
        return -1;
    }
    /**
     * Handle the tab out action.
     * @param {KeyboardEvent} e The KeyboardEvent.
     * @returns {boolean} Whether the event is handled.
     */
    function tabOutHandler(e) {
        if (e.ctrlKey || e.altKey || e.metaKey || e.key !== "Tab" || !config.get("tabulator.tabOut")) return;
        /**
         * The target element.
         * @type {HTMLInputElement | HTMLTextAreaElement}
         */
        const el = e.composedPath()[0];
        const { selectionStart: start, selectionEnd: end, value } = el;
        if (start !== end) return; // Only handle the scenario where no character is selected
        const direction = e.shiftKey ? -1 : 1;
        const nextPos = findNextPos(value, start, direction);
        if (nextPos !== -1) {
            e.preventDefault();
            e.stopImmediatePropagation();
            el.setSelectionRange(nextPos, nextPos);
            return true;
        }
        return false;
    }

    // URL
    /**
     * Handle the InputEvent of type "insertFromPaste", so as to paste the URL into the selection.
     * @param {InputEvent} e The InputEvent.
     */
    function onPaste(e) {
        /**
         * The input or textarea element that triggered the event.
         * @type {HTMLInputElement | HTMLTextAreaElement}
         */
        const el = e.composedPath()[0];
        const { selectionStart: start, selectionEnd: end, value } = el;
        if (start === end || !URL.canParse(e.data) || !config.get("url.pasteIntoSelection")) return;
        const url = new URL(e.data);
        const scheme = url.protocol.slice(0, -1);
        const allowedSchemes = config.get("url.recognizedSchemes");
        if (allowedSchemes.length > 0 && !allowedSchemes.includes(scheme)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        const selection = value.substring(start, end);
        const wrapped = `[${selection}](${e.data})`;
        document.execCommand("insertText", false, wrapped);
        // Select the `selection` part
        el.setSelectionRange(start + 1, start + 1 + selection.length);
    }

    // Mouse
    /**
     * Scrolling speed multiplier when pressing `Alt`.
     * @type {number}
     */
    let fastScrollSensitivity = config.get("mouse.fastScrollSensitivity");
    /**
     * The time threshold for the scroll to be considered consecutive.
     * @type {number}
     */
    let consecutiveScrollThreshold = config.get("mouse.consecutiveScrollThreshold");
    /**
     * Information about the last scroll event.
     * @type {{ time: number, el: HTMLElement, vertical: boolean, plus: boolean }}
     */
    const lastScroll = {
        time: 0,
        el: document.scrollingElement,
        vertical: true,
        plus: true
    };
    /**
     * Whether the element can be scrolled.
     * @param {HTMLElement} el The element.
     * @param {boolean} vertical Whether the scroll is vertical.
     * @param {boolean} plus Whether the scroll is positive (down or right).
     * @returns {boolean} Whether the element can be scrolled.
     */
    function canScroll(el, vertical = true, plus = true) {
        const style = window.getComputedStyle(el);
        const overflow = vertical ? style.overflowY : style.overflowX;
        const scrollSize = vertical ? el.scrollHeight : el.scrollWidth;
        const clientSize = vertical ? el.clientHeight : el.clientWidth;
        const scrollPos = vertical ? el.scrollTop : el.scrollLeft;
        const isScrollable = scrollSize > clientSize;
        const canScrollFurther = plus ? (scrollPos + clientSize < scrollSize) : (scrollPos > 0);
        if (isScrollable && canScrollFurther && !overflow.includes('visible') && !overflow.includes('hidden')) {
            return true;
        }
        return false;
    }
    /**
     * Find the scrollable element that should handle the event.
     * @param {WheelEvent} e The WheelEvent.
     * @param {boolean} vertical Whether the scroll is vertical.
     * @param {boolean} plus Whether the scroll is positive (down or right).
    */
    function findScrollableElement(e, vertical = true, plus = true) {
        // If the scroll is deemed consecutive, then return the previous scrollable element
        if (e.timeStamp - lastScroll.time < consecutiveScrollThreshold && lastScroll.vertical === vertical && lastScroll.plus === plus) {
            return lastScroll.el;
        }
        // https://gist.github.com/oscarmarina/3a546cff4d106a49a5be417e238d9558
        const path = e.composedPath();
        for (const el of path) {
            if (!(el instanceof HTMLElement || el instanceof ShadowRoot)) {
                continue;
            }
            if (canScroll(el, vertical, plus)) {
                return el;
            }
        }
        return document.scrollingElement;
    }
    /**
     * Handle the mousewheel event.
     * @param {WheelEvent} e The WheelEvent.
     */
    function onWheel(e) {
        if (!e.altKey || e.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        const { deltaY } = e;
        const amplified = deltaY * fastScrollSensitivity;
        const [vertical, plus] = [!e.shiftKey, e.deltaY > 0];
        const el = findScrollableElement(e, vertical, plus);
        Object.assign(lastScroll, { time: e.timeStamp, el, vertical, plus });
        el.scrollBy({
            top: e.shiftKey ? 0 : amplified,
            left: e.shiftKey ? amplified : 0,
            behavior: "instant" // TODO: Smooth scrolling
        });
    }
    /**
     * Enable or disable the fast scroll feature.
     * @param {boolean} enabled Whether the fast scroll feature is enabled.
     */
    function fastScroll(enabled) {
        if (enabled) {
            document.addEventListener("wheel", onWheel, { capture: config.get("advanced.capture"), passive: false });
        } else {
            document.removeEventListener("wheel", onWheel, { capture: config.get("advanced.capture"), passive: false });
        }
    }

    // Set up
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
        "insertFromPaste": onPaste
    }
    /**
     * Handle the InputEvent.
     * @param {InputEvent} e The InputEvent.
     */
    function onInput(e) {
        if (e.isComposing || (e.defaultPrevented && config.get("advanced.defaultPrevented")) || !validTarget(e.composedPath()[0])) return;
        const handler = inputHandlers[e.inputType];
        if (handler) handler(e);
    }
    /**
     * Handle the KeyboardEvent.
     * @param {KeyboardEvent} e The KeyboardEvent.
     */
    function onKeydown(e) {
        if ((e.defaultPrevented && config.get("advanced.defaultPrevented")) || !validTarget(e.composedPath()[0])) return; // Only handle the unhandled event on input and textarea
        jumpingHandler(e) || tabOutHandler(e); // Only handle once at most
    }
    document.addEventListener("beforeinput", onInput, { capture: config.get("advanced.capture"), passive: false });
    document.addEventListener("keydown", onKeydown, { capture: config.get("advanced.capture"), passive: false });
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
        },
        "tabulator.tabOutChars": (value) => {
            tabOutChars = new Set(value);
        },
        "advanced.debug": (value) => {
            config.debug = value;
            if (value) {
                unsafeWindow.editio = editio;
            } else {
                delete unsafeWindow.editio;
            }
        },
        "mouse.fastScroll": fastScroll,
        "mouse.fastScrollSensitivity": (value) => {
            fastScrollSensitivity = value;
        },
        "mouse.consecutiveScrollThreshold": (value) => {
            consecutiveScrollThreshold = value;
        }
    };
    config.addEventListener("set", e => {
        const handler = configChangeHandlers[e.detail.prop];
        if (handler) handler(e.detail.after);
    });
    for (const [prop, handler] of Object.entries(configChangeHandlers)) {
        handler(config.get(prop));
    }
    // Expose these variables if debug mode is enabled
    Object.assign(editio, { config, pairs, reversePairs, tabOutChars, fastScrollSensitivity, consecutiveScrollThreshold, lastScroll });
})();
