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
        hideFonts: {
            name: "Hide Fonts",
            title: "Hide language-specific fonts from the canvas context",
            type: "bool",
            value: true,
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

    // Override navigator.language and navigator.languages
    const lang = config.get("language");
    if (lang) {
        override(navigator, "language", lang);
        override(navigator, "languages", [lang]);
    }

    // Override Intl.DateTimeFormat().resolvedOptions().timeZone
    const tz = config.get("timezone");
    if (tz) {
        const originalOptions = Intl.DateTimeFormat().resolvedOptions();
        override(Intl.DateTimeFormat.prototype, "resolvedOptions", function () {
            return { ...originalOptions, timeZone: tz };
        });
    }

    // Hide fonts from the canvas context
    if (config.get("hideFonts")) {
        const hiddenFonts = [
            "DengXian",
            "FangSong",
            "方正小标宋简体",
            "小标宋体",
            "仿宋_GB2312",
            "HarmonyOS Sans",
            "Alibaba PuHuiTi",
            "Smiley Sans",

            // Optional broader coverage:
            "KaiTi",
            "SimHei",
            "SimSun",
            "NSimSun",
            "Microsoft YaHei",
            "Microsoft YaHei UI",
            "Microsoft JhengHei",
            "Microsoft JhengHei UI",
            "MingLiU",
            "PMingLiU",
            "DFKai-SB",
        ];

        const proto = CanvasRenderingContext2D.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(proto, "font");

        Object.defineProperty(proto, "font", {
            ...descriptor,

            set(value) {
                let font = String(value);

                for (const name of hiddenFonts) {
                    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

                    // Quoted family
                    font = font.replace(
                        new RegExp(`(["'])${escaped}\\1\\s*,?\\s*`, "gi"),
                        "",
                    );

                    // Unquoted family
                    font = font.replace(
                        new RegExp(`\\b${escaped}\\b\\s*,?\\s*`, "gi"),
                        "",
                    );
                }

                descriptor.set.call(this, font);
            },
        });
    }
})();
