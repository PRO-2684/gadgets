// ==UserScript==
// @name         Better reCAPTCHA
// @namespace    http://tampermonkey.net/
// @version      0.1.3
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

(function () {
    "use strict";
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
            title: "[Image Select] Drag to select or deselect based on the first tile; retrace your path to undo",
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
        log(`Unknown path, ignoring: ${lastPart}`);
        return;
    }

    // Slide select
    let slidePath = [];
    let slideSelected = false;
    function endSlideSelect() {
        slidePath = [];
    }
    function isTileSelected(tile) {
        return tile.classList.contains("rc-imageselect-tileselected");
    }
    function setTileSelected(tile, selected) {
        if (isTileSelected(tile) !== selected) {
            tile.click();
        }
    }
    function slideSelect() {
        document.addEventListener("mouseup", endSlideSelect, true);
        window.addEventListener("blur", endSlideSelect);
        document.addEventListener("mousemove", (e) => {
            if (e.buttons !== 1) endSlideSelect();
        });
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
        body.addEventListener(
            "click",
            (e) => {
                if (e.isTrusted) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            },
            { capture: true },
        );
        const tiles = body.querySelectorAll("tr > td");
        tiles.forEach((tile) => {
            tile.addEventListener("mouseenter", slideSelectEnterHandler);
            tile.addEventListener("mousedown", slideSelectDownHandler);
        });
        return true;
    }
    function slideSelectEnterHandler(e) {
        if (
            e.buttons !== 1 ||
            slidePath.some(({ tile }) => !tile.isConnected)
        ) {
            endSlideSelect();
            return;
        }
        if (!slidePath.length) return;
        e.preventDefault();
        const index = slidePath.findIndex(({ tile }) => tile === this);
        if (index !== -1) {
            // Keep the endpoint; restore only the tiles removed by backtracking.
            while (slidePath.length > index + 1) {
                const { tile, selected } = slidePath.pop();
                setTileSelected(tile, selected);
            }
        } else {
            slidePath.push({ tile: this, selected: isTileSelected(this) });
            setTileSelected(this, slideSelected);
        }
    }
    function slideSelectDownHandler(e) {
        if (e.buttons === 1) {
            e.preventDefault();
            const selected = isTileSelected(this);
            slidePath = [{ tile: this, selected }];
            slideSelected = !selected;
            setTileSelected(this, slideSelected);
        }
    }
    if (config.get("slideSelect")) {
        slideSelect();
    }

    log(`${version} initialized successfully 🎉`);
})();
