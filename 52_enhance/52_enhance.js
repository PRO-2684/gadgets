// ==UserScript==
// @name         52 Enhance
// @namespace    http://tampermonkey.net/
// @version      0.7.5
// @description  52 破解论坛增强脚本
// @author       PRO
// @run-at       document-start
// @match        https://www.52pojie.cn/*
// @icon         http://52pojie.cn/favicon.ico
// @license      gpl-3.0
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://update.greasyfork.org/scripts/470224/1459364/Tampermonkey%20Config.js
// ==/UserScript==

(function() {
    'use strict';
    const idPrefix = "52-enhance-";
    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);
    const configDesc = {
        "$default": {
            autoClose: false
        },
        "hide": {
            name: "🫥 隐藏设置",
            type: "folder",
            items: {
                "one-click": { name: "* 一键隐藏", title: "为旧版代码块添加“隐藏代码”的按钮；一键隐藏所有置顶帖；添加隐藏回复的按钮", type: "bool", value: true },
                "warning": { name: "隐藏提醒", title: "隐藏所有提醒", type: "bool", value: false },
                "avatar-detail": { name: "隐藏头像详情", title: "隐藏头像下的详情 (统计信息、各类奖章、收听按钮)", type: "bool", value: false },
                "rating": { name: "隐藏评分", title: "隐藏所有评分", type: "bool", value: false },
                "comment": { name: "隐藏点评", title: "隐藏所有点评", type: "bool", value: false },
                "serial": { name: "隐藏序号", title: "隐藏主页帖子列表的序号", type: "bool", value: true },
                "background": { name: "隐藏背景", title: "隐藏部分背景图片", type: "bool", value: true },
                "top": { name: "隐藏顶栏", title: "隐藏顶栏和导航栏", type: "bool", value: false },
                "signature": { name: "隐藏签名档", title: "隐藏所有签名档", type: "bool", value: false },
                "allow-tiny-signature": { name: "允许小签名", title: "允许小型签名档 (不含图片)", type: "bool", value: true },
            }
        },
        "regex-filter": { name: "正则过滤", title: "使用正则表达式过滤帖子", type: "str" },
        "css-fix": { name: "CSS 修复", title: "动态透明度；图标上光标不显示为 pointer", type: "bool", value: true },
        "get-to-top": { name: "* 回到顶部", title: "双击导航栏回到顶部；修改回到顶部按钮行为为原生", type: "bool", value: true },
        "emoji-fix": { name: "* 修复 Emoji", title: "修复 Emoji 显示", type: "bool", value: true },
        "native-tip": { name: "* 原生提示", title: "使用原生提示框", type: "bool", value: false },
        "lazy-signature-image": { name: "* 懒加载签名图片", title: "延迟加载签名档中的图片", type: "bool", value: true },
        "image-max-height": { name: "限制图片最大高度", title: "将帖子图片的最大高度限制为 70vh", type: "bool", value: false },
        "auto-sign": { name: "自动签到", title: "进入论坛时自动后台签到", type: "bool", value: true },
        "shortcut": { name: "快捷键", title: "Enter: 快速跳到回复栏", type: "bool", value: true },
        "infinite-scroll": { name: "无限滚动", title: "滚动到末尾时自动加载下一页", type: "bool", value: true },
    };
    const config = new GM_config(configDesc, {
        immediate: false,
        folderDisplay: {
            parentText: "< 返回",
            parentTitle: "返回上级目录",
        }
    });
    const configProxy = config.proxy;
    // Styles
    const dynamicStyle = {
        "css-fix": `#jz52top { opacity: 0.2; transition: opacity 0.2s ease-in-out; }
            #jz52top:hover { opacity: 0.8; }
            .authicn { cursor: initial; }
            @media (any-hover: none) {
                #jz52top { opacity: 0.8; }
                #jz52top:hover { opacity: 0.8; }
            }
            html { scroll-behavior: smooth; }`,
        "hide.warning": ".vw50_kfc_pb, .vw50_kfc_pt, .vw50_kfc_f { display: none; }",
        "hide.avatar-detail": "div.tns.xg2, dl.credit-list, p.md_ctrl, p.xg1, ul.xl.xl2.o.cl { display: none; }",
        "hide.rating": "div.pcb > h3.psth.xs1, dl.rate { display: none; }",
        "hide.comment": "div.pcb > div.cm { display: none; }",
        "hide.serial": "div.boxbg_7ree { background-image: none; padding-left: 0; }",
        "hide.background": "body, textarea#fastpostmessage { background: none !important; }",
        "hide.top": "#toptb, #nv_ph, #nv, .comiis_nav { display: none; }",
        "hide.signature": "div.sign { display: none; }",
        "hide.allow-tiny-signature": "div.sign:not(:has(img)) { display: block; }",
        "image-max-height": "#postlist .plc .t_f img, #postlist .plc .tattl img { max-height: 70vh; }"
    };
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
            injectCSS(id, dynamicStyle[id]);
        }
    }
    // Regex filter
    injectCSS("regex-filter", "#threadlisttableid > .regex-filtered { display: none; }");
    function regexFilterOne(regex, thread) {
        const main = thread.querySelector("tr > th");
        if (!main) return;
        const category = main.querySelector("em")?.textContent ?? "[未知分类]";
        const title = main.querySelector("a.s.xst")?.textContent ?? "未知标题";
        const summary = `${category} ${title}`;
        thread.classList.toggle("regex-filtered", regex.test(summary));
    }
    function regexFilter(regexStr) {
        const threads = $$("#threadlisttableid > [id^='normalthread_']");
        if (regexStr == "") {
            threads.forEach(thread => thread.classList.remove("regex-filtered"));
            return;
        }
        const regex = new RegExp(regexStr, "i");
        threads.forEach(thread => {
            regexFilterOne(regex, thread);
        });
    }
    document.addEventListener("DOMContentLoaded", () => {
        const threadsContainer = $("#threadlisttableid");
        if (threadsContainer) {
            const observer = new MutationObserver(mutations => {
                const regex = new RegExp(configProxy["regex-filter"], "i");
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach(node => {
                            if (node.id && node.id.startsWith("normalthread_")) {
                                regexFilterOne(regex, node);
                            }
                        });
                    }
                });
            });
            observer.observe(threadsContainer, { childList: true });
        }
    });
    // Hide
    function hideOneClick() {
        // Basic CSS
        const css = `div.hidden, tr.hidden { display: none; }
        td.hidden { cursor: help; background: repeating-linear-gradient(135deg, transparent 0, transparent 6px, #e7e7e7 6px, #e7e7e7 12px, transparent 12px) no-repeat 0 0, #eee; }
        td.hidden > div { pointer-events: none; }
        td.hidden > div > div > em::after { content: "此回复已被隐藏，点击以重新显示"; }
        .plhin:hover td.hidden .hin { opacity: 0.2; }
        .toggle-reply-header { opacity: 0.6; }
        .toggle-reply-footer { display: block; text-align: center; position: relative; top: 0.8em; }
        @media (max-width: 650px) { td.hidden > div > div > em::after { content: ""; } }`;
        injectCSS("hide.one-click", css);
        // Hide code
        function toggleCode() {
            const code = this.parentNode.parentNode.lastChild;
            if (code.classList.toggle("hidden")) {
                this.textContent = " 显示代码";
            } else {
                this.textContent = " 隐藏代码";
            }
        }
        $$("em.viewsource").forEach(ele => {
            const hide_code = ele.parentNode.appendChild(document.createElement("em"));
            hide_code.setAttribute("style", ele.getAttribute("style"));
            hide_code.setAttribute("num", ele.getAttribute("num"));
            hide_code.textContent = " 隐藏代码";
            hide_code.addEventListener("click", toggleCode);
        });
        // Hide all top threads
        const display = Boolean($$("tbody[id^='stickthread_']").length);
        const table = document.getElementById("threadlisttableid");
        if (display && table) {
            function hideAll() {
                $$("tbody[id^='stickthread_']").forEach(ele => {
                    const close = ele.querySelector("a.closeprev");
                    if (close) close.click();
                });
            }
            const tooltip = $("div#threadlist > div.th > table > tbody > tr > th > div.tf");
            const show_top = tooltip.querySelector("span#clearstickthread");
            show_top.removeAttribute("style");
            show_top.insertAdjacentHTML("beforeend", "&nbsp; ");
            const hide_all = show_top.insertAdjacentElement("beforeend", document.createElement("a"));
            hide_all.href = "javascript:;";
            hide_all.className = "xi2";
            hide_all.textContent = "隐藏置顶";
            hide_all.title = "隐藏置顶";
            hide_all.addEventListener("click", hideAll);
        }
        // Hide reply
        function toggleReply(keep) {
            for (const ele of keep.parentElement.children) {
                if (ele != keep) {
                    ele.classList.toggle("hidden");
                }
            }
            const ele = keep.lastElementChild;
            if (ele.classList.toggle("hidden")) {
                ele.addEventListener("click", e => {
                    toggleReply(keep);
                    ele.removeAttribute("title");
                }, { once: true });
                ele.title = "点击显示被隐藏的回复";
            }
        }
        function toggleReplyFooter() {
            toggleReply(this.parentElement.parentElement);
        }
        function toggleReplyHeader() {
            toggleReply(this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[3]);
        }
        $$("table.plhin tbody:has( tr > td.pls)").forEach(ele => {
            const toggle_reply_footer = document.createElement("a");
            toggle_reply_footer.href = "javascript:void(0);";
            toggle_reply_footer.className = "toggle-reply-footer";
            toggle_reply_footer.textContent = "🫥";
            toggle_reply_footer.addEventListener("click", toggleReplyFooter);
            const keep = ele.querySelector("tr:nth-child(4) > td.pls");
            keep.appendChild(toggle_reply_footer);
            const toggle_reply_header = document.createElement("a");
            toggle_reply_header.href = "javascript:void(0);";
            toggle_reply_header.className = "toggle-reply-header";
            toggle_reply_header.textContent = "👀";
            toggle_reply_header.addEventListener("click", toggleReplyHeader);
            const header = ele.querySelector("tr:nth-child(1) > td.pls > div.favatar div.authi");
            header?.appendChild(toggle_reply_header);
            const blocked = ele.querySelector("tr:nth-child(1) > td.plc > div.pct > div.pcb > div.locked");
            if (blocked) {
                toggle_reply_footer.click(); // Hide blocked replies
            }
        });
    }
    // Get to top
    function getToTop() {
        // Double click navbar to get to top
        const nv = document.getElementById("nv");
        if (nv) nv.addEventListener("dblclick", e => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        // Change get to top button behavior (use vanilla solution)
        const btn = document.getElementById("goTopBtn");
        if (btn) btn.onclick = e => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        };
    }
    // Emoji fix
    function emojiFix() {
        const temp = document.createElement("span");
        function fixEmoji(html) { // Replace patterns like `&amp;#128077;` with represented emoji
            return html.replace(/&(amp;)*#(\d+);/g, (match, p1, p2) => {
                temp.innerHTML = `&#${p2};`;
                // console.log(`${match} -> ${temp.textContent}`); // DEBUG
                return temp.textContent;
            });
        }
        function fix(node) {
            // Select text nodes
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
            let textNode;
            while (textNode = walker.nextNode()) {
                textNode.nodeValue = fixEmoji(textNode.nodeValue);
            }
        }
        const replies = $$("table.plhin td.plc div.pct > div.pcb");
        replies.forEach(fix);
        const signatures = $$("div.sign, div.bm_c.u_profile > div:nth-child(1) > ul:nth-child(3) > li > table > tbody > tr > td");
        signatures.forEach(fix);
    }
    // Native tip
    function nativeTip() {
        function format(s) {
            // Remove HTML tags
            s = s.replace(/(<([^>]+)>)/ig, '');
            // Trim spaces at every line and remove empty lines
            return s.split("\n").map(e => e.trim()).filter(e => e).join("\n");
        }
        const links = $$("a[onmouseover='tip.start(this)']");
        links.forEach(ele => {
            ele.title = format(ele.getAttribute("tips"));
            ele.removeAttribute("onmouseover");
            ele.tips = null;
        });
        document.getElementById("mjs:tip")?.remove();
    }
    // Lazy load signature images
    function lazySignatureImage() {
        $$("div.sign img").forEach(ele => {
            ele.setAttribute("loading", "lazy"); // https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading#images_and_iframes
        });
    }
    // Auto sign
    function autoSign(enable) {
        if (enable && window === window.top) { // Only run on top frame
            const sign1 = $("#um > p:nth-child(3) > a:nth-child(1) > img");
            const sign2 = $("#res-sign > a");
            const url = sign1?.parentElement?.href;
            if (!sign1 || !sign2 || !url || !url.startsWith("https://www.52pojie.cn/home.php?mod=task")) return;
            const waf = "https://www.52pojie.cn/waf_text_verify.html";
            const iframe = document.body.appendChild(document.createElement("iframe"));
            iframe.src = url;
            iframe.style.display = "none";
            sign1.title = "后台签到中...";
            sign1.style.opacity = 0.5;
            sign1.height = 20;
            sign1.src = "https://static.52pojie.cn/static/image/common/imageloading.gif";
            sign1.style.cursor = "progress";
            sign1.parentElement.removeAttribute("href");
            sign2.textContent = "后台签到中...";
            sign2.style.opacity = 0.5;
            sign2.style.cursor = "progress";
            sign2.removeAttribute("href");
            function check() {
                const curr = iframe.contentWindow.location.href;
                let msg;
                if (curr === "https://www.52pojie.cn/home.php?mod=task&item=new" || curr.match(/^https:\/\/www\.52pojie\.cn\/*$/)) {
                    iframe.remove();
                    msg = "签到成功！";
                    sign1.src = "https://static.52pojie.cn/static/image/common/wbs.png";
                    setTimeout(() => {
                        sign2.remove();
                    }, 2000);
                } else if (curr.startsWith(waf)) {
                    msg = "触发了防火墙，请稍后刷新页面检查是否签到成功。";
                    sign1.src = "https://static.52pojie.cn/static/image/common/qds.png";
                    sign1.parentElement.href = url;
                } else {
                    return false;
                }
                sign1.title = msg;
                sign1.style.opacity = 1;
                sign1.style.cursor = "default";
                sign2.textContent = msg;
                sign2.style.opacity = 1;
                sign2.style.cursor = "default";
                return true;
            }
            const timer = window.setInterval(() => {
                if (check()) window.clearInterval(timer);
            }, 500); // Peoredically check if we are done
        }
    }
    // Shortcut
    function handleShortcut(e) {
        if (e.target.tagName == "TEXTAREA" || e.target.tagName == "INPUT") return;
        if (e.key == "Enter") {
            const reply = $("textarea#fastpostmessage");
            if (reply) {
                reply.scrollIntoView();
                reply.focus();
                e.preventDefault();
            }
        }
    }
    function shortcut(enable) {
        if (enable) {
            document.addEventListener("keydown", handleShortcut);
        } else {
            document.removeEventListener("keydown", handleShortcut);
        }
    }
    // Infinite scroll
    let infiniteScrollEnabled = false;
    const infiniteScrollObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            entries[0].target.click();
        }
    });
    function infiniteScroll(enable) {
        const next = $("a#autopbn") ?? $("a#darkroommore");
        if (!next) return;
        if (enable && !infiniteScrollEnabled) {
            infiniteScrollObserver.observe(next);
        } else if (!enable && infiniteScrollEnabled) {
            infiniteScrollObserver.unobserve(next);
        }
        infiniteScrollEnabled = enable;
    }
    // CSS injection
    for (const prop in dynamicStyle) {
        cssHelper(prop, configProxy[prop]);
    }
    // Run on DOMContentLoaded
    document.addEventListener("DOMContentLoaded", () => {
        configProxy["hide.one-click"] && hideOneClick();
        configProxy["get-to-top"] && getToTop();
        configProxy["emoji-fix"] && emojiFix();
        configProxy["native-tip"] && nativeTip();
        configProxy["lazy-signature-image"] && lazySignatureImage();
        regexFilter(configProxy["regex-filter"]);
        autoSign(configProxy["auto-sign"]);
        shortcut(configProxy["shortcut"]);
        infiniteScroll(configProxy["infinite-scroll"]);
    });
    // Listen to config changes
    const callbacks = {
        "regex-filter": regexFilter,
        "auto-sign": autoSign,
        "shortcut": shortcut,
        "infinite-scroll": infiniteScroll
    };
    config.addEventListener("set", e => {
        const callback = callbacks[e.detail.prop];
        if (callback && (e.detail.before !== e.detail.after)) {
            callback(e.detail.after);
        } else if (e.detail.prop in dynamicStyle) {
            cssHelper(e.detail.prop, e.detail.after);
        }
    });
})();
