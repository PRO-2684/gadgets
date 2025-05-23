// ==UserScript==
// @name         Google Scholar Plus
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  Enhance Google Scholar with a bunch of features.
// @author       PRO-2684
// @match        https://scholar.google.com/*
// @icon         http://scholar.google.com/favicon.ico
// @license      gpl-3.0
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://github.com/PRO-2684/GM_config/releases/download/v1.2.1/config.min.js#md5=525526b8f0b6b8606cedf08c651163c2
// ==/UserScript==

(function () {
    "use strict";
    const { name, version } = GM_info.script;
    const log = console.log.bind(console, `[${name}]`);
    const $$ = document.querySelectorAll.bind(document);
    const configDesc = {
        $default: {
            autoClose: false
        },
        arxivAbs: {
            name: "ArXiv Abstract",
            title: "Replace ArXiv pdf link with abstract link",
            type: "bool",
            value: false
        }
    };
    const config = new GM_config(configDesc);
    log("Loaded", version);
    if (config.get("arxivAbs")) {
        $$("#gs_res_ccl_mid .gs_r.gs_or.gs_scl .gs_ggs.gs_fl a[href^='https://arxiv.org/pdf/']").forEach(a => {
            const abs = a.href.replace(/\/pdf\//, "/abs/");
            log(a.href, "->", abs);
            a.href = abs;
            const span = a.querySelector("span.gs_ctg2");
            if (span) {
                span.textContent = "[ABS]";
            }
        });
    }
})();
