// ==UserScript==
// @name         Auto grading
// @namespace    http://tampermonkey.net/
// @version      0.7.1
// @description  USTC 自动评价 tqm.ustc.edu.cn
// @author       PRO_2684
// @match        https://tqm.ustc.edu.cn/index.html*
// @icon         https://tqm.ustc.edu.cn/favicon.ico
// @grant        none
// @license      gpl-3.0
// @require      https://update.greasyfork.org/scripts/468177/%E6%95%99%E5%AD%A6%E8%B4%A8%E9%87%8F%E7%AE%A1%E7%90%86%E5%B9%B3%E5%8F%B0%E6%A0%87%E5%87%86%E7%AD%94%E6%A1%88.js
// ==/UserScript==

(function () {
    'use strict';
    if (location.hash.startsWith("#/user/login-zkd/")) return; // Don't run in login page
    const INTERVAL = 500; // ms
    const log = console.log.bind(console, "[Auto grading]");
    let bypass_timer = false;
    let menu_root;
    function clean(str) {
        // Remove spaces
        str = str.replace(/\s+/g, "");
        // Remove leading asterisk
        if (str[0] == '*') str = str.slice(1);
        // Remove leading serial number
        str = str.replace(/^\d*\./, "");
        // Remove "(单选题)"/"(多选题)"
        str = str.replace("(单选题)", "");
        str = str.replace("(多选题)", "");
        return str;
    }
    function on_bypass_click() {
        bypass_timer = !bypass_timer;
        this.textContent = `绕过倒计时 [${bypass_timer ? "已启用" : "已禁用"}]`;
    }
    function add_item(display_name, hint, callback) {
        const new_item = menu_root.appendChild(document.createElement("li"));
        new_item.innerText = display_name;
        new_item.onclick = callback;
        new_item.className = "ant-menu-item";
        new_item.title = hint;
    }
    function help() {
        alert("食用方法:\n1. 进入未完成的评价问卷\n2. 侧栏选择你想要的操作或激活快捷键\n3. 等待脚本执行\n\n快捷键说明:\n- Enter: 智能执行以下中的一项: 下一位教师/选择标准答案/提交回答\n- Shift+Enter: 全自动评教\n- Backspace: 忽略并转到下一个");
    }
    function grade() {
        const questions = document.querySelectorAll("[class^='index_subject-']");
        const disabled = questions[0].querySelector(".ant-radio-wrapper-disabled");
        if (disabled) return false;
        let first_unchosen = null;
        questions.forEach((question) => {
            const required = Boolean(question.querySelector('[class^="index_necessary"]'));
            if (!required) return;
            const tmp = question.querySelector("[class^='index_title']");
            const remark = tmp.querySelector("[class^='index_remarks-']");
            const title = remark?.textContent || clean(tmp.querySelector("[class^='index_richTextContent']").textContent);
            const standard_answer = standard_answers[title];
            log(`${title}: ${standard_answer}`);
            let chosen = false;
            if (standard_answer) {
                const options = question.querySelectorAll('[style="width: 100%;"]');
                for (const option of options) {
                    const is_standard_answer = (standard_answer.indexOf(option.innerText) >= 0);
                    // const is_selected = option.querySelector(".ant-checkbox-checked") || option.querySelector(".ant-radio-checked");
                    if (is_standard_answer) {
                        option.firstChild.click();
                        chosen = true;
                        // break; // Compatible for multiple answers
                    }
                }
            }
            if (!chosen && first_unchosen == null) first_unchosen = question;
        });
        if (first_unchosen != null) {
            first_unchosen.scrollIntoView({ behavior: "smooth" });
            return false;
        }
        return true;
    }
    function ignore() {
        const ignore_btn = root_node.querySelector("[class^='TaskDetailsMainContent_normalButton']");
        if (ignore_btn && ignore_btn.parentElement.parentElement.parentElement.getAttribute('aria-hidden') == 'false') {
            ignore_btn.click();
        } else {
            log("Cannot find ignore button!");
        }
        const tabs = root_node.querySelector("[class='ant-tabs-nav-scroll']");
        if (tabs) {
            tabs = tabs.children[0].children[0];
        } else {
            log("Cannot find teacher/TA list!");
            return;
        }
        let flag = false;
        let tab;
        for (tab of tabs.children) {
            if (flag) {
                tab.click();
                break;
            } else if (tab.getAttribute('aria-selected') == 'true') {
                flag = true;
            }
        }
    }
    async function auto() {
        if (await try_click("button[class^='ant-btn ant-btn-primary']")) // Confirm submission / Next teacher or course
            return true;
        if (grade()) { // Select standard answer
            await try_click("button[class^='ant-btn index_submit']"); // Submit
            return true;
        }
        return false;
    }
    async function full_auto() {
        // Wait INTERVAL ms between auto() resolves and next auto() call
        while (await auto()) {
            await new Promise((resolve) => setTimeout(resolve, INTERVAL));
        }
        alert("Success!");
    }
    function dump() {
        const questions = document.querySelectorAll("[class^='index_subject-']");
        const disabled = questions[0].querySelector(".ant-radio-wrapper-disabled");
        if (disabled) return false;
        let data = {};
        questions.forEach((question) => {
            const required = Boolean(question.querySelector('[class^="index_necessary"]'));
            if (!required) return;
            const tmp = question.querySelector("[class^='index_title']");
            const remark = tmp.querySelector("[class^='index_remarks-']");
            const title = remark?.textContent || clean(tmp.querySelector("[class^='index_richTextContent']").textContent);
            const options = question.querySelectorAll('[style="width: 100%;"]');
            data[title] = [];
            for (const option of options) {
                data[title].push(option.innerText);
            }
        });
        log(JSON.stringify(data));
    }
    function is_displayed(ele) {
        let displayed = true;
        let node = ele;
        while (node) {
            if (node.style.display == "none") {
                displayed = false;
                break;
            }
            node = node.parentElement;
        }
        return displayed;
    }
    function force_enable(ele) {
        ele.removeAttribute("disabled");
        const prefix = "__reactEventHandlers$";
        for (const key of Object.getOwnPropertyNames(ele)) {
            if (key.startsWith(prefix)) {
                ele[key].disabled = false;
            }
        }
    }
    async function until_enabled(ele) {
        return new Promise((resolve) => {
            if (!ele.hasAttribute("disabled")) {
                resolve();
                return;
            } else if (bypass_timer) {
                force_enable(ele);
                resolve();
                return;
            }
            log("Waiting for button to be enabled...", ele);
            const observer = new MutationObserver((mutations, observer) => {
                if (!ele.hasAttribute("disabled")) {
                    observer.disconnect();
                    log("Button is enabled!", ele);
                    resolve();
                }
            });
            observer.observe(ele, { attributes: true });
        });
    }
    async function try_click(selector) {
        const eles = document.querySelectorAll(selector);
        for (const ele of eles) {
            if (ele && is_displayed(ele)) {
                await until_enabled(ele);
                ele.click();
                return true;
            }
        }
        return false;
    }
    // Side bar
    const root_node = document.getElementById('root');
    const config = { attributes: false, childList: true, subtree: true };
    const callback = function (mutations, observer) {
        menu_root = root_node.querySelector('.ant-menu-root');
        if (menu_root) {
            observer.disconnect();
            add_item("使用说明", "自动评教脚本使用说明", help);
            add_item("绕过倒计时 [已禁用]", "（实验性功能）在 Enter 以及全自动评教时绕过 5 秒倒计时", on_bypass_click);
            add_item("自动评价", "自动选择标准答案", grade);
            add_item("忽略并转到下一个", "（若可能）忽略当前助教并转到下一个助教", ignore);
            add_item("全自动评教", "（实验性功能）彻底解放双手", full_auto);
            add_item("输出答案", "（调试用）输出当前问卷的所有答案", dump);
        }
    }
    const observer = new MutationObserver(callback);
    observer.observe(root_node, config);
    // Shortcut
    document.addEventListener("keyup", (e) => {
        if (document.activeElement.nodeName != "INPUT" || document.activeElement.nodeName != "TEXTAREA") {  // Don't trigger when typing
            switch (e.key) {
                case "Enter":
                    if (!e.shiftKey) {
                        auto();
                    } else {
                        full_auto();
                    }
                    break;
                case "Backspace":
                    ignore();
                    break;
                default:
                    break;
            }
        }
    });
})();