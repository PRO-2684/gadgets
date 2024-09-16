// ==UserScript==
// @name         CORS Helper
// @name:zh-CN   跨域助手
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  A simple script that helps bypass CORS restrictions
// @description:zh-CN 简单的绕过 CORS 限制的脚本
// @author       PRO-2684
// @match        none
// @icon         https://www.tampermonkey.net/favicon.ico
// @license      gpl-3.0
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @connect      *
// @require      https://cdn.jsdelivr.net/npm/@trim21/gm-fetch
// ==/UserScript==

(function() {
    'use strict';
    unsafeWindow.GM_fetch = GM_fetch;
})();
