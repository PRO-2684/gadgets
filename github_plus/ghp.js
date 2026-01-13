// ==UserScript==
// @name         GitHub Plus
// @name:zh-CN   GitHub 增强
// @namespace    http://tampermonkey.net/
// @version      0.3.9
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
// @grant        GM_addElement
// @require      https://github.com/PRO-2684/GM_config/releases/download/v1.2.2/config.min.js#md5=c45f9b0d19ba69bb2d44918746c4d7ae
// ==/UserScript==

(function () {
    "use strict";
    const { name, version } = GM_info.script;
    const idPrefix = "ghp-"; // Prefix for the IDs of the elements
    /**
     * The top domain of the current page.
     * @type {string}
     */
    const topDomain = location.hostname.split(".").slice(-2).join(".");
    /**
     * The official domain of GitHub.
     * @type {string}
     */
    const officialDomain = "github.com";
    /**
     * The color used for logging. Matches the color of the GitHub.
     * @type {string}
     */
    const themeColor = "#f78166";
    /**
     * Regular expression to match the expanded assets URL. (https://<host>/<username>/<repo>/releases/expanded_assets/<version>)
     */
    const expandedAssetsRegex = new RegExp(
        `https://${topDomain.replaceAll(".", "\\.")}/([^/]+)/([^/]+)/releases/expanded_assets/([^/]+)`,
    );
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
        reset: -1,
    };

    // Configuration
    const configDesc = {
        $default: {
            autoClose: false,
        },
        code: {
            name: "🔢 Code Features",
            type: "folder",
            items: {
                tabSize: {
                    name: "➡️ Tab Size",
                    title: "Set Tab indentation size",
                    type: "int",
                    min: 0,
                    value: 4,
                },
                cursorBlink: {
                    name: "😉 Cursor Blink",
                    title: "Enable cursor blinking",
                    type: "bool",
                    value: false,
                },
                cursorAnimation: {
                    name: "🌊 Cursor Animation",
                    title: "Make cursor move smoothly",
                    type: "bool",
                    value: false,
                },
                fullWidth: {
                    name: "🔲 Full Width",
                    title: "Make the code block full width (copilot button may cover the end of the line)",
                    type: "bool",
                    value: false,
                },
            },
        },
        appearance: {
            name: "🎨 Appearance",
            type: "folder",
            items: {
                dashboard: {
                    name: "📰 Dashboard",
                    title: "Configures the dashboard",
                    type: "enum",
                    options: [
                        "Default",
                        "Hide Copilot",
                        "Hide Feed",
                        "Mobile-Like",
                    ],
                },
                leftSidebar: {
                    name: "↖️ Left Sidebar",
                    title: "Configures the left sidebar",
                    type: "enum",
                    options: ["Default", "Hidden"],
                },
                rightSidebar: {
                    name: "↗️ Right Sidebar",
                    title: "Configures the right sidebar",
                    type: "enum",
                    options: [
                        "Default",
                        "Hide 'Latest changes'",
                        "Hide 'Explore repositories'",
                        "Hide Completely",
                    ],
                },
                stickyAvatar: {
                    name: "📌 Sticky Avatar",
                    title: "Make the avatar sticky",
                    type: "bool",
                    value: false,
                },
            },
        },
        release: {
            name: "📦 Release Features",
            type: "folder",
            items: {
                uploader: {
                    name: "⬆️ Release Uploader",
                    title: "Show uploader of release assets",
                    type: "bool",
                    value: true,
                },
                downloads: {
                    name: "📥 Release Downloads",
                    title: "Show download counts of release assets",
                    type: "bool",
                    value: true,
                },
                histogram: {
                    name: "📊 Release Histogram",
                    title: "Show a histogram of download counts for each release asset",
                    type: "bool",
                },
                hideArchives: {
                    name: "🫥 Hide Archives",
                    title: "Hide source code archives (zip, tar.gz) in the release assets",
                    type: "bool",
                },
            },
        },
        extendedSearch: {
            name: "🔍 Extended Search",
            type: "folder",
            items: {
                goTo: {
                    name: "🚀 Go To",
                    title: "Add items for going to repositories, issues etc. in search suggestions",
                    type: "bool",
                    value: false,
                },
            },
        },
        additional: {
            name: "🪄 Additional Features",
            type: "folder",
            items: {
                trackingPrevention: {
                    name: "🎭 Tracking Prevention",
                    title: () => {
                        return `Prevent some tracking by GitHub (${name} has prevented tracking ${GM_getValue("trackingPrevented", 0)} time(s))`;
                    },
                    type: "bool",
                    value: true,
                },
            },
        },
        advanced: {
            name: "⚙️ Advanced Settings",
            type: "folder",
            items: {
                token: {
                    name: "🔑 Personal Access Token",
                    title: "Your personal access token for GitHub API, starting with `github_pat_` (used for increasing rate limit)",
                    type: "str",
                },
                rateLimit: {
                    name: "📈 Rate Limit",
                    title: "View the current rate limit status",
                    type: "action",
                },
                debug: {
                    name: "🐞 Debug",
                    title: "Enable debug mode",
                    type: "bool",
                },
            },
        },
    };
    const config = new GM_config(configDesc);

    // Helper function for css
    function injectCSS(id, css) {
        const style = document.head.appendChild(
            document.createElement("style"),
        );
        style.id = idPrefix + id;
        style.textContent = css;
        return style;
    }
    function cssHelper(id, enable) {
        const current = document.getElementById(idPrefix + id);
        if (current) {
            current.disabled = !enable;
        } else if (enable) {
            injectCSS(id, dynamicStyles[id]);
        }
    }
    // General functions
    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);
    /**
     * Log the given arguments if debug mode is enabled.
     * @param {...any} args The arguments to log.
     */
    function log(...args) {
        if (config.get("advanced.debug"))
            console.log(
                `%c[${name}]%c`,
                `color:${themeColor};`,
                "color: unset;",
                ...args,
            );
    }
    /**
     * Warn the given arguments.
     * @param {...any} args The arguments to warn.
     */
    function warn(...args) {
        console.warn(
            `%c[${name}]%c`,
            `color:${themeColor};`,
            "color: unset;",
            ...args,
        );
    }
    /**
     * Replace the domain of the given URL with the top domain if needed.
     * @param {string} url The URL to fix.
     * @returns {string} The fixed URL.
     */
    function fixDomain(url) {
        return topDomain === officialDomain
            ? url
            : url.replace(
                  `https://${officialDomain}/`,
                  `https://${topDomain}/`,
              ); // Replace top domain
    }
    /**
     * Fetch the given URL with the personal access token, if given. Also updates rate limit.
     * @param {string} url The URL to fetch.
     * @param {RequestInit} options The options to pass to `fetch`.
     * @returns {Promise<Response>} The response from the fetch.
     */
    async function fetchWithToken(url, options) {
        const token = config.get("advanced.token");
        if (token) {
            if (!options) options = {};
            if (!options.headers) options.headers = {};
            options.headers.accept = "application/vnd.github+json";
            options.headers["X-GitHub-Api-Version"] = "2022-11-28";
            options.headers.Authorization = `Bearer ${token}`;
        }
        const r = await fetch(url, options);
        function parseRateLimit(suffix, defaultValue = -1) {
            const parsed = parseInt(r.headers.get(`X-RateLimit-${suffix}`));
            return isNaN(parsed) ? defaultValue : parsed;
        }
        // Update rate limit
        for (const key of Object.keys(rateLimit)) {
            rateLimit[key] = parseRateLimit(key); // Case-insensitive
        }
        const resetDate = new Date(rateLimit.reset * 1000).toLocaleString();
        log(
            `Rate limit: remaining ${rateLimit.remaining}/${rateLimit.limit}, resets at ${resetDate}`,
        );
        if (r.status === 403 || r.status === 429) {
            // If we get 403 or 429, we've hit the rate limit.
            throw new Error(`Rate limit exceeded! Will reset at ${resetDate}`);
        } else if (rateLimit.remaining === 0) {
            warn(`Rate limit has been exhausted! Will reset at ${resetDate}`);
        }
        return r;
    }

    // CSS-related features
    const dynamicStyles = {
        "code.cursorBlink":
            "[data-testid='navigation-cursor'] { animation: blink 1s step-end infinite; }",
        "code.cursorAnimation":
            "[data-testid='navigation-cursor'] { transition: top 0.1s ease-in-out, left 0.1s ease-in-out; }",
        "code.fullWidth": "#copilot-button-positioner { padding-right: 0; }",
        "appearance.stickyAvatar": `
            div.TimelineItem-avatar { /* .js-timeline-item > .TimelineItem > .TimelineItem-avatar */
                position: relative;
                margin-left: -40px;
                left: -32px;
                & > a[data-hovercard-type='user'] {
                    position: sticky;
                    top: 5em;
                }
            }
            /* .page-responsive .timeline-comment--caret {
                &::before, &::after {
                    position: sticky;
                    top: 4em;
                    margin-top: -1em;
                    transform: translate(-0.5em, 2em);
                }
            } */
        `,
    };
    for (const prop in dynamicStyles) {
        cssHelper(prop, config.get(prop));
    }

    // Code features
    /**
     * Set the tab size for the code blocks.
     * @param {number} size The tab size to set.
     */
    function tabSize(size) {
        const id = idPrefix + "tabSize";
        const style = document.getElementById(id) ?? injectCSS(id, "");
        style.textContent = `pre, code { tab-size: ${size}; }`;
    }

    // Appearance features
    /**
     * Dynamic styles for the enum settings.
     * @type {Object<string, Array<string>>}
     */
    const enumStyles = {
        "appearance.dashboard": [
            "/* Default */",
            "/* Hide Copilot */ #dashboard > .news > .copilotPreview__container { display: none; }",
            "/* Hide Feed */ #dashboard > .news > feed-container { display: none; }",
            `/* Mobile-Like */
            .application-main > div > aside[aria-label="Account context"] {
                display: block !important;
            }
            #dashboard > .news {
                > .copilotPreview__container { display: none; }
                > feed-container { display: none; }
                > .d-block.d-md-none { display: block !important; }
            }`,
        ],
        "appearance.leftSidebar": [
            "/* Default */",
            "/* Hidden */ .application-main .feed-background > aside.feed-left-sidebar { display: none; }",
        ],
        "appearance.rightSidebar": [
            "/* Default */",
            "/* Hide 'Latest changes' */ aside.feed-right-sidebar > .dashboard-changelog { display: none; }",
            "/* Hide 'Explore repositories' */ aside.feed-right-sidebar > [aria-label='Explore repositories'] { display: none; }",
            "/* Hide Completely */ aside.feed-right-sidebar { display: none; }",
        ],
    };
    /**
     * Helper function to configure enum styles.
     * @param {string} id The ID of the style.
     * @param {string} mode The mode to set.
     */
    function enumStyleHelper(id, mode) {
        const style =
            document.getElementById(idPrefix + id) ?? injectCSS(id, "");
        style.textContent = enumStyles[id][mode];
    }
    for (const prop in enumStyles) {
        enumStyleHelper(prop, config.get(prop));
    }

    // Release features
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
            const url = `https://api.${topDomain}/repos/${owner}/${repo}/releases/tags/${version}`;
            const promise = fetchWithToken(url)
                .then((response) => response.json())
                .then((data) => {
                    log(
                        `Fetched release data for ${owner}/${repo}@${version}:`,
                        data,
                    );
                    const assets = {};
                    for (const asset of data.assets) {
                        assets[fixDomain(asset.browser_download_url)] = {
                            downloads: asset.download_count,
                            uploader: {
                                name: asset.uploader.login,
                                url: fixDomain(asset.uploader.html_url),
                            },
                        };
                    }
                    log(
                        `Processed release data for ${owner}/${repo}@${version}:`,
                        assets,
                    );
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
        link.href = uploader.url;
        link.setAttribute("class", "text-sm-left flex-auto ml-md-3 nowrap");
        if (uploader.url.startsWith(`https://${topDomain}/apps/`)) {
            link.classList.add("color-fg-success");
            // Remove suffix `[bot]` from the name if exists
            const name = uploader.name.endsWith("[bot]")
                ? uploader.name.slice(0, -5)
                : uploader.name;
            link.title = `Uploaded by GitHub App @${name}`;
            link.textContent = `@${name}`;
        } else {
            link.classList.add("color-fg-muted");
            link.setAttribute(
                "data-hovercard-url",
                `/users/${uploader.name}/hovercard`,
            );
            link.title = `Uploaded by @${uploader.name}`;
            link.textContent = `@${uploader.name}`;
        }
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
        downloadCount.setAttribute(
            "class",
            "color-fg-muted text-sm-left flex-shrink-0 flex-grow-0 ml-md-3 nowrap",
        );
        return downloadCount;
    }
    /**
     * Show a histogram of the download counts for the given release entry.
     * @param {HTMLElement} asset One of the release assets.
     * @param {number} value The download count of the asset.
     * @param {number} max The maximum download count of all assets.
     */
    function showHistogram(asset, value, max) {
        asset.style.setProperty("--percent", `${(value / max) * 100}%`);
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
        const assets = [];
        const hideArchives = config.get("release.hideArchives");
        entries.forEach((asset) => {
            if (asset.querySelector("svg.octicon-package")) {
                // Release asset
                assets.push(asset);
            } else if (hideArchives) {
                // Source code archive
                asset.remove();
            }
        });
        const releaseData = await getReleaseData(
            info.owner,
            info.repo,
            info.version,
        );
        if (!releaseData) return;
        const maxDownloads = Math.max(
            0,
            ...Object.values(releaseData).map((asset) => asset.downloads),
        );
        assets.forEach((asset) => {
            const downloadLink = asset.children[0].querySelector("a")?.href;
            const statistics = asset.children[1];
            const assetInfo = releaseData[downloadLink];
            if (!assetInfo) return;
            asset.classList.add("ghp-release-asset");
            if (config.get("release.downloads")) {
                const downloadCount = createDownloadCount(assetInfo.downloads);
                statistics.prepend(downloadCount);
            }
            if (config.get("release.uploader")) {
                const uploaderLink = createUploaderLink(assetInfo.uploader);
                statistics.prepend(uploaderLink);
            }
            if (
                config.get("release.histogram") &&
                maxDownloads > 0 &&
                assets.length > 1
            ) {
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
        if (
            !config.get("release.downloads") &&
            !config.get("release.uploader") &&
            !config.get("release.histogram")
        )
            return; // No need to run
        // IncludeFragmentElement: https://github.com/github/include-fragment-element/blob/main/src/include-fragment-element.ts
        const fragments = document.querySelectorAll(
            '[data-hpc] details[data-view-component="true"] include-fragment',
        );
        fragments.forEach((fragment) => {
            if (!fragment.hasAttribute("data-ghp-listening")) {
                fragment.toggleAttribute("data-ghp-listening", true);
                fragment.addEventListener(
                    "include-fragment-replace",
                    onFragmentReplace,
                    { once: true },
                );
                if (config.get("release.hideArchives")) {
                    // Fix assets count
                    const summary =
                        fragment.parentElement.previousElementSibling;
                    if (
                        summary.tagName === "SUMMARY" &&
                        summary.firstElementChild.textContent === "Assets"
                    ) {
                        const counter = summary.querySelector("span.Counter");
                        if (counter) {
                            const count = parseInt(counter.textContent) - 2; // Exclude the source code archives
                            log(counter, count + 2, count);
                            counter.textContent = count.toString();
                            counter.title = count.toString();
                        }
                    }
                }
            }
        });
    }
    if (location.hostname === topDomain) {
        // Only run on GitHub main site
        document.addEventListener("DOMContentLoaded", setupListeners, {
            once: true,
        });
        // Examine event listeners on `document`, and you can see the event listeners for the `turbo:*` events. (Remember to check `Framework Listeners`)
        document.addEventListener("turbo:load", setupListeners);
        // Other possible approaches and reasons against them:
        // - Use `MutationObserver` - Not efficient
        // - Hook `CustomEvent` to make `include-fragment-replace` events bubble - Monkey-patching
        // - Patch `IncludeFragmentElement.prototype.fetch`, just like GitHub itself did at `https://github.githubassets.com/assets/app/assets/modules/github/include-fragment-element-hacks.ts`
        //   - Monkey-patching
        //   - If using regex to modify the response, it would be tedious to maintain
        //   - If using `DOMParser`, the same HTML would be parsed twice
        injectCSS(
            "release",
            `
            @media (min-width: 1012px) { /* Making more room for the additional info */
                .ghp-release-asset .col-lg-6 {
                    width: 40%; /* Originally ~50% */
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
        `,
        );
    }

    // Extended search features
    // Go To provider
    const REF_REGEX =
        /^@?(?<owner>[A-Za-z0-9_.-]+)?(?:\/(?<repo>[A-Za-z0-9_.-]+))?(?:#(?<number>\d+))?$/;
    class GoToProvider extends EventTarget {
        priority = 1;
        icon = "rocket";
        name = "Go to..."; // plural group name (i.e. "repositories" or "teams") - will be the visual header
        description = "Go to...";
        singularItemName = "go to"; // singular name for an item (i.e. "repository" or "team") to construct a meaningful aria-label, doesn't appear visually
        value = "go-to"; // visual name of the filter (i.e. "is:")
        type = "search";
        constructor(queryBuilder, input) {
            super();
            queryBuilder.addEventListener("query", (e) => {
                this.handleEvent(e);
            });
            this.input = input;
        }
        /**
         * Parses a reference string like:
         * - `@owner`
         * - `owner/repo`
         * - `@owner/repo#123`
         * - `#123`
         *
         * Returns:
         *   { owner: string|null, repo: string|null, number: number|null }
         *  or null if no valid parts are found.
         */
        parseRef(str) {
            const match = str.match(REF_REGEX);
            const { owner, repo, number } = match?.groups || {};
            const result = {
                owner: owner ?? null,
                repo: repo ?? null,
                number: number ? Number(number) : null,
            };
            // Filling missing owner/repo from the current page if possible
            const owner_present = Boolean(owner);
            const repo_present = Boolean(repo);
            const number_present = Boolean(number);
            switch (true) {
                // 000 No valid parts
                case !owner_present && !repo_present && !number_present:
                // 101 Only owner and number
                case owner_present && !repo_present && number_present:
                    return null;
                // 11x owner/repo provided
                case owner_present && repo_present:
                    return result;
                // 100 Only owner - Check leading `@`
                case owner_present && !repo_present && !number_present: {
                    if (str.startsWith("@")) {
                        return result;
                    } else {
                        return null;
                    }
                }
                // case [false, true, true]:
                // case [false, true, false]: {
                // 01x Repo (and number) provided - try to get owner
                case !owner_present && repo_present: {
                    const owner =
                        this.input.getAttribute("data-current-owner") ||
                        this.input.getAttribute("data-current-org");
                    if (owner) {
                        result.owner = owner;
                        return result;
                    } else {
                        return null;
                    }
                }
                // 001 Only number provided - try to get owner/repo
                case !owner_present && !repo_present && number_present: {
                    const owner_repo = this.input.getAttribute(
                        "data-current-repository",
                    );
                    if (owner_repo) {
                        const [owner, repo] = owner_repo.split("/");
                        result.owner = owner;
                        result.repo = repo;
                        return result;
                    } else {
                        return null;
                    }
                }
            }
        }
        handleEvent(event) {
            const query = event.rawQuery.trim();
            log("GoToProvider handling query event:", event);
            this.handleQuery(query);
        }
        handleQuery(query) {
            const ref = this.parseRef(query);
            if (!ref) return;
            let value, url, icon;
            if (ref.number) {
                // Issue or PR
                value = `${ref.owner}/${ref.repo}#${ref.number}`;
                url = `/${value}`;
                icon = "issue-opened"; // Use issue icon for both issues and PRs
            } else if (ref.repo) {
                // Repository
                value = `${ref.owner}/${ref.repo}`;
                url = `/${value}`;
                icon = "repo";
            } else {
                // User or Organization
                value = `@${ref.owner}`;
                url = `/${ref.owner}`;
                icon = "team"; // The person icon does not show up, so we use the team icon instead
            }
            this.dispatchEvent(
                new SearchItem({
                    value,
                    url,
                    priority: 1,
                    icon,
                }),
            );
        }
    }
    class SearchItem extends Event {
        constructor({
            value,
            url,
            priority = 1,
            description = "",
            icon = undefined, // Octicon
            scope = "DEFAULT", // SearchScopeText
            prefixText = undefined,
            prefixColor = undefined,
            isFallbackSuggestion = undefined,
            isUpdate = undefined,
        }) {
            super(isUpdate ? "update-item" : "search-item");
            this.value = value;
            this.action = { url };
            this.priority = priority;
            this.description = description;
            this.icon = icon;
            this.scope = scope;
            this.prefixText = prefixText;
            this.prefixColor = prefixColor;
            this.isFallbackSuggestion = isFallbackSuggestion || false;
        }
    }
    async function setupGoTo() {
        // Attach provider
        const input = $("qbsearch-input");
        const qb = input.queryBuilder;
        const provider = new GoToProvider(qb, input);
        qb.addEventListener(
            "query-builder:request-provider",
            (e) => {
                qb.attachProvider(provider);
            },
            { once: true },
        );
        await qb.requestProviders();
    }
    if (config.get("extendedSearch.goTo")) {
        document.addEventListener("qbsearch-input:expand", setupGoTo, {
            once: true,
        });
    }

    // Tracking prevention
    function preventTracking() {
        log("Calling preventTracking");
        const elements = [
            // Prevents tracking data from being sent to https://collector.github.com/github/collect
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
            $("meta[name=browser-stats-url]"),
        ];
        elements.forEach((el) => {
            if (el) {
                log("Preventing tracking:", el.name, el.content);
                el.content = "";
            }
        }); // Clear contents instead of removing, to prevent potential issues
        if (elements.some((el) => el)) {
            GM_setValue(
                "trackingPrevented",
                GM_getValue("trackingPrevented", 0) + 1,
            );
        }
    }
    if (config.get("additional.trackingPrevention")) {
        // document.addEventListener("DOMContentLoaded", preventTracking);
        // All we need to remove is in the `head` element, so we can run it immediately.
        preventTracking();
        document.addEventListener("turbo:before-render", preventTracking);
    }

    // Debugging
    if (config.get("advanced.debug")) {
        const events = [
            "turbo:before-render",
            "turbo:before-morph-element",
            "turbo:before-frame-render",
            "turbo:load",
            "turbo:render",
            "turbo:morph",
            "turbo:morph-element",
            "turbo:frame-render",
        ];
        events.forEach((event) => {
            document.addEventListener(event, (e) => log(`Event: ${event}`, e));
        });
    }

    // Callbacks
    const callbacks = {
        "code.tabSize": tabSize,
    };
    for (const [prop, callback] of Object.entries(callbacks)) {
        callback(config.get(prop));
    }

    // Show rate limit
    config.addEventListener("get", (e) => {
        if (e.detail.prop === "advanced.rateLimit") {
            const resetDate = new Date(rateLimit.reset * 1000).toLocaleString();
            alert(
                `Rate limit: remaining ${rateLimit.remaining}/${rateLimit.limit}, resets at ${resetDate}.\nIf you see -1, it means the rate limit has not been fetched yet, or GitHub has not provided the rate limit information.`,
            );
        }
    });
    config.addEventListener("set", (e) => {
        if (e.detail.prop in dynamicStyles) {
            cssHelper(e.detail.prop, e.detail.after);
        }
        if (e.detail.prop in enumStyles) {
            enumStyleHelper(e.detail.prop, e.detail.after);
        }
        if (e.detail.prop in callbacks) {
            callbacks[e.detail.prop](e.detail.after);
        }
    });

    log(`${name} v${version} has been loaded 🎉`);
})();
