// ==UserScript==
// @name         Favio
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  List the favicons of the current page in one click.
// @author       PRO-2684
// @match        *://*/*
// @run-at       context-menu
// @license      gpl-3.0
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    "use strict";
    const { name, version } = GM_info.script;
    const info = console.info.bind(console, `[${name}@${version}]`);

    const faviconSelectors = [
        "link[rel~='icon']", // Standard favicon
        "link[rel~='apple-touch-icon']", // Apple touch icon
        "link[rel~='mask-icon']", // Safari pinned tab icon
    ];
    for (const selector of faviconSelectors) {
        const link = document.querySelector(selector);
        if (link && link.href) {
            const url = new URL(link.href, document.baseURI);
            info(`${selector}: ${url.href}`);
        }
    }

    const manifestLink = document.querySelector("link[rel='manifest']");
    if (manifestLink && manifestLink.href) {
        const manifestUrl = new URL(manifestLink.href, document.baseURI);
        fetch(manifestUrl)
            .then((response) => response.json())
            .then((manifest) => {
                if (manifest.icons && Array.isArray(manifest.icons)) {
                    for (const icon of manifest.icons) {
                        if (icon.src) {
                            const url = new URL(icon.src, manifestUrl).href;
                            info(`Manifest: ${url}`);
                        }
                    }
                }
            })
            .catch((e) => {
                console.error("Failed to fetch manifest:", e);
            });
    } else {
        info("No manifest found.");
    }
})();
