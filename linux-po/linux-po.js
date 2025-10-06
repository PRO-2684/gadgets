// ==UserScript==
// @name         Linux.po
// @namespace    http://tampermonkey.net/
// @version      0.2.0
// @description  对 linux.do 的增强脚本
// @author       PRO-2684
// @match        https://linux.do/*
// @run-at       document-start
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABOxJREFUWEfNV0tslFUU/s7/nmmHmWE6NRUqKZXER9OIuNFA3Ei6w6CUWiPGjRiaSLtoWZi4MnFBu2gxgYgLjRgqtNHIrsGFBqIbAdPUR4LQYIXGTseZ6WPmfx+9f+dvphRIDWPxzm7+e8/3nXPPOfc7hLssZiYAKhHZ4RZm3gtgD4Am27Z3EpEsvjGzp2naRQCTAM4R0ZcVZzQADhHxnaAEyKrFzALYKRtPADjuOE7n2NgYLly4iPHxcVy6dEVAl88SduzYjtbWVuzatRNtbW1QVXUYQBcR5ct2lm1WAq4iwMxa6DUzD7qu2z04OIRjxz7A1NQNF4BfUxOTa2pqZKKl48yMxcVFb3Fx3gMgNTZuUQ4ffhs9Pd1QFGXoHxI95X3LtkMSKwgws05EFjNvBDAxMjLacOhQF7LZjF1XV6/GYjESoJ7nwff9FZGTJAmyLAdk5ufneXZ2xkml0tqJE8fR3r5vGkALEf0VYqwiEHpeLBY3RyKRqb6+IxgY6DfT6YeMWCwGx3EC42tZgqSqqoIIMpk/zd7ePqO//yhKpVJjNBr9ozLKQQTCOy97nu3oeAVnz56xmpqa9Tt5uxYSYk8YlcnJa9b+/R36mTOfi79T5UgEOUEi28MMZeZbfX1HGgYG+q3m5m26ZVlrxbrnPl3Xce3aVau3t0/v7z86TUQPlx0nQSBIDJFwo6Oj3e3t7WZz8zbDtperryokNE0TJMyRkVFj376Xg8QMsMNSy2Qyufr6ehE4RCKRVUl2vyzEdZRKJVFEmJmZQTqdTooSDQjYtn365s2bnRMTE3Y8Htc8z0e5wu4Xd/m8yF9ZllAoFOyWlhZt06ZNw5qmvRoQyOVybBgGDMMQaX7H5lQ1JgCbpkmmaSKZTBLlcrm9RPQFM7ue5ylVBLqrKVmWXSJSmPklKhQKHzPzG+ImAIi+vR4rwCKiTyifz38D4HkAoo0Gj8s6rBDrW0FA9Pf1Ar7dN08QWFt//Y/C8r8g8MCv4MEm4QMvw7ARAeyC16cRgWQXKDcikdz5fI4hGWBlfVoxuSbBN5FIJJeenPy8e5rMG53y3GWb1aQGXim3qlaBJIGcvO1t2K6xsWU4EVPKjxFzgnKZXHysfukpkqoGudKQ6H8ACm0z4GRaPEV5+olZe5LInmUejPz2WXf0+wMmElEDfnUFCSQNyBfN4rOnjNKjrw3VEfUI7BWSLOvxrdrLbzVov560EI/q8KsjySDpQKFo2Y8d1Bee/nA6JVdIsrIiCgRiocAb3SiyG77bDeX3ry3EI7ooDrCI3b+VCQyIwYkUoFCy3Ede0OeeOw+liFQ8HsjzJVEaXlKoDbNF3gwVU7U/HoT2y0cmamFAiQK+GJTWmpwSIKmAWwQWYNqPv2ksPHUScNCYitJqWR6SuMqsbyOygkjUYsK4fqohOv46YMJGBCpkgwKtJiJye6WQtOSx0F6eySjBgQGt2PopzK0HppUFtAjPQ4wQ856jWZZ5UFrwuo3J92Bcfx9YdFwQfEEl+FUuDx4ceGBIqFEVc+s7MJvehV8rD6XWOppVXMfyIJljTvjAcWnB7VQzX0HNnoc8dwly4YeV+PFn4G3YASe1G076Rfi1yrAEdIlSq8yz2wv8rpklBpafAVWUaHholnkv+dgjWWiC5+6sEDIeZOWir2OSJZyrqxjPRak9cY/x/G9pa4SNlgBs7AAAAABJRU5ErkJggg==
// @license      gpl-3.0
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://github.com/PRO-2684/GM_config/releases/download/v1.2.2/config.min.js#md5=c45f9b0d19ba69bb2d44918746c4d7ae
// ==/UserScript==

