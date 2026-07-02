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
            value: "en-US",
        },
        timezone: {
            name: "Timezone",
            title: "Timezone override, set to empty to disable",
            type: "str",
            value: "America/New_York",
        },
    };
    const config = new GM_config(configDesc);

    /**
     * Overrides a property of an object with a specified value.
     * @param {Object} obj - The object whose property is to be overridden.
     * @param {string} prop - The name of the property to override.
     * @param {*} value - The value to return when the property is accessed.
     */
    function override(obj, prop, value) {
        Object.defineProperty(obj, prop, {
            get: function () {
                return value;
            },
        });
    }

    const lang = config.get("language");
    if (lang) {
        override(navigator, "language", lang);
        override(navigator, "languages", [lang]);
    }

    const tz = config.get("timezone");
    if (tz) {
        const originalOptions = Intl.DateTimeFormat().resolvedOptions();
        override(Intl.DateTimeFormat.prototype, "resolvedOptions", function () {
            return { ...originalOptions, timeZone: tz };
        });
    }
})();
