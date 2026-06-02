// ==UserScript==
// @name         Rettiwt Key Export
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Export API_KEY for use with Rettiwt-API. UserScript version of the Rettiwt-Auth-Helper extension.
// @author       PRO-2684
// @match        https://x.com/*
// @run-at       context-menu
// @license      gpl-3.0
// @grant        GM_registerMenuCommand
// @grant        GM.cookie
// @grant        GM.setClipboard
// ==/UserScript==

(function () {
    "use strict";
    const DOMAIN = "x.com";

    async function main() {
        const cookies = await GM.cookie.list({ domain: DOMAIN });
        const api_key = createApiKey(cookies);
        // Copy to clipboard
        if (api_key) {
            await GM.setClipboard(api_key, "text");
            alert("API_KEY copied to clipboard!");
        } else {
            alert(
                "Failed to create API_KEY. Make sure you are logged in and have the necessary cookies.",
            );
        }
    }
    function createApiKey(cookies) {
        // Tampermonkey doesn't seem to respect the domain filter, so we filter manually again.
        cookies = cookies.filter(({ domain }) => domain === DOMAIN);
        // https://github.com/Rishikant181/Rettiwt-Auth-Helper/blob/3d9559f3a2a6a919ddfd07310f39e73e7802dfaf/src/background.ts#L28-L35
        if (cookies.length !== 3) {
            return null;
        }
        let key = "";
        for (const { name, value } of cookies) {
            key += `${name}=${value};`;
        }
        key = btoa(key);
        return key;
    }

    main();
})();