(function () {
    'use strict';
    const { name, version } = GM_info.script;
    const idPrefix = "linux-po-";
    const configDesc = {
        $default: {
            autoClose: false,
        },
        appearance: {
            name: "🎨 外观",
            title: "外观",
            type: "folder",
            items: {
                $default: {
                    value: false,
                    input: "current",
                    processor: "not",
                    title: (prop, value, desc) => desc.name,
                    formatter: (prop, value, desc) => `${desc.name}: ${value ? "🫥" : "👀"}`,
                },
                sidebarManager: {
                    name: "⬅️ 侧栏管理",
                    title: "允许你隐藏侧栏中的各个部分",
                    type: "folder",
                    items: {
                        customCategories: { name: "自定义板块" },
                        externalLinks: { name: "外部链接" },
                        categories: { name: "类别" },
                        tags: { name: "标签" },
                        messages: { name: "消息" },
                        channels: { name: "频道" },
                        directMessages: { name: "直接消息" },
                        chat: { name: "聊天" },
                        bottomMenu: { name: "底部菜单" },
                    },
                },
                postManager: {
                    name: "📝 帖子管理",
                    title: "允许你隐藏帖子的各个部分",
                    type: "folder",
                    items: {
                        secondaryName: { name: "次要名称" },
                        userTitle: { name: "头衔" },
                        userStatus: { name: "自定义状态" },
                        posterIcon: {
                            name: "🍰",
                            title: "加入社区纪念日以及生日图标 (discourse-cakeday)",
                        },
                        postNotice: {
                            name: "帖子通知",
                            title: "新用户首次发言、回归用户等标识",
                        },
                        flair: {
                            name: "资质",
                            title: "展示在头像右下角",
                        },
                    },
                },
                other: {
                    name: "⚙️ 其他",
                    title: "其他设置",
                    type: "folder",
                    items: {
                        hideDashedBox: {
                            name: "📢 隐藏虚线框",
                        },
                    },
                },
            },
        },
        accessibility: {
            name: "♿ 辅助功能",
            title: "辅助功能",
            type: "folder",
            items: {
                largerClickArea: {
                    name: "👆 增大点击区域",
                    title: "增大帖子列表中各帖子的可点击区域 (仅支持左键)",
                    type: "bool",
                    value: true,
                },
                showPostsFloor: {
                    name: "🔢 显示楼层",
                    title: "在帖子中显示楼层",
                    type: "bool",
                    value: false,
                },
                atBeforeUsername: {
                    name: "👤 @用户名",
                    title: "在用户名前添加 @ 符号",
                    type: "bool",
                    value: false,
                },
            },
        },
    };
    const config = new GM_config(configDesc);

    // Helper function for css
    function injectCSS(id, css) {
        const style = document.head.appendChild(document.createElement("style"));
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
    /**
     * Generates CSS for hiding given sidebar section.
     */
    function hideSidebarSection(section) {
        return `#d-sidebar > .sidebar-sections div.sidebar-section[data-section-name="${section}"] { display: none; }`;
    }
    /**
     * Generates CSS for hiding given post section.
     */
    function hidePostSection(section) {
        return `.post-stream > .topic-post > article .names > .${section} { display: none; }`;
    }

    // Dynamic styles
    const dynamicStyles = {
        "appearance.sidebarManager.customCategories": hideSidebarSection("community"),
        "appearance.sidebarManager.externalLinks": hideSidebarSection("外部链接"),
        "appearance.sidebarManager.categories": hideSidebarSection("categories"),
        "appearance.sidebarManager.tags": hideSidebarSection("tags"),
        "appearance.sidebarManager.messages": hideSidebarSection("messages"),
        "appearance.sidebarManager.channels": hideSidebarSection("chat-channels"),
        "appearance.sidebarManager.directMessages": hideSidebarSection("chat-dms"),
        "appearance.sidebarManager.chat": "#d-sidebar > button[data-key='chat'] { display: none; }",
        "appearance.sidebarManager.bottomMenu": "#d-sidebar > div.sidebar-footer-wrapper { display: none; }",
        "appearance.postManager.secondaryName": hidePostSection("second"),
        "appearance.postManager.userTitle": hidePostSection("user-title"),
        "appearance.postManager.userStatus": hidePostSection("user-status-message-wrap"),
        "appearance.postManager.posterIcon": hidePostSection("poster-icon"),
        "appearance.postManager.flair": ".topic-avatar > .post-avatar > .avatar-flair { display: none; }",
        "appearance.postManager.postNotice": ".post-stream > .topic-post > article .post-notice { display: none; }",
        "appearance.other.hideDashedBox": ".discourse-cnpkv, .topic-above-suggested-outlet, .discovery-list-container-top-outlet, .topic-above-post-stream-outlet { display: none; }",
        "accessibility.largerClickArea": ".topic-list-item > .main-link { cursor: pointer; }",
        "accessibility.showPostsFloor": `.post-stream > .topic-post > article[id^='post_'] {
            &::after {
                content: attr(id) '#'; color: var(--primary-med-or-secondary-med);
                position: absolute; right: 0; top: calc(0.8em + 1px);
                text-indent: -2.5em; overflow: hidden; /* Dirty trick to hide leading "post_" */
            }
            .embedded-posts > .reply .post-link-arrow > a.post-info::after {
                content: attr(href) '#'; display: inline-flex;
                text-indent: -7.9em; overflow: hidden; /* Dirty trick to hide leading "/t/topic/\\d{6}/" */
            }
        }
        .timeline-container > .topic-timeline > .timeline-scrollarea-wrapper > .timeline-date-wrapper > .now-date[href^='/t/topic/']::after {
            content: attr(href) '#'; display: inline-flex; margin-left: 0.2em;
            text-indent: -7.9em; overflow: hidden; /* Dirty trick to hide leading "/t/topic/\\d{6}/" */
        }`,
        "accessibility.atBeforeUsername": `
            span.username > a::before { content: "@"; }
            div.username::before { content: "@"; }
        `,
    };
    for (const prop in dynamicStyles) {
        cssHelper(prop, config.get(prop));
    }

    // Accessibility
    // Larger click area
    let largerClickAreaEnabled = false;
    /**
     * Handles the click event when larger click area is enabled.
     * @param {MouseEvent} e
     */
    function largerClickAreaHandler(e) {
        if (e.defaultPrevented || !e.isTrusted) return;
        const mainLink = e.target.closest(".topic-list-item > .main-link");
        if (mainLink) {
            e.preventDefault();
            const title = mainLink.querySelector(".title.raw-link.raw-topic-link");
            title?.click();
        }
    }
    /**
     * Enables or disables the larger click area feature.
     * @param {boolean} enable
     */
    function largerClickArea(enable) {
        if (enable && !largerClickAreaEnabled) {
            document.body.addEventListener("click", largerClickAreaHandler);
            largerClickAreaEnabled = true;
        } else if (!enable && largerClickAreaEnabled) {
            document.body.removeEventListener("click", largerClickAreaHandler);
            largerClickAreaEnabled = false;
        }
    }

    // Callbacks
    const callbacks = {
        "accessibility.largerClickArea": largerClickArea,
    };
    for (const [prop, callback] of Object.entries(callbacks)) {
        callback(config.get(prop));
    }
    config.addEventListener("set", e => {
        if (e.detail.prop in dynamicStyles) {
            cssHelper(e.detail.prop, e.detail.after);
        }
        if (e.detail.prop in callbacks) {
            callbacks[e.detail.prop](e.detail.after);
        }
    });

    // https://linux.do/emojis.json
})();

