// ==UserScript==
// @name         LaTeX Copy
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  A userscript that enables copying LaTeX code from rendered equations on web pages.
// @author       PRO-2684
// @grant        GM_setClipboard
// @match        none
// @require      https://update.greasyfork.org/scripts/462234/1721333/Message.js
// @icon         none
// @license      gpl-3.0
// ==/UserScript==

(function () {
    "use strict";
    const { name, version } = GM_info.script;
    const debug = console.debug.bind(console, `[${name}@${version}]`);

    // Qmsg configuration
    // const style = ".qmsg .qmsg-content-wrapper { color: black; }"; // TODO: Adaptive style
    Qmsg.config({
        showClose: true,
        timeout: 5000,
    });

    /**Configuration for different LaTeX rendering libraries.*/
    const CONFIG = {
        KaTeX: {
            container: ".katex",
            code: ".katex-mathml semantics annotation[encoding='application/x-tex']",
        },
        MathJaxV2: {
            container: ".math-container",
            code: "script[type='math/tex'], script[type='math/tex; mode=display']",
        },
    };

    /**
     * Try to get LaTeX code from the given element.
     * @param {HTMLElement} el
     * @returns {string|null}
     */
    function getLatexCode(el) {
        let engine = null;
        for (const key in CONFIG) {
            const { container, code } = CONFIG[key];
            const containerEl = el.closest(container);
            if (containerEl) {
                engine = key;
                const codeEl = containerEl.querySelector(code);
                if (codeEl) {
                    debug(`Found LaTeX code using ${engine} config.`);
                    return codeEl.textContent;
                } else {
                    debug(
                        `Container found for ${engine}, but no code element.`,
                    );
                }
            }
        }
        if (engine) {
            const msg = `Container found for ${engine}, but it doesn't seem to provide LaTeX code.`;
            Qmsg.warning(msg);
            debug(msg);
        } else {
            // Silently ignore if no container found
        }
        return null;
    }

    document.addEventListener("dblclick", (event) => {
        const latexCode = getLatexCode(event.target);
        if (latexCode) {
            GM_setClipboard(latexCode, "text", () => {
                Qmsg.success("LaTeX code copied to clipboard!");
                debug("Copied LaTeX code:", latexCode);
            });
        }
    });
})();
