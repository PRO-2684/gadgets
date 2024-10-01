// ==UserScript==
// @name         GitHub Plus
// @name:zh-CN   GitHub 增强
// @namespace    http://tampermonkey.net/
// @version      0.1.5
// @description  Enhance GitHub with additional features.
// @description:zh-CN 为 GitHub 增加额外的功能。
// @author       PRO-2684
// @match        https://github.com/*
// @match        https://*.github.com/*
// @run-at       document-start
// @icon         http://github.com/favicon.ico
// @license      gpl-3.0
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://update.greasyfork.org/scripts/470224/1456932/Tampermonkey%20Config.js
// ==/UserScript==

(function() {
    'use strict';
    const { name, version } = GM_info.script;
    /**
     * The color used for logging. Matches the color of the GitHub.
     * @type {string}
     */
    const themeColor = "#f78166";
    /**
     * Regular expression to match the expanded assets URL. (https://github.com/<username>/<repo>/releases/expanded_assets/<version>)
     */
    const expandedAssetsRegex = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\/expanded_assets\/([^/]+)/;
    /**
     * Data about the release. Maps `owner`, `repo` and `version` to the details of a release. Details are `Promise` objects if exist.
     */
    let releaseData = {};
    /**
     * Rate limit data for the GitHub API.
     * @type {Object}
     * @property {number} limit The maximum number of requests that the consumer is permitted to make per hour.
     * @property {number} remaining The number of requests remaining in the current rate limit window.
     * @property {number} reset The time at which the current rate limit window resets in UTC epoch seconds.
     */
    let rateLimit = {
        limit: -1,
        remaining: -1,
        reset: -1
    };

    // Configuration
    const configDesc = {
        $default: {
            autoClose: false
        },
        token: {
            name: "Personal Access Token",
            title: "Your personal access token for GitHub API, starting with `github_pat_` (used for increasing rate limit)",
            type: "str",
        },
        debug: {
            name: "Debug",
            title: "Enable debug mode",
            type: "bool",
        },
        releaseUploader: {
            name: "Release Uploader",
            title: "Show who uploaded a release asset",
            type: "bool",
            value: true,
        },
        releaseDownloads: {
            name: "Release Downloads",
            title: "Show how many times a release asset has been downloaded",
            type: "bool",
            value: true,
        },
        releaseHistogram: {
            name: "Release Histogram",
            title: "Show a histogram of download counts for each release asset",
            type: "bool",
        },
        trackingPrevention: {
            name: "Tracking Prevention",
            title: () => { return `Prevent some tracking by GitHub (${name} has prevented tracking ${GM_getValue("trackingPrevented", 0)} time(s))`; },
            type: "bool",
            value: true,
        }
    };
    const config = new GM_config(configDesc);

    // General functions
    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);
    /**
     * Log the given arguments if debug mode is enabled.
     * @param {...any} args The arguments to log.
     */
    function log(...args) {
        if (config.get("debug")) console.log(`%c[${name}]%c`, `color:${themeColor};`, "color: unset;", ...args);
    }
    /**
     * Warn the given arguments.
     * @param {...any} args The arguments to warn.
     */
    function warn(...args) {
        console.warn(`%c[${name}]%c`, `color:${themeColor};`, "color: unset;", ...args);
    }
    /**
     * Fetch the given URL with the personal access token, if given. Also updates rate limit.
     * @param {string} url The URL to fetch.
     * @param {RequestInit} options The options to pass to `fetch`.
     * @returns {Promise<Response>} The response from the fetch.
     */
    async function fetchWithToken(url, options) {
        const token = config.get("token");
        if (token) {
            if (!options) options = {};
            if (!options.headers) options.headers = {};
            options.headers.accept = "application/vnd.github+json";
            options.headers["X-GitHub-Api-Version"] = "2022-11-28";
            options.headers.Authorization = `Bearer ${token}`;
        }
        const r = await fetch(url, options);
        // Update rate limit
        rateLimit.limit = parseInt(r.headers.get("X-RateLimit-Limit"));
        rateLimit.remaining = parseInt(r.headers.get("X-RateLimit-Remaining"));
        rateLimit.reset = parseInt(r.headers.get("X-RateLimit-Reset"));
        const resetDate = new Date(rateLimit.reset * 1000).toLocaleString();
        log(`Rate limit: remaining ${rateLimit.remaining}/${rateLimit.limit}, resets at ${resetDate}`);
        if (r.status === 403 || r.status === 429) { // If we get 403 or 429, we've hit the rate limit.
            throw new Error(`Rate limit exceeded! Will reset at ${resetDate}`);
        } else if (rateLimit.remaining === 0) {
            warn(`Rate limit has been exhausted! Will reset at ${resetDate}`);
        }
        return r;
    }

    // Release-* features
    /**
     * Get the release data for the given owner, repo and version.
     * @param {string} owner The owner of the repository.
     * @param {string} repo The repository name.
     * @param {string} version The version tag of the release.
     * @returns {Promise<Object>} The release data, which resolves to an object mapping download link to details.
     */
    async function getReleaseData(owner, repo, version) {
        if (!releaseData[owner]) releaseData[owner] = {};
        if (!releaseData[owner][repo]) releaseData[owner][repo] = {};
        if (!releaseData[owner][repo][version]) {
            const promise = fetchWithToken(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${version}`).then(
                response => response.json()
            ).then(data => {
                log(`Fetched release data for ${owner}/${repo}@${version}:`, data);
                const assets = {};
                for (const asset of data.assets) {
                    assets[asset.browser_download_url] = {
                        downloads: asset.download_count,
                        uploader: {
                            name: asset.uploader.login,
                            url: asset.uploader.html_url
                        }
                    };
                }
                log(`Processed release data for ${owner}/${repo}@${version}:`, assets);
                return assets;
            });
            releaseData[owner][repo][version] = promise;
        }
        return releaseData[owner][repo][version];
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
     * Show a histogram of the download counts for the given release entry.
     * @param {HTMLElement} asset One of the release assets.
     * @param {number} value The download count of the asset.
     * @param {number} max The maximum download count of all assets.
     */
    function showHistogram(asset, value, max) {
        asset.style.setProperty("--percent", `${value / max * 100}%`);
    }
    /**
     * Adding additional info (download count) to the release entries under the given element.
     * @param {HTMLElement} el The element to search for release entries.
     * @param {Object} info Additional information about the release (owner, repo, version).
     * @param {string} info.owner The owner of the repository.
     * @param {string} info.repo The repository name.
     * @param {string} info.version The version of the release.
     */
    async function addAdditionalInfoToRelease(el, info) {
        const entries = el.querySelectorAll("ul > li");
        const assets = Array.from(entries).filter(asset => asset.querySelector("svg.octicon-package"));
        const releaseData = await getReleaseData(info.owner, info.repo, info.version);
        if (!releaseData) return;
        const maxDownloads = Math.max(0, ...Object.values(releaseData).map(asset => asset.downloads));
        assets.forEach(asset => {
            const downloadLink = asset.children[0].querySelector("a")?.href;
            const statistics = asset.children[1];
            const assetInfo = releaseData[downloadLink];
            if (!assetInfo) return;
            asset.classList.add("ghp-release-asset");
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
            if (config.get("releaseHistogram") && maxDownloads > 0 && assets.length > 1) {
                showHistogram(asset, assetInfo.downloads, maxDownloads);
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
        log("Calling setupListeners");
        if (!config.get("releaseDownloads") && !config.get("releaseUploader") && !config.get("releaseHistogram")) return; // No need to run
        // IncludeFragmentElement: https://github.com/github/include-fragment-element/blob/main/src/include-fragment-element.ts
        const fragments = document.querySelectorAll('[data-hpc] details[data-view-component="true"] include-fragment');
        fragments.forEach(fragment => {
            fragment.addEventListener("include-fragment-replace", onFragmentReplace, { once: true });
        });
    }
    if (location.hostname === "github.com") { // Only run on GitHub main site
        document.addEventListener("DOMContentLoaded", setupListeners);
        // Examine event listeners on `document`, and you can see the event listeners for the `turbo:*` events. (Remember to check `Framework Listeners`)
        document.addEventListener("turbo:load", setupListeners);
        // Other possible approaches and reasons against them:
        // - Use `MutationObserver` - Not efficient
        // - Hook `CustomEvent` to make `include-fragment-replace` events bubble - Monkey-patching
        // - Patch `IncludeFragmentElement.prototype.fetch`, just like GitHub itself did at `https://github.githubassets.com/assets/app/assets/modules/github/include-fragment-element-hacks.ts`
        //   - Monkey-patching
        //   - If using regex to modify the response, it would be tedious to maintain
        //   - If using `DOMParser`, the same HTML would be parsed twice
        document.head.appendChild(document.createElement("style")).textContent = `
            @media (min-width: 1012px) { /* Making more room for the additional info */
                .ghp-release-asset .col-lg-9 {
                    width: 60%; /* Originally ~75% */
                }
            }
            .nowrap { /* Preventing text wrapping */
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .ghp-release-asset { /* Styling the histogram */
                background: linear-gradient(to right, var(--bgColor-accent-muted) var(--percent, 0%), transparent 0);
            }
        `;
    }

    // Tracking prevention
    function preventTracking() {
        log("Calling preventTracking");
        const elements = [
            // Prevents tracking data from being sent to https://collector.github.com/github/collect
            // https://github.githubassets.com/assets/ui/packages/hydro-analytics/hydro-analytics.ts, `const visitorMeta = document.querySelector<HTMLMetaElement>('meta[name=visitor-payload]')`
            $("meta[name=visitor-payload]"),
            // https://github.githubassets.com/assets/node_modules/@github/hydro-analytics-client/dist/meta-helpers.js
            // Breakpoint on function `getOptionsFromMeta` to see the argument `prefix`, which is `octolytics`
            // Or investigate `hydro-analytics.ts` mentioned above, you may find: `const options = getOptionsFromMeta('octolytics')`
            // Later, this script gathers information from `meta[name^="${prefix}-"]` elements, so we can remove them.
            // If `collectorUrl` is not set, the script will throw an error, thus preventing tracking.
            ...$$("meta[name^=octolytics-]"),
            // Prevents tracking data from being sent to `https://api.github.com/_private/browser/stats`
            // From "Network" tab, we can find that this request is sent by `https://github.githubassets.com/assets/ui/packages/stats/stats.ts` at function `safeSend`, who accepts two arguments: `url` and `data`
            // Search for this function in the current script, and you will find that it is only called once by function `flushStats`
            // `url` parameter is set in this function, by: `const url = ssrSafeDocument?.head?.querySelector<HTMLMetaElement>('meta[name="browser-stats-url"]')?.content`
            // After removing the meta tag, the script will return, so we can remove this meta tag to prevent tracking.
            $("meta[name=browser-stats-url]")
        ];
        if (elements.some(el => el)) {
            GM_setValue("trackingPrevented", GM_getValue("trackingPrevented", 0) + 1);
        }
        elements.forEach(el => el?.remove());
    }
    if (config.get("trackingPrevention")) {
        // document.addEventListener("DOMContentLoaded", preventTracking);
        // All we need to remove is in the `head` element, so we can run it immediately.
        preventTracking();
    }

    log(`${name} v${version} has been loaded 🎉`);
})();
