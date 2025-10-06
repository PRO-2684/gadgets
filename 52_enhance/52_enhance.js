// ==UserScript==
// @name         52 Enhance
// @namespace    http://tampermonkey.net/
// @version      0.8.3
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
// @require      https://github.com/PRO-2684/GM_config/releases/download/v1.2.2/config.min.js#md5=c45f9b0d19ba69bb2d44918746c4d7ae
// ==/UserScript==

(function() {
    'use strict';
    const idPrefix = "52-enhance-";
    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);
    const configDesc = {
        $default: {
            autoClose: false,
            folderDisplay: {
                parentText: "< 返回",
                parentTitle: "返回上级目录",
            }
        },
        hide: {
            name: "🫥 隐藏设置",
            type: "folder",
            items: {
                oneClick: { name: "* 一键隐藏", title: "为旧版代码块添加“隐藏代码”的按钮；一键隐藏所有置顶帖；添加隐藏回复的按钮", type: "bool", value: true },
                warning: { name: "隐藏提醒", title: "隐藏所有提醒", type: "bool", value: false },
                avatar: { name: "隐藏头像", title: "隐藏帖子内用户头像", type: "bool", value: false },
                avatarDetail: { name: "隐藏头像详情", title: "隐藏头像下的详情 (统计信息、各类奖章、收听按钮)", type: "bool", value: false },
                rating: { name: "隐藏评分", title: "隐藏所有评分", type: "bool", value: false },
                comment: { name: "隐藏点评", title: "隐藏所有点评", type: "bool", value: false },
                serial: { name: "隐藏序号", title: "隐藏主页帖子列表的序号", type: "bool", value: true },
                background: { name: "隐藏背景", title: "隐藏部分背景图片", type: "bool", value: true },
                top: { name: "隐藏顶栏", title: "隐藏顶栏和导航栏", type: "bool", value: false },
                signature: { name: "隐藏签名档", title: "隐藏所有签名档", type: "bool", value: false },
                allowTinySignature: { name: "允许小签名", title: "允许小型签名档 (不含图片)", type: "bool", value: true },
            }
        },
        display: {
            name: "🎨 显示设置",
            type: "folder",
            items: {
                regexFilter: { name: "正则过滤", title: "使用正则表达式过滤帖子", type: "str" },
                cssFix: { name: "CSS 修复", title: "动态透明度；图标上光标不显示为 pointer", type: "bool", value: true },
                imageMaxHeight: { name: "限制图片最大高度", title: "将帖子图片的最大高度限制为 70vh", type: "bool", value: false },
                removeMinHeight: { name: "移除最小高度限制", title: "移除帖子的最小高度限制", type: "bool", value: false },
                nativeTip: { name: "* 原生提示", title: "使用原生提示框", type: "bool", value: false },
                modernize: { name: "现代化", title: "使论坛更现代化", type: "bool", value: false },
            }
        },
        utility: {
            name: "🔧 实用功能",
            type: "folder",
            items: {
                getToTop: { name: "* 回到顶部", title: "双击导航栏回到顶部；修改回到顶部按钮行为为原生", type: "bool", value: true },
                emojiFix: { name: "* 修复 Emoji", title: "修复 Emoji 显示", type: "bool", value: true },
                lazySignatureImage: { name: "* 懒加载签名图片", title: "延迟加载签名档中的图片", type: "bool", value: true },
                autoSign: { name: "自动签到", title: "进入论坛时自动后台签到", type: "bool", value: true },
                shortcut: { name: "快捷键", title: "Enter: 快速跳到回复栏", type: "bool", value: true },
                infiniteScroll: { name: "无限滚动", title: "滚动到末尾时自动加载下一页", type: "bool", value: true },
            }
        },
    };
    const config = new GM_config(configDesc);
    const configProxy = config.proxy;
    // Styles
    const styleData = {
        forumInactive: "data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2048%2048%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20id%3D%22SVGRepo_bgCarrier%22%20stroke-width%3D%220%22%3E%3C%2Fg%3E%3Cg%20id%3D%22SVGRepo_tracerCarrier%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fg%3E%3Cg%20id%3D%22SVGRepo_iconCarrier%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M9.24199%2026.4192C9.37704%2026.5551%209.42249%2026.7564%209.35899%2026.9372L9.04753%2027.8242C8.70721%2028.7933%208.32807%2029.6686%207.94869%2030.4389C9.12478%2030.1237%2010.2749%2029.6537%2011.1431%2028.9757L11.8278%2028.441C11.969%2028.3307%2012.1583%2028.3044%2012.3242%2028.372L13.1287%2028.6997C15.149%2029.5228%2017.4898%2030%2020%2030C24.0274%2030%2027.5965%2028.7732%2030.1137%2026.8853C32.6303%2024.9978%2034%2022.5431%2034%2020C34%2017.4569%2032.6303%2015.0022%2030.1137%2013.1147C27.5965%2011.2268%2024.0274%2010%2020%2010C15.9726%2010%2012.4035%2011.2268%209.88629%2013.1147C7.36971%2015.0022%206%2017.4569%206%2020C6%2022.0684%206.89945%2024.0606%208.5795%2025.7522L9.24199%2026.4192ZM6.63696%2032.7576C6.04508%2032.8523%205.51332%2032.91%205.085%2032.9451C4.65926%2032.9801%204.40822%2032.4819%204.65098%2032.1304C4.87529%2031.8056%205.14301%2031.394%205.43023%2030.9028C5.99192%2029.9423%206.62822%2028.6774%207.16049%2027.1616C5.17509%2025.1626%204%2022.6842%204%2020C4%2013.3726%2011.1634%208%2020%208C28.8366%208%2036%2013.3726%2036%2020C36%2026.6274%2028.8366%2032%2020%2032C17.2389%2032%2014.6411%2031.4754%2012.3741%2030.5519C10.6896%2031.8675%208.39738%2032.4761%206.63696%2032.7576Z%22%20fill%3D%22%237d7d7d%22%3E%3C%2Fpath%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M22.2988%2030.8717C21.5494%2030.9563%2020.7817%2031.0001%2020%2031.0001C19.9399%2031.0001%2019.88%2030.9998%2019.8201%2030.9993C21.9473%2034.0883%2026.2448%2036.2001%2031.2%2036.2001C33.4089%2036.2001%2035.4871%2035.7805%2037.3007%2035.0417C38.4838%2035.9656%2040.0417%2036.4537%2041.3574%2036.7115C41.9428%2036.8262%2042.4803%2036.8953%2042.9154%2036.9369C43.3407%2036.9776%2043.5944%2036.4798%2043.3571%2036.1246C43.1384%2035.7973%2042.8807%2035.383%2042.6115%2034.8901C42.2283%2034.1881%2041.8218%2033.3266%2041.4716%2032.3293C43.0599%2030.7302%2044%2028.7475%2044%2026.6001C44%2022.1692%2039.9975%2018.4394%2034.5562%2017.3335C34.792%2018.0278%2034.9377%2018.7481%2034.984%2019.4875C36.5555%2019.908%2037.9398%2020.5785%2039.051%2021.4119C40.9885%2022.865%2042%2024.7198%2042%2026.6001C42%2028.1316%2041.3356%2029.6282%2040.0526%2030.9199L39.3901%2031.587C39.2551%2031.7229%2039.2096%2031.9241%2039.2731%2032.105L39.5846%2032.992C39.7467%2033.4538%2039.9197%2033.8895%2040.0972%2034.2973C39.5092%2034.0802%2038.9679%2033.806%2038.5317%2033.4654L37.847%2032.9307C37.7059%2032.8205%2037.5165%2032.7941%2037.3506%2032.8617L36.5461%2033.1895C34.9792%2033.8278%2033.1579%2034.2001%2031.2%2034.2001C28.0563%2034.2001%2025.2871%2033.2419%2023.349%2031.7883C22.9617%2031.4978%2022.6114%2031.1913%2022.2988%2030.8717Z%22%20fill%3D%22%237d7d7d%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fsvg%3E",
        forumActive: "data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2048%2048%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20id%3D%22SVGRepo_bgCarrier%22%20stroke-width%3D%220%22%3E%3C%2Fg%3E%3Cg%20id%3D%22SVGRepo_tracerCarrier%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fg%3E%3Cg%20id%3D%22SVGRepo_iconCarrier%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M20%2032C28.8366%2032%2036%2026.6274%2036%2020C36%2013.3726%2028.8366%208%2020%208C11.1634%208%204%2013.3726%204%2020C4%2022.6842%205.17509%2025.1626%207.16049%2027.1616C6.35561%2029.4537%205.31284%2031.1723%204.6499%2032.1319C4.4071%2032.4834%204.65714%2032.9802%205.08289%2032.9453C6.78453%2032.8058%2010.1224%2032.3105%2012.3741%2030.5519C14.6411%2031.4754%2017.2389%2032%2020%2032Z%22%20fill%3D%22%237d7d7d%22%3E%3C%2Fpath%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M22.7843%2033.8337C31.4033%2032.7928%2038%2026.9957%2038%2020.0002C38%2019.4632%2037.9611%2018.9333%2037.8855%2018.4121C41.5534%2020.1003%2044%2023.136%2044%2026.6002C44%2028.7476%2043.0599%2030.7303%2041.4716%2032.3295C42.068%2034.0278%2042.8276%2035.3325%2043.3579%2036.1259C43.5953%2036.481%2043.3423%2036.9779%2042.917%2036.9372C41.5041%2036.8021%2039.0109%2036.3773%2037.3007%2035.0418C35.4872%2035.7806%2033.4089%2036.2002%2031.2%2036.2002C27.9781%2036.2002%2025.0343%2035.3074%2022.7843%2033.8337Z%22%20fill%3D%22%237d7d7d%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fsvg%3E",
    };
    const dynamicStyles = {
        "hide.warning": ".vw50_kfc_pb, .vw50_kfc_pt, .vw50_kfc_f { display: none; }",
        "hide.avatar": "td.pls > .pls.favatar .avatar { display: none; }",
        "hide.avatarDetail": "div.tns.xg2, dl.credit-list, p.md_ctrl, p.xg1, ul.xl.xl2.o.cl { display: none; }",
        "hide.rating": "div.pcb > h3.psth.xs1, dl.rate { display: none; }",
        "hide.comment": "div.pcb > div.cm { display: none; }",
        "hide.serial": "div.boxbg_7ree { background-image: none; padding-left: 0; }",
        "hide.background": "body, .psth, .pn { background-image: none; } textarea#fastpostmessage { background: none !important; }",
        "hide.top": "#toptb, #nv_ph, #nv, .comiis_nav { display: none; }",
        "hide.signature": "div.sign { display: none; }",
        "hide.allowTinySignature": "div.sign:not(:has(img)) { display: block; }",
        "display.regexFilter": "#threadlisttableid > .regex-filtered { display: none; }",
        "display.cssFix": `#jz52top { opacity: 0.2; transition: opacity 0.2s ease-in-out; }
            #jz52top:hover { opacity: 0.8; }
            .authicn { cursor: initial; }
            @media (any-hover: none) {
                #jz52top { opacity: 0.8; }
                #jz52top:hover { opacity: 0.8; }
            }
            html { scroll-behavior: smooth; }`,
        "display.imageMaxHeight": "#postlist .plc .t_f img, #postlist .plc .tattl img { max-height: 70vh; }",
        "display.removeMinHeight": ".pcb > .t_fsz { min-height: auto; }",
        "display.modernize": `.scbar_icon_td, .scbar_txt_td, .scbar_type_td, .nvhm { background: none; }
            .scbar_type_td > a::after { content: " ▼"; }
            .scbar_btn_td { background: none; > button#scbar_btn { &::after { content: " 🔍"; } > strong { display: none; }}}
            .nvhm { line-height: unset; &::before { content: "🏠"; }}
            .fl .bm_h { background-image: none; background-color: #f2f2f2; }
            .bm_c > .fl_tb > tbody > tr > td { &.fl_icn > a, &.fl_g > .fl_icn_g > a {
                display: block; width: 3em; height: 3em; background-size: contain; > img { display: none; }
                &:has(img[src="https://static.52pojie.cn/static/image/common/forum_new.gif"]) { background: url("${styleData.forumActive}"); }
                &:has(img[src="https://static.52pojie.cn/static/image/common/forum.gif"]) { background: url("${styleData.forumInactive}"); }
            }}
            #newspecial, #newspecialtmp, #post_reply, #post_replytmp { padding: 6px 12px; background: #328cdf; border: 1px solid gray; color: white; > img { display: none; } &::after { font-size: 14px; }}
            #newspecial::after, #newspecialtmp::after { content: "发帖 📝"; }
            #post_reply::after, #post_replytmp::after { content: "回复 🗨️"; }
            #p_btn a { background-image: none; background: gray; border-radius: 0.5em; > i { background-image: none; > img { display: none; }
                &:has(img[src="https://static.52pojie.cn/static/image/common/fav.gif"]) { &::before { content: "⭐ "; }}
                &:has(img[src="https://static.52pojie.cn/static/image/common/agree.gif"]) { &::before { content: "👍 "; }}
                &:has(img[src="https://static.52pojie.cn/static/image/common/collection.png"]) { &::before { content: "📚 "; }} /* Alt: 📥 */
                &:has(img[src="https://static.52pojie.cn/static/image/common/rec_add.gif"]) { &::before { content: "⬆️ "; }}
                &:has(img[src="source/plugin/csu_wechat_scan/image/wx.png"]) { &::before { content: "🟢 "; }} /* TODO: Consider https://simpleicons.org/ */
                &:has(img[src="static/image/common/recyclebin.gif"]) { &::before { content: "🗑️ "; }}
            }}
            .side-star { vertical-align: unset !important; > span[onmouseover^="showMenu"] { > img { display: none; } &::before { content: "⭐"; }}}
            .pob.cl > em > a { background-image: none; padding: 5px 10px;
                &.cmmnt::before { content: "☕ "; }
                &.fastre::before { content: "🗨️ "; }
                &.replyadd::before { content: "⬆️ "; }
            }
            .ico_increase, .ico_fall { background-image: none; text-indent: unset; vertical-align: unset; color: #F26C4F; }
            .ico_increase::before { content: "⬆"; }
            .ico_fall::before { content: "⬇"; }
            .fa_fav, .fa_rss { padding-left: 0; }
            .fa_fav { background-image: none; &::before { content: "⭐ "; }}
            .fa_rss { background-image: none; &::before { content: "📰 "; }}
            #newspecial_menu { width: unset; li { background: none !important; > a { padding: 3px 0; &::before { content: "📄 "; }}  &.poll > a::before {  content: "📊 "; }}}
            #pt .z em { line-height: unset; background: none; font-size: 16px; width: unset; padding: 0 0.5em; }
            .authi > .authicn.vm { display: none; }
            #threadlisttableid > tbody > tr {
                > td.icn {
                    font-variant-emoji: text; font-size: 1.5em; color: gray;
                    > a { color: gray; > img { display: none; } &::after { content: "📄︎"; }}
                    /* &:has(img[src="https://static.52pojie.cn/static/image/common/folder_common.gif"]) { > a::after { color: gray; }} */
                    &:has(img[src="https://static.52pojie.cn/static/image/common/folder_new.gif"]) { > a::after { color: yellowgreen; }}
                    &:has(img[src="https://static.52pojie.cn/static/image/common/pin_1.gif"]) { > a::after { content: "📌︎"; }}
                    &:has(> img[src="https://static.52pojie.cn/static/image/common/ann_icon.gif"]) { &::after { content: "📢︎"; } > img { display: none; }}
                }
                > th {
                    > a.closeprev { background-image: none; text-indent: unset; margin: 0; width: 1.5em; height: 1.5em; text-decoration: none; color: gray; &::before { content: "❌︎"; } &:hover { color: #0099cc; }}
                    /* > img {} */
                }
            }
            .popupcredit { .pc_l, .pc_c, .pc_inner, .pc_r { background: none; } tr { background: #ff7400; display: block; border-radius: 1em; } }
            /* img[src="https://static.52pojie.cn/static/image/common/collapsed_no.gif"] */`,
    };
    // Helper functions
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
    function notify(type, text) {
        // [Noty](https://ned.im/noty/options)
        // `type` (`noty_type__`): alert, love, post, normal, warn, credit, hide
        new Noty({
            text,
            type,
            layout: 'topCenter',
            theme: 'mint',
            closeWith: ['click'],
            timeout: 2000,
            progressBar: true,
            visibilityControl: true,
            animation: {
                open: 'noty_effects_bottom_open',
                close: 'noty_effects_bottom_close'
            },
            callbacks: {},
        }).show();
    }
    // Regex filter
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
                const regex = new RegExp(configProxy["display.regexFilter"], "i");
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
        injectCSS("hide.oneClick", css);
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
            notify("normal", "后台签到中...");
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
                    notify("normal", "签到成功！");
                    iframe.remove();
                    msg = "签到成功！";
                    sign1.src = "https://static.52pojie.cn/static/image/common/wbs.png";
                    setTimeout(() => {
                        sign2.remove();
                    }, 2000);
                } else if (curr.startsWith(waf)) {
                    notify("warn", "触发了防火墙，请稍后刷新页面检查是否签到成功。");
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
    for (const prop in dynamicStyles) {
        cssHelper(prop, configProxy[prop]);
    }
    // Run on DOMContentLoaded
    document.addEventListener("DOMContentLoaded", () => {
        configProxy["hide.oneClick"] && hideOneClick();
        configProxy["display.nativeTip"] && nativeTip();
        configProxy["utility.getToTop"] && getToTop();
        configProxy["utility.emojiFix"] && emojiFix();
        configProxy["utility.lazySignatureImage"] && lazySignatureImage();
        regexFilter(configProxy["display.regexFilter"]);
        autoSign(configProxy["utility.autoSign"]);
        shortcut(configProxy["utility.shortcut"]);
        infiniteScroll(configProxy["utility.infiniteScroll"]);
    });
    // Listen to config changes
    const callbacks = {
        "display.regexFilter": regexFilter,
        "utility.autoSign": autoSign,
        "utility.shortcut": shortcut,
        "utility.infiniteScroll": infiniteScroll
    };
    config.addEventListener("set", e => {
        const callback = callbacks[e.detail.prop];
        if (callback && (e.detail.before !== e.detail.after)) {
            callback(e.detail.after);
        }
        if (e.detail.prop in dynamicStyles) {
            cssHelper(e.detail.prop, e.detail.after);
        }
    });
})();
