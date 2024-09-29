// ==UserScript==
// @name         GitHub Plus
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Enhance GitHub with additional features.
// @author       PRO-2684
// @match        https://github.com/*
// @run-at       document-start
// @icon         http://github.com/favicon.ico
// @license      gpl-3.0
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://update.greasyfork.org/scripts/470224/1449525/Tampermonkey%20Config.js
// ==/UserScript==

(function() {
    'use strict';
    /**
     * Regular expression to match the expanded assets URL. (https://github.com/<username>/<repo>/releases/expanded_assets/<version>)
     */
    const expandedAssetsRegex = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\/expanded_assets\/([^/]+)/;
    /**
     * Data about the release. Maps `owner` and `repo` to details. Details are `Promise` objects if exist.
     */
    let releaseData = {};

    const configDesc = {
        $default: {
            value: true,
            input: "current",
            processor: "not",
            formatter: "boolean",
            autoClose: false
        },
        debug: {
            name: "Debug",
            title: "Enable debug mode",
            value: false
        },
        releaseCount: {
            name: "Release Count",
            title: "Maximum number of releases to query (starting from the latest)",
            value: 50,
            input: "prompt",
            processor: "int_range-1-",
            formatter: "normal"
        },
        releaseDownloads: {
            name: "Release Downloads",
            title: "Show how many times a release asset has been downloaded"
        },
        releaseUploader: {
            name: "Release Uploader",
            title: "Show who uploaded a release asset"
        }
    };
    const config = new GM_config(configDesc);

    function log(...args) {
        if (config.get("debug")) console.log("%c[GitHub Plus]%c", "color:#f78166;", "color: unset;", ...args);
    }
    /**
     * Get the release data for the given owner and repo.
     * @param {string} owner The owner of the repository.
     * @param {string} repo The repository name.
     * @returns {Promise<Object>} The release data, which resolves to an object mapping version tag, download link to details.
     */
    async function getReleaseData(owner, repo) {
        if (!releaseData[owner]) releaseData[owner] = {};
        if (!releaseData[owner][repo]) {
            const promise = fetch(`https://api.github.com/repos/${owner}/${repo}/releases?page=1&per_page=${config.get("releaseCount")}`).then(
                response => response.json()
            ).then(data => {
                const finalData = {};
                for (const release of data) {
                    const assets = {};
                    for (const asset of release.assets) {
                        assets[asset.browser_download_url] = {
                            downloads: asset.download_count,
                            uploader: {
                                name: asset.uploader.login,
                                url: asset.uploader.html_url
                            }
                        };
                    }
                    finalData[release.tag_name] = assets;
                }
                return finalData;
            });
            releaseData[owner][repo] = promise;
        }
        return releaseData[owner][repo];
    }
    /**
     * Create a link to the uploader's profile.
     * @param {Object} uploader The uploader information.
     * @param {string} uploader.name The name of the uploader.
     * @param {string} uploader.url The URL to the uploader's profile.
     */
    function createUploaderLink(uploader) {
        const link = document.createElement("a");
        link.textContent = "@" + uploader.name;
        link.href = uploader.url;
        link.title = `Uploaded by @${uploader.name}`;
        link.setAttribute("class", "color-fg-muted text-sm-left flex-auto ml-md-3 nowrap");
        return link;
    }
    /**
     * Create a span element with the given download count.
     * @param {number} downloads The download count.
     */
    function createDownloadCount(downloads) {
        const downloadCount = document.createElement("span");
        downloadCount.textContent = `${downloads} DL`;
        downloadCount.title = `${downloads} downloads`;
        downloadCount.setAttribute("class", "color-fg-muted text-sm-left flex-shrink-0 flex-grow-0 ml-md-3 nowrap");
        return downloadCount;
    }
    /**
     * Adding additional info (download count) to the release entries under the given element.
     * @param {HTMLElement} el The element to search for release entries.
     * @param {Object} info Additional information about the release (owner, repo, version).
     * @param {string} info.owner The owner of the repository.
     * @param {string} info.repo The repository name.
     * @param {string} info.version The version of the release.
     */
    function addAdditionalInfoToRelease(el, info) {
        const entries = el.querySelectorAll("ul > li");
        entries.forEach(async entry => {
            const icon = entry.children[0].querySelector("svg.octicon-package");
            if (!icon) return; // Not a release entry
            const downloadLink = entry.children[0].querySelector("a")?.href;
            const statistics = entry.children[1];
            const assetInfo = (await getReleaseData(info.owner, info.repo))?.[info.version]?.[downloadLink];
            if (!assetInfo) return;
            const size = statistics.querySelector("span.flex-auto");
            size.classList.remove("flex-auto");
            size.classList.add("flex-shrink-0", "flex-grow-0");
            if (config.get("releaseDownloads")) {
                const downloadCount = createDownloadCount(assetInfo.downloads);
                statistics.prepend(downloadCount);
            }
            if (config.get("releaseUploader")) {
                const uploaderLink = createUploaderLink(assetInfo.uploader);
                statistics.prepend(uploaderLink);
            }
        });
    }
    /**
     * Handle the `include-fragment-replace` event.
     * @param {CustomEvent} event The event object.
     */
    function onFragmentReplace(event) {
        const self = event.target;
        const src = self.src;
        const match = expandedAssetsRegex.exec(src);
        if (!match) return;
        const [_, owner, repo, version] = match;
        const info = { owner, repo, version };
        const fragment = event.detail.fragment;
        log("Found expanded assets:", fragment);
        for (const child of fragment.children) {
            addAdditionalInfoToRelease(child, info);
        }
    }
    /**
     * Find all release entries and setup listeners to show the download count.
     */
    function setupListeners() {
        if (!config.get("releaseDownloads") && !config.get("releaseUploader")) return; // No need to run
        // IncludeFragmentElement: https://github.com/github/include-fragment-element/blob/main/src/include-fragment-element.ts
        const fragments = document.querySelectorAll('[data-hpc] details[data-view-component="true"] include-fragment');
        fragments.forEach(fragment => {
            fragment.addEventListener("include-fragment-replace", onFragmentReplace, { once: true });
        });
    }
    document.addEventListener("DOMContentLoaded", setupListeners);
    // Examine event listeners on `document`, and you can see the event listeners for the `turbo:*` events. (Remember to check `Framework Listeners`)
    document.addEventListener("turbo:load", setupListeners);
    // Other possible approaches and reasons against them:
    // - Use `MutationObserver` - Not efficient
    // - Patch `IncludeFragmentElement.prototype.fetch`, just like GitHub itself did at `https://github.githubassets.com/assets/app/assets/modules/github/include-fragment-element-hacks.ts`
    //   - Monkey-patching
    //   - If using regex to modify the response, it would be tedious to maintain
    //   - If using `DOMParser`, the same HTML would be parsed twice
    if (!config.get("releaseDownloads") && !config.get("releaseUploader")) return; // No need to run
    document.head.appendChild(document.createElement("style")).textContent = `
        /* Making more room for the additional info */
        @media (min-width: 1012px) {
            .col-lg-9 {
                width: 60%; /* Originally ~75% */
            }
        }
        .nowrap {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `;
})();
