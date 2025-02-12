// ==UserScript==
// @name         No Keywords
// @name:zh-CN   移除搜索关键词
// @namespace    http://tampermonkey.net/
// @version      0.3.2
// @description  Get rid of fucking highlighted search keywords.
// @description:zh-CN 去你妈的傻逼高亮搜索关键词。
// @author       PRO
// @match        https://zhidao.baidu.com/question/*
// @match        https://www.bilibili.com/*
// @match        https://blog.csdn.net/*
// @icon         https://cors.cdn.bcebos.com/amis/namespaces/m-activity/iknow-duck/2022-12/1671625780490/%E6%90%9C%E7%B4%A2wap.png
// @grant        none
// @license      gpl-3.0
// ==/UserScript==

(function () {
    'use strict';
    const name = GM_info.script.name;
    const log = console.log.bind(console, `[${name}]`);
    // Adapted from https://www.abeautifulsite.net/posts/querying-through-shadow-roots/
    function shadowQueryAll(selector, rootNode = document) {
        const selectors = String(selector).split('>>>');
        let currentNodes = [rootNode];
        selectors.forEach((selector) => {
            let nextNodes = [];
            currentNodes.forEach(node => {
                if (node instanceof Element && node.shadowRoot) {
                    nextNodes.push(...node.shadowRoot.querySelectorAll(selector));
                } else if (node === rootNode) {
                    nextNodes.push(...rootNode.querySelectorAll(selector));
                }
            });
            currentNodes = nextNodes;
        });
        return currentNodes;
    }
    function fuck(kw) { // `kw` is the element to be fixed
        const txt = kw.textContent;
        const tn = document.createTextNode(txt);
        kw.parentElement.replaceChild(tn, kw);
        log(`Removed keyword "${txt}"`);
    }
    function purify(config) {
        for (const keyword of config.keywords) {
            shadowQueryAll(keyword).forEach(fuck);
        }
        for (const icon of config.icons) {
            shadowQueryAll(icon).forEach(icon => icon.remove());
        }
    }
    const allConfig = {
        "zhidao.baidu.com": {
            keywords: [".rich-content-container a[highlight='true']"],
            icons: [],
            persistent: false
        },
        "www.bilibili.com": {
            keywords: [
                "bili-comments >>> bili-comment-thread-renderer >>> bili-comment-renderer >>> bili-rich-text >>> a[data-keyword]",
                "bili-comments >>> bili-comment-thread-renderer >>> bili-comment-replies-renderer >>> bili-comment-reply-renderer >>> bili-rich-text >>> a[data-keyword]"
            ],
            icons: ["bili-comments >>> bili-comment-thread-renderer >>> bili-comment-renderer >>> bili-rich-text >>> a[data-keyword] > img"],
            persistent: true
        },
        "blog.csdn.net": {
            keywords: ["a.hl-1", "span.words-blog.hl-git-1"],
            icons: [],
            persistent: false
        }
    }
    if (!(window.location.hostname in allConfig)) return;
    const config = allConfig[window.location.hostname];
    if (config.persistent) {
        window.setInterval(() => {
            purify(config);
        }, 1000);
    } else {
        purify(config);
    }
})();
