// ==UserScript==
// @name         UCAS Helper
// @namespace    http://tampermonkey.net/
// @version      0.1.3
// @description  A helper script for UCAS online systems.
// @author       PRO-2684
// @match        https://sep.ucas.ac.cn/*
// @match        http://xkgo.ucas.ac.cn:3000/*
// @match        https://mooc.mooc.ucas.edu.cn/mooc-ans/js/*
// @match        https://mooc.mooc.ucas.edu.cn/ananas/modules/pdf/index.html*
// @icon         http://ucas.ac.cn/favicon.ico
// @license      gpl-3.0
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://github.com/PRO-2684/GM_config/releases/download/v1.2.2/config.min.js#md5=c45f9b0d19ba69bb2d44918746c4d7ae
// ==/UserScript==

(function() {
    'use strict';
    const { name, version } = GM_info.script;
    const $ = document.querySelector.bind(document);
    const debug = console.debug.bind(console, `[${name}@${version}]`);
    const error = console.error.bind(console, `[${name}@${version}]`);

    const configDesc = {
        "$default": {
            autoClose: false
        },
        sep: {
            name: "🔑 SEP",
            title: "SEP system related helpers (sep.ucas.ac.cn)",
            type: "folder",
            items: {
                autoLogin: {
                    name: "🔐 Auto login*",
                    title: "Choose auto login strategy, works best with browser auto-fill",
                    type: "enum",
                    options: ["None", "Focus", "Auto"],
                    // None: Do nothing
                    // Focus: Focus on the first unfilled field (username, password or captcha), or the submit button if all filled
                    // Auto: Automatically submit the form when all fields are filled, otherwise focus on the first unfilled field; Not working due to browser security policy
                    value: 1, // Default to "Focus"
                },
                autoFillTimeout: {
                    name: "⏳ Auto fill timeout",
                    title: "Waiting time for potential browser auto-fill (in milliseconds)",
                    type: "int",
                    value: 500,
                    min: 0,
                    max: 10000,
                },
                cleanerUI: {
                    name: "🧼 Cleaner UI",
                    title: "Make the navigation page cleaner (appStoreStudent)",
                    type: "bool",
                    value: false,
                },
                extendedEntries: {
                    name: "📂 Extended entries",
                    title: "Add more entries in flyout menus (appStoreStudent)",
                    type: "bool",
                    value: false,
                },
            },
        },
        courseSelection: {
            name: "🪶 Course Selection",
            title: "Course selection system related helpers (xkgo.ucas.ac.cn)",
            type: "folder",
            items: {
                courseIDs: {
                    name: "📃 Course IDs*",
                    title: "Desired courses by ID, separated by space",
                    value: [],
                    input: (_prop, orig, desc) => prompt(desc.title, orig.join(" ")),
                    processor: (_prop, input, _desc) => input.split(" ").filter(s => s),
                    formatter: (_prop, value, desc) => `${desc.name}: ${value.length} selected.`,
                },
                selectFollowed: {
                    name: "☑️ Select followed*",
                    title: "Also select followed courses if available",
                    type: "bool",
                    value: true,
                },
                keepAlive: {
                    name: "🟢 Keep alive",
                    title: "Prevent session timeout by fetching the page periodically",
                    type: "bool",
                    value: false,
                },
                keepAliveInterval: {
                    name: "⏱️ Keep alive interval",
                    title: "Interval (in seconds) to fetch the page (only effective when 'Keep alive' is enabled)",
                    type: "int",
                    value: 5,
                    min: 1,
                    max: 600,
                },
            }
        },
        mooc: {
            name: "🎓 MOOC",
            title: "MOOC system related helpers (mooc.mooc.ucas.edu.cn)",
            type: "folder",
            items: {
                nativeSelector: {
                    name: "📂 Native selector",
                    title: "Use the native file selector instead of the custom one, allowing drag-and-drop",
                    type: "bool",
                    value: false,
                },
                forceFinish: {
                    name: "🏁 Force finish*",
                    title: "Allows you to forcibly mark the file as finished, useful if you got stuck on certain files",
                    type: "bool",
                    value: false,
                },
            },
        },
    };
    const config = new GM_config(configDesc);

    switch (location.host) {
        case "sep.ucas.ac.cn": {
            config.down("sep");
            switch (location.pathname) {
                case "/": { // Login page
                    document.head.appendChild(document.createElement("style")).textContent = `
                        .btn:focus { outline: thin dotted !important; }`;
                    const username = $("#userName1");
                    const password = $("#pwd1");
                    const captcha = $("#certCode1"); // Optional, may not exist
                    const submit = $("#sb1");
                    setTimeout(() => { // Wait for potential auto-fill
                        switch (config.get("sep.autoLogin")) {
                            case 0: // None
                                break;
                            case 1: { // Focus
                                const toFocus = getFirstUnfilled() || submit;
                                toFocus.focus();
                                break;
                            }
                            case 2: { // Auto
                                const toFocus = getFirstUnfilled();
                                if (toFocus) {
                                    toFocus.focus();
                                } else {
                                    submit.click();
                                }
                            }
                        }
                    }, config.get("sep.autoFillTimeout"));
                    function getFirstUnfilled() {
                        // https://stackoverflow.com/a/70182698/16468609
                        if (!(username.value || username.matches(":autofill"))) return username;
                        if (!(password.value || password.matches(":autofill"))) return password;
                        if (captcha && !captcha.value) return captcha;
                        return null;
                    }
                    break;
                }
                case "/appStoreStudent": { // Navigation page
                    setupDynamicStyles("sep", config, {
                        cleanerUI: `
                            #page-topbar, #footer, .footer, .leftServer { display: none; }
                            .page-content { padding-bottom: 0 !important; }
                            .leftMenu .absolute { background-image: none !important; }
                        `,
                    });
                    let addedEntries = [];
                    if (config.get("sep.extendedEntries")) {
                        const obs = new MutationObserver(mutations => {
                            obs.disconnect();
                            addEntries();
                        });
                        obs.observe($("#businessMenuDivId"), { childList: true });
                    }
                    config.addEventListener("set", e => {
                        if (e.detail.prop === "sep.extendedEntries") {
                            if (e.detail.after) {
                                addEntries();
                            } else {
                                for (const entry of addedEntries) {
                                    entry.remove();
                                }
                                addedEntries = [];
                            }
                        }
                    });
                    /**
                     * @param {string} name Entry name
                     * @param {string} href Entry URL
                     * @param {string} afterUrl Insert after this link
                     */
                    function addEntry(name, href, afterUrl) {
                        const base = $(`ul > a[href="${afterUrl}"]`);
                        const copied = base.cloneNode(false);
                        copied.href = href;
                        copied.textContent = name;
                        addedEntries.push(copied);
                        base.insertAdjacentElement("afterend", copied);
                    }
                    function addEntries() {
                        addEntry("考勤系统", "https://sep.ucas.ac.cn/portal/site/539/001/1", "https://sep.ucas.ac.cn/portal/site/218/1252"); // After 在线学习 - 实景课堂
                    }
                    break;
                }
                default:
                    debug("No actions for this page:", location.href);
                    break;
            }
            break;
        }
        case "xkgo.ucas.ac.cn:3000": {
            config.down("courseSelection");
            switch (location.pathname) {
                case "/courseManage/selectCourse": { // Course selection page
                    const listing = $("#courseinfo");
                    const courses = config.get("courseSelection.courseIDs");
                    const selectFollowed = config.get("courseSelection.selectFollowed");

                    let newly_selected = false;
                    for (const row of listing.rows) {
                        newly_selected ||= checkRow(row);
                    }
                    if (newly_selected) {
                        focus();
                    }

                    const obs = new MutationObserver(mutations => {
                        let newly_selected = false;
                        for (const mutation of mutations) {
                            for (const row of mutation.addedNodes) {
                                if (row.tagName === "TR" && checkRow(row)) {
                                    newly_selected = true;
                                }
                            }
                        }
                        if (newly_selected) {
                            focus();
                        }
                    });
                    obs.observe(listing, { childList: true, subtree: false, attributes: false });

                    function checkRow(row) {
                        const id = row.querySelector("[id^=courseCode_]")?.textContent;
                        const followed = row.querySelector("[id^=fid_]")?.checked;
                        const concerned = courses.includes(id) ||
                            (selectFollowed && followed);
                        if (concerned) {
                            const checkbox = row.querySelector("input[name='sids']");
                            const name = row.children[4].textContent;
                            if (checkbox.checked) {
                                debug("Already selected:", id, name);
                                return false;
                            } else if (checkbox.disabled) {
                                debug("Unavailable:", id, name);
                                return false;
                            } else {
                                debug("[!] Available:", id, name);
                                checkbox.click();
                                row.style.filter = "invert(1)";
                                return true;
                            }
                        }
                    }
                    function focus() {
                        const verification = $("#vcode");
                        verification.focus();
                        verification.style.background = "red";
                    }
                }
            }

            let timer = null;
            if (config.get("courseSelection.keepAlive")) {
                timer = setInterval(heartbeat, config.get("courseSelection.keepAliveInterval") * 1000); // Every 4 minutes
            }
            config.addEventListener("set", e => {
                if (e.detail.prop === "courseSelection.keepAlive" ||
                    e.detail.prop === "courseSelection.keepAliveInterval") {
                    const keepAlive = config.get("courseSelection.keepAlive");
                    const interval = config.get("courseSelection.keepAliveInterval");
                    if (keepAlive && !timer) {
                        timer = setInterval(heartbeat, interval * 1000);
                    } else if (!keepAlive && timer) {
                        clearInterval(timer);
                        timer = null;
                    } else if (keepAlive && timer && e.detail.prop === "courseSelection.keepAliveInterval") {
                        clearInterval(timer);
                        timer = setInterval(heartbeat, interval * 1000);
                    }
                }
            });
            function heartbeat() {
                unsafeWindow.fetch("http://xkgo.ucas.ac.cn:3000/courseManage/main", { credentials: "include" })
                    .then(res => {
                        if (res.ok) {
                            debug("Keep alive successful.");
                        } else {
                            error("Keep alive failed:", res.status, res.statusText);
                        }
                    })
                    .catch(err => {
                        error("Keep alive error:", err);
                    });
            }
            break;
        }
        case "mooc.mooc.ucas.edu.cn": {
            config.down("mooc");
            switch (location.pathname) {
                case "/mooc-ans/js/editor20150812/dialogs/attachment_new/attachment.html": { // Answer upload page
                    setupDynamicStyles("mooc", config, {
                        nativeSelector: `
                            #filePickerReady {
                                > .webuploader-pick { display: none !important; }
                                > div[id^="rt_rt_"] {
                                    position: static !important;
                                    width: auto !important;
                                    height: auto !important;
                                    > input.webuploader-element-invisible {
                                        position: static !important;
                                        clip: auto;
                                        border-color: gray;
                                        border-style: dashed;
                                        border-radius: 0.5em;
                                        padding: 0.5em;
                                        transition: border-color 0.2s ease-in-out;
                                        &:focus, &:hover {
                                            border-color: black;
                                        }
                                        &::file-selector-button {
                                            background-color: transparent;
                                            border-radius: 8px;
                                            color: black;
                                            border: 1px solid;
                                            border-color: gray;
                                            height: 2em;
                                            transition: background-color 0.2s ease-in-out;
                                        }
                                        &::file-selector-button:hover {
                                            background-color: lightgray;
                                        }
                                    }
                                }
                            }
                        `,
                    });
                    break;
                }
                case "/ananas/modules/pdf/index.html": { // PDF viewer page
                    if (config.get("mooc.forceFinish")) {
                        const anchor = $("#docContainer");
                        const button = document.createElement("button");
                        button.textContent = "🏁 Force finish";
                        button.style.position = "fixed";
                        button.style.bottom = "0.5em";
                        button.style.left = "0.5em";
                        button.addEventListener("click", () => {
                            const message = new MessageEvent("message", { data: { isFinished: 1 } });
                            unsafeWindow.parent.dispatchEvent(message);
                            button.disabled = true;
                            button.textContent = "✅ Finished";
                        });
                        anchor.insertAdjacentElement("afterend", button);
                    }
                    break;
                }
                default:
                    debug("No actions for this page:", location.href);
                    break;
            }
            break;
        }
        default: {
            error("Unsupported page:", location.href);
            break;
        }
    }

    // Helper functions
    function injectCSS(prefix, name, style) {
        const css = document.head.appendChild(document.createElement("style"));
        css.id = `ucas-helper-${prefix}-${name}`;
        css.textContent = style;
    }
    function toggleCSS(prefix, name, style, enabled) {
        const css = $(`#ucas-helper-${prefix}-${name}`);
        if (css) {
            css.disabled = !enabled;
        } else if (enabled) {
            injectCSS(prefix, name, style);
        }
    }
    function setupDynamicStyles(prefix, config, styles) {
        for (const name in styles) {
            toggleCSS(prefix, name, styles[name], config.proxy[`${prefix}.${name}`]);
        }
        config.addEventListener("set", e => {
            if (e.detail.prop.startsWith(`${prefix}.`)) {
                const name = e.detail.prop.split(".")[1];
                if (name in styles) {
                    toggleCSS(prefix, name, styles[name], e.detail.after);
                }
            }
        });
    }
})();
