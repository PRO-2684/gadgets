// ==UserScript==
// @name         Open in Current
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Always open pages in the current window, instead of creating a popup.
// @author       PRO-2684
// @match        none
// @icon         none
// @license      gpl-3.0
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    "use strict";
    const { name, version } = GM_info.script;
    const debug = console.debug.bind(console, `[${name}@${version}]`);

    const originalOpen = unsafeWindow.open.bind(unsafeWindow);
    function filteredOpen(url, target, features) {
        debug("Intercepted open", url, target, features);
        // Only keep noopener, noreferrer, and attributionsrc
        if (typeof features === "string") {
            // Example: window.open(url, "_blank", "width=780,height=490, top=100, left=380, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no")
            const filteredFeatures = features.split(",").map(f => f.trim()).filter(f =>
                f === "noopener" || f === "noreferrer" || f.startsWith("attributionsrc=")
            ).join(", ");
            return originalOpen(url, target, filteredFeatures);
        } else if (typeof features === "object" && features !== null) {
            const filteredFeatures = {};
            if (features.noopener) filteredFeatures.noopener = features.noopener;
            if (features.noreferrer) filteredFeatures.noreferrer = features.noreferrer;
            if (features.attributionsrc) filteredFeatures.attributionsrc = features.attributionsrc;
            return originalOpen(url, target, filteredFeatures);
        }
    };
    unsafeWindow.open = filteredOpen;
})();
