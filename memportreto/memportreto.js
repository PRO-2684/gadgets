// ==UserScript==
// @name         Memportreto
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Managing user profiles for different sites.
// @match        none
// @run-at       document-start
// @author       PRO
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://github.com/PRO-2684/GM_config/releases/download/v1.2.2/config.min.js#md5=c45f9b0d19ba69bb2d44918746c4d7ae
// @license      gpl-3.0
// ==/UserScript==
(function () {
    "use strict";
    const configDesc = {
        $default: {
            autoClose: false,
        },
        language: {
            name: "Language",
            title: "Language override, set to empty to disable",
            type: "str",
            value: "en",
        },
    };
    const config = new GM_config(configDesc);

    const lang = config.get("language");
    if (lang) {
        Object.defineProperty(navigator, "language", {
            get: function () {
                return lang;
            },
        });
        Object.defineProperty(navigator, "languages", {
            get: function () {
                return [lang];
            },
        });
    }
})();
