// ==UserScript==
// @name         Better reCAPTCHA
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  Various QoL improvements to reCAPTCHA.
// @author       PRO
// @run-at       document-end
// @match        https://www.google.com/recaptcha/api2/*
// @match        https://google.com/recaptcha/api2/*
// @match        https://recaptcha.google.cn/recaptcha/api2/*
// @icon         https://www.gstatic.com/recaptcha/api2/logo_48.png
// @license      gpl-3.0
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://github.com/PRO-2684/GM_config/releases/download/v1.2.2/config.min.js#md5=c45f9b0d19ba69bb2d44918746c4d7ae
// ==/UserScript==

(function() {
    'use strict';
    const { name, version } = GM.info.script;
    const lastPart = location.pathname.slice(16); // `anchor` or `bframe`
    const $ = document.querySelector.bind(document);
    const configDesc = {
        $default: {
            autoClose: false,
        },
        autoClick: {
            name: "Auto click",
            title: "[General] Automatically clicks the initial checkbox for you",
            type: "bool",
            value: true,
        },
        slideSelect: {
            name: "Slide select",
            title: "[Image Select] Hold down the primary button on your mouse and slide across tiles to (de)select them",
            type: "bool",
            value: true,
        },
    };
    const config = new GM_config(configDesc, { immediate: true });
    /**
     * Logs the given arguments to console.
     * @param {...any} args The arguments to log.
     */
    function log(...args) {
        console.log(`[${name}]`, ...args);
    }

    // Handling `anchor` & paths other than `bframe`
    if (lastPart === "anchor") {
        if (config.get("autoClick")) {
            $("#rc-anchor-container")?.click();
        }
        return;
    } else if (lastPart !== "bframe") {
        log(`Unknown path, ignoring: ${lastPart}`)
        return;
    }

    // Slide select
    function slideSelect() {
        const div = $("div");
        const obs = new MutationObserver((mutations, _obs) => {
            let succ = trySetupSlideSelect();
            log("trySetupSlideSelect", succ, mutations);
        });
        obs.observe(div, { childList: true, subtree: false });
    }
    function trySetupSlideSelect() {
        // TODO: Fix sliding st it works for multiple challenges
        const body = $("#rc-imageselect-target > table > tbody");
        if (!body) {
            return false;
        }
        body.addEventListener("click", (e) => {
            if (e.isTrusted) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { capture: true });
        const tiles = body.querySelectorAll("tr > td");
        tiles.forEach(tile => {
            tile.addEventListener("mouseenter", slideSelectEnterHandler);
            tile.addEventListener("mousedown", slideSelectDownHandler);
        });
        return true;
    }
    function slideSelectEnterHandler(e) {
        if (e.buttons === 1) {
            // Left button is pressed
            e.preventDefault();
            this.click();
        }
    }
    function slideSelectDownHandler(e) {
        if (e.buttons === 1) {
            // Left button is pressed
            e.preventDefault();
            this.click();
        }
    }
    if (config.get("slideSelect")) {
        slideSelect();
    }

    log(`${version} initialized successfully 🎉`);
})();
