// ==UserScript==
// @name         MOOC Bug Fix
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Fix various bugs in the MOOC system
// @author       PRO-2684
// @match        https://i.mooc.ucas.edu.cn/settings/photoiframe*
// @run-at       document-body
// @license      gpl-3.0
// @grant        unsafeWindow
// ==/UserScript==
(function () {
    "use strict";
    // Domain replace: photo.mooc.ucas.edu.cn -> i.mooc.ucas.edu.cn
    const resources = document.querySelectorAll(
        "[src^='http://photo.mooc.ucas.edu.cn']",
    );
    resources.forEach((resource) => {
        resource.src = resource.src.replace(
            "http://photo.mooc.ucas.edu.cn",
            "https://i.mooc.ucas.edu.cn",
        );
    });
    // Remove blocking elements
    const cover = document.querySelector("#imgcover");
    cover?.remove();
})();
