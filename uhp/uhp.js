// ==UserScript==
// @name         USTC Helper
// @name:zh-CN   USTC 助手
// @license      gpl-3.0
// @namespace    http://tampermonkey.net/
// @version      1.2.1
// @description  Various useful functions for USTC students: verification code recognition, auto login, rec performance improvement and more.
// @description:zh-CN  为 USTC 学生定制的各类实用功能：验证码识别，自动登录，睿客网性能优化以及更多。
// @author       PRO
// @match        https://mail.ustc.edu.cn/*
// @match        https://passport.ustc.edu.cn/*
// @match        https://rec.ustc.edu.cn/*
// @match        https://recapi.ustc.edu.cn/identity/other_login?*
// @match        https://www.bb.ustc.edu.cn/*
// @match        https://jw.ustc.edu.cn/*
// @match        https://young.ustc.edu.cn/login*
// @match        https://young.ustc.edu.cn/nginx_auth/*
// @match        https://wvpn.ustc.edu.cn/*
// @match        https://icourse.club/*
// @icon         https://passport.ustc.edu.cn/images/favicon.ico
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @require      https://update.greasyfork.org/scripts/462234/1391948/Message.js
// @require      https://update.greasyfork.org/scripts/470224/1317473/Tampermonkey%20Config.js
// ==/UserScript==

(function () {
    'use strict';
    const window = unsafeWindow;
    const log = console.log.bind(console, "[USTC Helper]");
    function boolDesc(name, title=null, defaultVal=true) {
        return {
            name: name,
            value: defaultVal,
            input: "current",
            processor: "not",
            formatter: "boolean",
            autoClose: false,
            title: title
        };
    }
    function values(list) {
        return function (prop, orig) {
            const idx = list.indexOf(orig);
            if (idx == -1) return list[0];
            return list[(idx + 1) % list.length];
        }
    }
    const config_descs = {
        passport: {
            "passport/enabled": boolDesc("Enabled", "Whether to enable USTC Helper for this site"),
            "passport/recog_code": boolDesc("Code recognition", "Enable auto recognizing verification code"),
            "passport/focus": boolDesc("Focus", "Automatically focuses on verification code or \"Login\" button"),
            "passport/service": boolDesc("Service", "Hint service domain and its credibility"),
            "passport/auto_login": boolDesc("Auto login", "Automatically clicks \"Login\" button (Official services only)"),
        },
        mail: {
            "mail/enabled": boolDesc("Enabled", "Whether to enable USTC Helper for this site"),
            "mail/focus": boolDesc("Focus", "Automatically focuses on \"Login\" button"),
            "mail/remove_watermark": boolDesc("Remove watermark", "Remove the annoying watermark"),
            "mail/remove_background": boolDesc("Remove background", "Remove the background image"),
        },
        rec: {
            "rec/enabled": boolDesc("Enabled", "Whether to enable USTC Helper for this site"),
            "rec/autologin": boolDesc("Auto login", "Automatically clicks \"Login\" button"),
            "rec/opencurrent": boolDesc("Open in current tab", "Set some links to be opened in current tab (Significantly improves performance)"),
        },
        bb: {
            "bb/enabled": boolDesc("Enabled", "Whether to enable USTC Helper for this site"),
            "bb/autoauth": boolDesc("Auto authenticate", "Automatically authenticate when accessing outside school net"),
            "bb/autologin": boolDesc("Auto login", "Automatically clicks \"Login\" button"),
            "bb/showhwstatus": boolDesc("Show homework status", "Query all homework status (may consume some network traffic)"),
        },
        jw: {
            "jw/enabled": boolDesc("Enabled", "Whether to enable USTC Helper for this site"),
            "jw/login": {
                name: "Login",
                value: "focus",
                input: values(['none', 'focus', 'click']),
                autoClose: false,
                title: "What to do to the login button: 'none', 'focus', 'click'"
            },
            "jw/shortcut": boolDesc("Shortcut", "Enable shortcut support"),
            "jw/score_mask": boolDesc("Score mask", "Allows you to hide/reveal your scores with dblclick"),
            "jw/detailed_time": boolDesc("Detailed time", "Show start/end time of each class"),
            "jw/css": boolDesc("CSS improve", "Minor CSS improvements"),
            "jw/privacy": boolDesc("Privacy", "Hides your personal information", false),
            "jw/sum": boolDesc("Sum", "Show the sum of credit and period at course table"),
        },
        young: {
            "young/enabled": boolDesc("Enabled", "Whether to enable USTC Helper for this site"),
            "young/auto_auth": boolDesc("Auto authenticate", "Automatically authenticate when accessing outside school net"),
            "young/default_tab": {
                name: "Default tab",
                value: "/myproject/SignUp",
                autoClose: false,
                title: "The tab to be opened on entering"
            },
            "young/auto_tab": boolDesc("Auto tab", "Auto navigate to frequently-used submenu"),
            "young/no_datascreen": boolDesc("No data screen", "Remove annoying data screen image"),
            "young/shortcut": boolDesc("Shortcut", "Enable shortcut support")
        },
        wvpn: {
            "wvpn/enabled": boolDesc("Enabled", "Whether to enable USTC Helper for this site"),
            "wvpn/custom_collection": boolDesc("Custom collection", "Allows you to fully customize your collection"),
        },
        icourse: {
            "icourse/enabled": boolDesc("Enabled", "Whether to enable USTC Helper for this site"),
            "icourse/filelist": boolDesc("File list", "Show all uploaded files and name them properly"),
            "icourse/linklist": boolDesc("Link list", "Show all links posted in the review section"),
            "icourse/css": boolDesc("CSS improve", "Minor CSS improvements"),
            "icourse/native_top": boolDesc("Native top", "Use native method to scroll to top"),
            "icourse/shortcut": boolDesc("Shortcut", "Enable shortcut support"),
        }
    };
    Qmsg.config({
        showClose: true,
        timeout: 2000
    });

    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);
    async function timer(callback, interval = 500, times = 16) {
        return new Promise((resolve, reject) => {
            const timer = window.setInterval(() => {
                if (times-- === 0) {
                    window.clearInterval(timer);
                    resolve(false);
                } else if (callback()) {
                    window.clearInterval(timer);
                    resolve(true);
                }
            }, interval);
        });
    }
    function setupDynamicStyles(host, config, styles) {
        function injectCSS(name) {
            const css = document.head.appendChild(document.createElement("style"));
            css.id = `ustc-helper-${host}-${name}`;
            css.textContent = styles[name];
        }
        function toggleCSS(name, enabled) {
            const css = $(`#ustc-helper-${host}-${name}`);
            if (css) {
                css.disabled = !enabled;
            } else if (enabled) {
                injectCSS(name);
            }
        }
        for (const name in styles) {
            toggleCSS(name, config[`${host}/${name}`]);
        }
        window.top.addEventListener(GM_config_event, e => {
            if (e.detail.type == "set" && e.detail.prop.startsWith(`${host}/`)) {
                const name = e.detail.prop.split("/")[1];
                if (name in styles) {
                    toggleCSS(name, e.detail.after);
                }
            }
        });
    }

    switch (window.location.host) {
        case 'mail.ustc.edu.cn': {
            const config_desc = config_descs.mail;
            const config = GM_config(config_desc);
            if (!config["mail/enabled"]) {
                console.info("[USTC Helper] 'mail' feature disabled.");
                break;
            }
            if (config["mail/focus"]) {
                timer(() => {
                    const btn = $(".formLogin .submit");
                    if (btn) {
                        btn.focus();
                        return true;
                    } else {
                        return false;
                    }
                }).then((result) => {
                    console.info(result ? "[USTC Helper] Login button focused." : "[USTC Helper] Login button not found!");
                });
            }
            const mail_css = {
                "remove_watermark": "div.watermark-wrap { display: none; }",
                "remove_background": ".lymain .lybg { display: none; }"
            }
            setupDynamicStyles("mail", config, mail_css);
            break;
        }
        case 'passport.ustc.edu.cn': {
            const config_desc = config_descs.passport;
            const config = GM_config(config_desc);
            let is_official = false;
            if (!config["passport/enabled"]) {
                console.info("[USTC Helper] 'passport' feature disabled.");
                break;
            }
            // Code recognition
            const img = $('img.validate-img');
            if (config["passport/recog_code"] && img) {
                // Adapted from https://greasyfork.org/scripts/431681 - Great thanks to the author @J-Paven!
                const dim = [128, 32];
                [img.style.width, img.style.height] = dim.map(x => x + 'px');
                const canvas = document.createElement("canvas");
                canvas.style.backgroundColor = "white";
                const ctx = canvas.getContext("2d");
                const input = $('#validate');
                const template = [
                    '00000001111110000000000001111111111000001000111111111111000000011111111111111000001111110000111111000011111000000111110000111110000001111100011111000000001111100111110000000011111001111100000000111110011111000000001111100111110000000011111001111100000000111110011111000000001111100111110000000011111000111110100001111100001111100000011111000011111100001111110000011111111111111000000011111111111100000000011111111110000000000011111110000000',
                    '00000011111111000000000011111111110000000000111111111100000100001111111111000000000011100111110000001010000001111100000001000000011111000000000000000111110000000000000001111100000100000000011111000000000000000111110000000000000001111100000000000000011111000000000000000111110001000000000001111100000000000000011111000000000000000111110000000000000001111100000000001111111111111110000011111111111111100000111111111111111000001111111111111110',
                    '00001111111110000000001111111111111000000011111111111111100000111111111111111000001111000001111111010010000000001111110000000000000001111100000000000000011111000000000000000111110000000000001011111100000000000001111110000000000000111111100000000000011111110000000000001111111000000000001111111100000000000111111110000000000011111111000000000001111111100000000000111111111111111100001111111111111111000011111111111111110000111111111111111100',
                    '00000111111110000000010111111111111010000001111111111111000000011111111111111000000110000001111110000000000000001111100000000000000011111000000000000000111110000000000001011111000000000011111111110000000000111111110000000000001111111111000000000011111111111000000000000001111111000000000000000111110000000000000001111100001000000000011111000011100000011111110000111111111111111000001111111111111110000001111111111110000000000111111110000000',
                    '00000000011111110000000000000111111100000000000011111111001000000001111111110000000000011101111100000000001111011111000000000111100111110000000001110001111100000000111101011111010000011110000111110100000111000001111100000011110000011111000001111000000111110000011100000001111100000111111111111111111001111111111111111110011111111111111111100111111111111111111000000000000111110000000000000001111100000000000000011111000000000000000111110000',
                    '01011111111111110000000111111111111100000001111111111111000000011111111111110000000111110000000000000001111100000000000000011111000000000000000111111111110000000001111111111110000000011111111111110001000111111111111110000001110000011111110000010000000011111100000000000000011111000000000000010111110000000000000001111100001000000000111111000011100000011111100000111111111111111000001111111111111100000001111111111110000000000011111110000000',
                    '00000001011111100000000000011111111110000000011111111111110000001111111111111100000011111100000111000001111100000000010000011111000000000000001111100111111000000011111111111111000000111111111111111000001111111111111111000011111100000111111000111110000000111110001111100000001111100011111000000011111000111110000000111110000111100000001111100001111100000111110000001111111111111110000001111111111110000000001111111111000000000000111111000000',
                    '00111111111111111100001111111111111111000011111111111111110000111111111111111100000000001000111110000000000000001111100000000000000111111000000000000001111100000000000000111111000000000000001111100000000000000111111000000000000001111100000000000000111111000000000000001111100000000100000011111000000000000001111110000000000000011111000000000000001111110000000000000011111000000000000001111110000000000000011111000000000000001111110000000000',
                    '00000001111111000001000001111111111100000000111111111111100000011111111111111100000111111000111111000001111100000111110000011111000001111100000111111000111111000000111111111111100000000111111111110000000001111111111100000101111111111111110000011111100001111100001111100000001111100011111000000011111000111110000000111110001111100000001111100011111100000111111000011111111111111100000111111111111111000000111111111111100000000001111111000000',
                    '00000001111110000000000001111111111000000000111111111111000000011111111111111000000111110000011111000011111000000011110000111110000000111100001111100000001111100011111000000011111000111110000000111110001111110000011111100001111111111111111000001111111111111110000001111111111111100000001111110011111000000000000001111100000101000000011111000001110000011111100000011111111111111000000111111111111100000000111111111100000000000011111100000000'
                ];
                function recognize() {
                    ctx.drawImage(img, 0, 0);
                    const imgData = ctx.getImageData(0, 0, ...dim).data;
                    let greenAverage = 0;
                    for (let j = 0; j < 128 * 32; j++) {
                        greenAverage += imgData[4 * j + 1];
                    }
                    greenAverage /= (128 * 32);
                    let numbers = ["", "", "", ""];
                    for (let i = 4; i < 26; i++) {
                        for (let k = 0; k < 4; k++) {
                            for (let j = 26 + 21 * k; j < 46 + 21 * k; j++) {
                                const pixel = imgData[4 * (128 * i + j) + 1] > greenAverage ? '0' : '1';
                                numbers[k] += pixel;
                            }
                        }
                    }
                    let code = "";
                    for (let i = 0; i < 4; i++) {
                        let index = '0';
                        let minDiff = 440;
                        for (let j = 0; j < 10; j++) {
                            let diff = 0;
                            for (let k = 0; k < 440; k++) {
                                if (numbers[i].charAt(k) != template[j].charAt(k)) {
                                    diff += 1;
                                }
                            }
                            if (diff < minDiff) {
                                minDiff = diff;
                                index = j + '';
                            }
                        }
                        code += index;
                    }
                    input.value = code;
                }
                img.addEventListener('load', recognize);
                if (img.complete) recognize();
            }
            const form = $('.loginForm');
            if (!form) {
                log("Form not found!");
                break;
            }
            form.removeAttribute("style");
            const options = {
                childList: true,
                attributes: false,
                subtree: true
            }
            function focus() {
                $('#username')?.focus();
                $('#password')?.focus();
                const code = $('#validate');
                if (code) {
                    code.focus();
                    if (code.value == '') return;
                }
                const btn = $('#login');
                if (!btn) {
                    console.error("[USTC Helper] Login button not found!");
                    return;
                }
            }
            function login() {
                window.setTimeout(() => {
                    const username = $('#username')?.value;
                    const password = $('#password')?.value;
                    log(`Auto login: ${username} ${password}`);
                    if (username && password) $('#login')?.click();
                    else console.error("[USTC Helper] Username or password not found!");
                }, 4000);
            }
            function hint() {
                const notice = document.createElement('span');
                notice.classList.add("inline-block");
                const params = new URL(window.location.href).searchParams;
                let service_url = params.get('service');
                if (!service_url) {
                    is_official = true; // No service URL, simply login to CAS
                    return;
                }
                service_url = decodeURIComponent(service_url);
                const domain = service_url.split('/')[2];
                let color;
                let status; // Official Student/Staff Third-party
                let suffix;
                if (/.+\.ustc\.edu\.cn/.test(domain)) {
                    if (domain == 'home.ustc.edu.cn') {
                        status = "Student";
                        color = "#d0d01b";
                        suffix = "@mail.ustc.edu.cn";
                    } else if (domain == 'staff.ustc.edu.cn') {
                        status = "Staff";
                        color = "#d0d01b";
                        suffix = "@ustc.edu.cn";
                    } else {
                        status = "Official";
                        color = "green";
                        is_official = true;
                    }
                } else {
                    status = "Third-party";
                    color = "red";
                }
                console.info(`[USTC Helper] ${status} service: ${service_url}`);
                if (color == "#d0d01b") {
                    const regex = new RegExp(/https?:\/\/(home|staff)\.ustc\.edu\.cn\/~([^\/]+)/i);
                    const match = service_url.match(regex);
                    if (match) {
                        const name = match[2];
                        const email = name + suffix;
                        log("Contact email: " + email);
                        notice.innerHTML = `<a style="color: #d0d01b;" title="Contact" href="mailto:${email}">${status}</a> service: <span style="color: grey;" title="${service_url}">${domain}</span>`;
                    } else {
                        log("Unable to determine contact email!");
                        notice.innerHTML = `<a style="color: #d0d01b;" title="Unrecognized">${status}</a> service: <span style="color: grey;" title="${service_url}">${domain}</span>`;
                    }
                } else {
                    notice.innerHTML = `<span style="color: ${color};">${status}</span> service: <span style="color: grey;" title="${service_url}">${domain}</span>`;
                }
                $("#footer")?.appendChild(notice);
            }
            function main() {
                if (config["passport/focus"]) focus();
                if (config["passport/service"]) hint();
                if (config["passport/auto_login"] && is_official) {
                    window.setTimeout(() => {
                        login();
                    }, 1000);
                }
                observer.disconnect();
            }
            const observer = new MutationObserver(main);
            observer.observe(form, options);
            break;
        }
        case 'rec.ustc.edu.cn': {
            const config_desc = config_descs.rec;
            const config = GM_config(config_desc);
            if (!config["rec/enabled"]) {
                console.info("[USTC Helper] 'rec' feature disabled.");
                break;
            }
            if (config["rec/opencurrent"]) {
                window.webpackJsonp.push_ = window.webpackJsonp.push;
                window.webpackJsonp.push = (val) => {
                    if (val[0][0] !== "chunk-5ae262a1")
                        return window.webpackJsonp.push_(val);
                    else { // Following script is adapted from https://rec.ustc.edu.cn/js/chunk-5ae262a1.b84e1461.js
                        val[1]["2c03"] = function (t, e, s) {
                            "use strict";
                            (function (t) {
                                s("55dd");
                                var r = s("a67e");
                                e["a"] = {
                                    name: "GroupLister",
                                    components: {
                                        GroupCreate: function () {
                                            return Promise.all([s.e("chunk-390136ce"), s.e("chunk-662e27b9")]).then(s.bind(null, "18fa"))
                                        },
                                        GroupAdd: function () {
                                            return s.e("chunk-5b916374").then(s.bind(null, "c1c7"))
                                        },
                                        GroupEdit: function () {
                                            return Promise.all([s.e("chunk-390136ce"), s.e("chunk-0daeb591")]).then(s.bind(null, "1fa6"))
                                        }
                                    },
                                    data: function () {
                                        return {
                                            status: {
                                                GroupCreateStatus: !1,
                                                GroupAddStatus: !1,
                                                GroupEditStatus: !1
                                            },
                                            loading: !1,
                                            nothing: !1,
                                            group: {},
                                            sortBy: {},
                                            headers: [{
                                                id: 1,
                                                title: "群名称",
                                                class: "groupname",
                                                sort: "asc",
                                                showSort: !0,
                                                field: "group_name"
                                            }, {
                                                id: 2,
                                                title: "群号",
                                                class: "groupid",
                                                sort: "des",
                                                showSort: !1,
                                                field: "group_number"
                                            }, {
                                                id: 3,
                                                title: "成员",
                                                class: "groupuser",
                                                sort: "des",
                                                showSort: !1,
                                                field: "group_memeber_count"
                                            }, {
                                                id: 5,
                                                title: "分享",
                                                class: "groupshare",
                                                sort: "des",
                                                showSort: !1,
                                                field: "group_share_file_count"
                                            }, {
                                                id: 6,
                                                title: "操作",
                                                class: "groupmenu",
                                                sort: "",
                                                showSort: !1
                                            }]
                                        }
                                    },
                                    created: function () {
                                        this.sortBy = this.headers[0],
                                            this.getGroups()
                                    },
                                    computed: {
                                        userInfo: function () {
                                            return this.$store.state.user.userInfo
                                        }
                                    },
                                    watch: {
                                        $route: function () {
                                            this.getGroups()
                                        }
                                    },
                                    filters: {
                                        identityNameFilter: function (t) {
                                            var e;
                                            switch (t) {
                                                case "owner":
                                                    e = "群主";
                                                    break;
                                                case "admin":
                                                    e = "管理员";
                                                    break;
                                                case "user":
                                                    e = "成员";
                                                    break;
                                                default:
                                                    break
                                            }
                                            return e
                                        }
                                    },
                                    methods: {
                                        createGroup: function () {
                                            t("#newgroup").modal("show")
                                        },
                                        addGroup: function () {
                                            t("#addgroup").modal("show")
                                        },
                                        invite: function (t) {
                                            var e = this.$router.resolve({
                                                name: "group",
                                                params: {
                                                    groupNumber: t.group_number
                                                }
                                            });
                                            this.$confirm({
                                                showYesBtn: !1,
                                                showCopyBtn: !0,
                                                copyBtnText: "复制文字",
                                                title: "邀请入群",
                                                type: "confirm",
                                                content: "打开链接进入群组主页即可申请加入群组：".concat(t.group_name, "，群组主页链接：").concat(window.location.origin).concat(e.href)
                                            }).then((function () { }
                                            )).catch((function () { }
                                            ))
                                        },
                                        goToGroupCloud: function (t, e) {
                                            if (["owner", "admin", "user"].indexOf(t.group_member_identity) < 0)
                                                return this.$message({
                                                    type: "warning",
                                                    message: "您不是组群成员，无法进入群盘"
                                                }),
                                                    !1;
                                            this.$store.commit("setSetting", {
                                                from: !0,
                                                drive: "groupdisk",
                                                tab: e,
                                                group: t
                                            }),
                                                this.$router.push({
                                                    name: "groupDisk",
                                                    params: {
                                                        groupNumber: t.group_number
                                                    }
                                                })
                                        },
                                        isShowMenu: function (t) {
                                            return ["owner", "admin", "user"].indexOf(t.group_member_identity) > -1
                                        },
                                        isEditGroup: function (t) {
                                            return ["owner", "admin"].indexOf(t.group_member_identity) > -1
                                        },
                                        goToGroup: function (t) {
                                            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "group";
                                            if ("wait" === t.group_is_review)
                                                return this.$message({
                                                    type: "warning",
                                                    message: "群组待审核，不允许操作！"
                                                }),
                                                    !1;
                                            if ("refuse" === t.group_is_review)
                                                return this.$message({
                                                    type: "warning",
                                                    message: "群组审核未通过，不允许操作！"
                                                }),
                                                    !1;
                                            // Instead of opening in new tab, we prefer to use vue's solution
                                            // Modifiy start
                                            this.$router.replace({
                                                name: e,
                                                params: {
                                                    groupNumber: t.group_number
                                                }
                                            });
                                            // Modify end
                                        },
                                        goToGroupHome: function (t) {
                                            this.$store.commit("SET_GROUP_SHOWDESC", !1),
                                                this.$router.push({
                                                    name: "group",
                                                    params: {
                                                        groupNumber: t
                                                    }
                                                })
                                        },
                                        handleEditGroup: function (e) {
                                            var s = this;
                                            Object(r["g"])(e.group_number).then((function (t) {
                                                s.group = t.entity
                                            }
                                            )).catch((function (t) {
                                                s.$message({
                                                    type: "error",
                                                    message: t
                                                })
                                            }
                                            )),
                                                t("#editgroup").modal("show")
                                        },
                                        groupRefresh: function () {
                                            this.getGroups()
                                        },
                                        sortGroup: function (t) {
                                            if (6 === t)
                                                return !1;
                                            var e = this;
                                            this.headers.map((function (s) {
                                                return s.id === t ? (s.showSort = !0,
                                                    s.sort = "des" === s.sort ? "asc" : "des",
                                                    e.sortBy = s,
                                                    s) : (s.showSort = !1,
                                                        s.sort = "des",
                                                        s)
                                            }
                                            )),
                                                this.sortGroupBy()
                                        },
                                        getGroups: function () {
                                            var t = this;
                                            this.groups = [],
                                                this.loading = !0,
                                                this.nothing = !1,
                                                Object(r["r"])({}).then((function (e) {
                                                    if (200 === e.status_code)
                                                        if (t.loading = !1,
                                                            t.groups = e.entity.datas,
                                                            e.entity.total > 0) {
                                                            var s = 0;
                                                            e.entity.datas.map((function (t) {
                                                                "user" != t.group_member_identity && t.group_pending_member_count > 0 && (s += t.group_pending_member_count)
                                                            }
                                                            )),
                                                                t.$store.commit("setRequestNums", s),
                                                                t.sortGroupBy(!0)
                                                        } else
                                                            t.nothing = !0;
                                                    else
                                                        t.$message({
                                                            type: "error",
                                                            message: e.message
                                                        })
                                                }
                                                )).catch((function (e) {
                                                    t.$message({
                                                        type: "error",
                                                        message: e
                                                    })
                                                }
                                                ))
                                        },
                                        sortGroupBy: function () {
                                            var t = this
                                                , e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                                            this.groups.sort((function (s, r) {
                                                var o;
                                                return o = e ? r.group_is_review.localeCompare(s.group_is_review) : "group_name" === t.sortBy.field ? s[t.sortBy.field].localeCompare(r[t.sortBy.field]) : s[t.sortBy.field] - r[t.sortBy.field],
                                                    o = "asc" === t.sortBy.sort ? o : -o,
                                                    o
                                            }
                                            ))
                                        },
                                        groupCancel: function (t) {
                                            var e = this
                                                , s = "adopt" === t.group_is_review ? "解散" : "删除";
                                            this.$confirm({
                                                type: "confirm",
                                                content: "".concat(s, "群后，所有关于本群组的信息都将被删除且无法恢复，确定").concat(s, "【").concat(t.group_name, "】吗？"),
                                                showCancleBtn: !0,
                                                showYesBtn: !0,
                                                custom: []
                                            }).then((function () {
                                                Object(r["u"])({
                                                    groups_list: [t.group_number]
                                                }).then((function (t) {
                                                    200 === t.status_code ? (e.$message({
                                                        type: "success",
                                                        message: t.message
                                                    }),
                                                        e.getGroups()) : e.$message({
                                                            type: "error",
                                                            message: t.message
                                                        })
                                                }
                                                )).catch((function (t) {
                                                    e.$message({
                                                        type: "error",
                                                        message: t
                                                    })
                                                }
                                                ))
                                            }
                                            )).catch((function () { }
                                            ))
                                        },
                                        groupQuit: function (t) {
                                            var e = this;
                                            this.$confirm({
                                                type: "confirm",
                                                content: "确定退出该群组吗？",
                                                showCancleBtn: !0,
                                                showYesBtn: !0,
                                                custom: []
                                            }).then((function () {
                                                Object(r["v"])({
                                                    group_number: t,
                                                    action: "quit",
                                                    members_list: [e.userInfo.user_number]
                                                }).then((function (t) {
                                                    200 === t.status_code ? (e.$message({
                                                        type: "success",
                                                        message: t.message
                                                    }),
                                                        e.getGroups()) : e.$message({
                                                            type: "error",
                                                            message: t.message
                                                        })
                                                }
                                                )).catch((function (t) {
                                                    e.$message({
                                                        type: "error",
                                                        message: t
                                                    })
                                                }
                                                ))
                                            }
                                            )).catch((function () { }
                                            ))
                                        }
                                    },
                                    mounted: function () {
                                        var t = this;
                                        setTimeout((function () {
                                            for (var e in t.status)
                                                t.status[e] = !0
                                        }
                                        ), 500)
                                    }
                                }
                            }
                            ).call(this, s("1157"))
                        };
                        return window.webpackJsonp.push_(val);
                    }
                };
            }
            if (config["rec/autologin"] && document.location.pathname == '/') {
                const app = $("#app");
                const options = {
                    childList: true,
                    attributes: false,
                    subtree: true
                }
                const observer = new MutationObserver(() => {
                    const btn = $('.navbar-login-btn');
                    if (btn) {
                        btn.click();
                        observer.disconnect();
                    }
                });
                observer.observe(app, options);
            } else if (config["rec/opencurrent"]) {
                const app = $("#app");
                const options = {
                    childList: true,
                    attributes: false,
                    subtree: true
                }
                const observer = new MutationObserver(() => {
                    const l = $$(".app-list").length;
                    if (l) {
                        const links = $$("a");
                        for (const link of links) {
                            if (link.target == '_blank') link.removeAttribute("target");
                        }
                    }
                });
                observer.observe(app, options);
            }
            break;
        }
        case 'recapi.ustc.edu.cn': {
            const config_desc = config_descs.rec;
            const config = GM_config(config_desc);
            if (!config["rec/enabled"]) {
                console.info("[USTC Helper] 'rec' feature disabled.");
                break;
            }
            if (config["rec/autologin"]) {
                const btn = $("#ltwo > div > button");
                if (!btn) {
                    console.error("[USTC Helper] Login button not found!");
                } else {
                    btn.click();
                }
            }
            break;
        }
        case 'www.bb.ustc.edu.cn': {
            const config_desc = config_descs.bb;
            const config = GM_config(config_desc);
            if (!config["bb/enabled"]) {
                console.info("[USTC Helper] 'bb' feature disabled.");
                break;
            }
            if (window.location.pathname == '/nginx_auth/' && config["bb/autoauth"]) {
                $('a')?.click();
            } else if ((window.location.pathname == '/' || window.location.pathname == '/webapps/login/') && config["bb/autologin"]) {
                $('#login > table > tbody > tr > td:nth-child(2) > span > a')?.click();
            } else if (config["bb/showhwstatus"] && window.location.pathname == '/webapps/blackboard/content/listContent.jsp' && document.getElementById('pageTitleText').children[0].textContent == '作业区') {
                const css = document.createElement('style');
                css.textContent = ".ustc-helper-bb-ignored { opacity: 0.4; } .ustc-helper-bb-ignored > .details { display: none; }";
                document.head.appendChild(css);
                const hw_list = document.getElementById('content_listContainer');
                const color_config = ['grey', 'green', 'red', 'yellow', 'grey', 'cyan'];
                const hint_text = ['查询中', '已提交', '未提交', '查询错误', '已忽略', '已评分'];
                // const hint_text = ['Checking', 'Submitted', 'Not submitted', 'Error', 'Ignored', 'Graded'];
                function ignore_hw(course_id, content_id, ignore) {
                    let ignored = localStorage.getItem(course_id) || '[]';
                    ignored = JSON.parse(ignored);
                    if (ignore && !ignored.includes(content_id)) {
                        ignored.push(content_id);
                        log(`Ignoring "${course_id}/${content_id}"...`);
                    } else if (!ignore && ignored.includes(content_id)) {
                        ignored = ignored.filter((v) => v != content_id);
                        log(`Un-ignoring "${course_id}/${content_id}"...`);
                    }
                    if (ignored.length) localStorage.setItem(course_id, JSON.stringify(ignored));
                    else localStorage.removeItem(course_id);
                }
                async function query_status(link) {
                    const r = await fetch(link);
                    if (!r.ok) {
                        log(`Failed to fetch "${r.url}": ${r.status} ${r.statusText}`);
                        return [3, null];
                    } else {
                        const parser = new DOMParser();
                        const html = await r.text();
                        const doc = parser.parseFromString(html, 'text/html');
                        const title = doc.getElementById('pageTitleText').textContent.trim();
                        if (title.startsWith('上载作业')) {
                            return [2, null];
                        } else if (title.startsWith('复查提交历史记录')) {
                            const grade = doc.getElementById("aggregateGrade");
                            const suffix = doc.getElementById("aggregateGrade_pointsPossible");
                            if (grade.value !== '-') {
                                return [5, `${parseFloat(grade.value)}${suffix.textContent.trim()}`];
                            } else {
                                return [1, null];
                            }
                        } else {
                            return [3, null];
                        }
                    }
                }
                async function process(hw) {
                    const link_ = hw.querySelector("h3 > a");
                    if (!link_) return;
                    let status = [0, null]; // 0: Checking  1: Uploaded  2: Not uploaded  3: Error
                    const hint = link_.appendChild(document.createElement('span'));
                    hint.style.color = color_config[status[0]];
                    hint.textContent = `（${hint_text[status[0]]}）`;
                    const link = link_.href;
                    // https://www.bb.ustc.edu.cn/webapps/assignment/uploadAssignment?content_id=_106763_1&course_id=_12559_1&group_id=&mode=view
                    const params = new URL(link).searchParams;
                    const course_id = params.get("course_id");
                    const content_id = params.get("content_id");
                    let ignored = localStorage.getItem(course_id);
                    // Check if this homework is ignored
                    if (ignored) {
                        ignored = JSON.parse(ignored).includes(content_id);
                        if (ignored) {
                            status[0] = 4;
                            // link_.parentNode.parentNode.parentNode.style.opacity = 0.4;
                            link_.parentNode.parentNode.parentNode.classList.add("ustc-helper-bb-ignored");
                            log(`"${course_id}/${content_id}" present in ignore list, so this homework is ignored.`);
                        }
                    }
                    // Not in cache
                    if (!status[0]) {
                        status = await query_status(link);
                        if (status[0] == 1) {
                            log(`Online query indicated that "${course_id}/${content_id}" is uploaded.`);
                        } else if (status[0] == 2) {
                            log(`Online query indicated that "${course_id}/${content_id}" is not uploaded.`);
                        } else if (status[0] == 5) {
                            log(`Online query indicated that "${course_id}/${content_id}" is graded.`);
                        } else {
                            console.warn(`[USTC Helper] Online query "${course_id}/${content_id}" failed!`);
                        }
                    }
                    hint.style.color = color_config[status[0]];
                    hint.textContent = `（${hint_text[status[0]]}${status[1] ? " " + status[1] : ""}）`;
                    hint.title = ignored ? "点击取消忽略此作业" : "点击忽略此作业";
                    hint.addEventListener('click', e => {
                        e.preventDefault();
                        ignore_hw(course_id, content_id, !ignored);
                        hint.title = "刷新页面以生效";
                        hint.style.color = color_config[4];
                        hint.textContent = "（请刷新）";
                    }, { once: true });
                }
                for (const hw of hw_list.children) {
                    process(hw);
                }
            }
            break;
        }
        case 'jw.ustc.edu.cn': {
            const config_desc = config_descs.jw;
            const config = GM_config(config_desc, false);
            if (!config["jw/enabled"]) {
                console.info("[USTC Helper] 'jw' feature disabled.");
                break;
            }
            if (config["jw/login"] && window.location.pathname == "/login") {
                const btn = document.getElementById('login-unified-wrapper');
                if (config["jw/login"] == 'focus') {
                    btn.focus();
                } else if (config["jw/login"] == 'click') {
                    btn.click();
                } else {
                    console.error(`[USTC Helper] Unknown option for jw.login: ${config["jw/login"]}`);
                }
            }
            if (config["jw/shortcut"] && window.top.location.pathname == "/home") {
                const shortcuts = ["ArrowLeft", "ArrowRight", "x", '`', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                function tryClick(tab) {
                    const ele = tab?.querySelector("span.tabTitle");
                    ele?.click();
                }
                document.addEventListener("keydown", (e) => {
                    if (document.activeElement.nodeName != "INPUT" &&
                        shortcuts.includes(e.key)) {
                        const menu = window.top.document.getElementById("e-home-tab-list");
                        const tabs = Array.from(menu.children);
                        const home = window.top.document.querySelector("#e-top-home-page > li > a > div.home-logo");
                        const count = tabs.length;
                        let current = 0;
                        for (const tab of tabs) {
                            if (tab.classList.contains('active')) {
                                break;
                            }
                            current++;
                        }
                        if (current == count) current--;
                        switch (e.key) {
                            case "ArrowLeft":
                                tryClick(tabs[(current - 1 + count) % count]);
                                break;
                            case "ArrowRight":
                                tryClick(tabs[(current + 1) % count]);
                                break;
                            case "x":
                                const close = tabs[current].querySelector("a > i.fa-times");
                                close?.click();
                                break;
                            case "`":
                                home?.click();
                                break;
                            default:
                                const idx = Number(e.key) - 1;
                                if (isNaN(idx)) break;
                                if (0 <= idx && idx < count) {
                                    tryClick(tabs[idx]);
                                }
                                break;
                        }
                    }
                });
            }
            if (config["jw/score_mask"] && window.location.pathname == "/for-std/grade/sheet") {
                function get_status(entry) {
                    // Status:
                    // false: Normal display
                    // true: Masked
                    if (entry.classList.contains("masked")) return true;
                    else return false;
                }
                function set_status_internal(entry, state) {
                    const gpa = entry.children[entry.children.length - 2];
                    const score = entry.lastChild;
                    if (state) {
                        entry.classList.add("masked");
                        entry.setAttribute("data-gpa", gpa.textContent);
                        entry.setAttribute("data-score", score.textContent);
                        gpa.textContent = "";
                        score.textContent = "";
                    } else {
                        entry.classList.remove("masked");
                        let gpa_val = entry.getAttribute("data-gpa");
                        let score_val = entry.getAttribute("data-score");
                        if (gpa_val) gpa.textContent = gpa_val;
                        if (score_val) score.textContent = score_val;
                    }
                }
                function toggle() {
                    set_status_internal(this, !get_status(this));
                }
                function set_status(entry, state) {
                    if (get_status(entry) == state) return;
                    set_status_internal(entry, state);
                }
                function toggle_view() {
                    if (this.hasAttribute("data-value")) {
                        this.lastChild.textContent = this.getAttribute("data-value");
                        this.removeAttribute("data-value");
                    } else {
                        this.setAttribute("data-value", this.lastChild.textContent);
                        this.lastChild.textContent = "尚未评教";
                    }
                }
                function toggle_rank() {
                    if (this.hasAttribute("data-value")) {
                        this.textContent = this.getAttribute("data-value");
                        this.removeAttribute("data-value");
                    } else {
                        this.setAttribute("data-value", this.textContent);
                        this.textContent = "尚未评教";
                    }
                }
                function setup() {
                    const tables = $$("div.semesters > section > div.semester > table");
                    tables.forEach((table) => {
                        let head = table.querySelector("thead");
                        let entries = table.querySelectorAll("tbody > tr");
                        head.addEventListener("dblclick", (e) => {
                            let status = head.getAttribute("data-masked") === "";
                            entries.forEach((entry) => {
                                set_status(entry, !status);
                            });
                            if (status) head.removeAttribute("data-masked");
                            else head.setAttribute("data-masked", "");
                        });
                        entries.forEach((entry) => {
                            entry.addEventListener("dblclick", toggle);
                        });
                    });
                    const history_table = $("table.history-table");
                    history_table.tHead.addEventListener("dblclick", (e) => {
                        history_table.querySelectorAll("tbody:not(.hidden)").forEach((tbody) => {
                            const status = tbody.getAttribute("data-masked") === "";
                            tbody.querySelectorAll("tr").forEach((entry) => {
                                set_status(entry, !status);
                            });
                            if (status) tbody.removeAttribute("data-masked");
                            else tbody.setAttribute("data-masked", "");
                        });
                    });
                    history_table.querySelectorAll("tbody > tr").forEach((entry) => {
                        entry.addEventListener("dblclick", toggle);
                    });
                    const view = $("div.overview > ul");
                    view.childNodes.forEach((node) => {
                        node.addEventListener("dblclick", toggle_view);
                    });
                    const rank = $("div.rankinfo > div");
                    rank.querySelectorAll("b").forEach((node) => {
                        node.addEventListener("dblclick", toggle_rank);
                    });
                }
                timer(() => {
                    const test = $("div.overview > ul > li > span:nth-child(2)");
                    if (test.textContent != "NaN") {
                        setup();
                        return true;
                    }
                    return false;
                }, 1000, 8).then((success) => {
                    console.info("[USTC Helper] Score mask setup " + (success ? "succeeded." : "failed."));
                });
            }
            const jw_css = {
                "detailed_time" : `table.timetable tbody th.span::before, table.timetable tbody th.span::after { font-size: smaller; position: absolute; left: 0.1em; opacity: 0.3; }
                    table.timetable tbody th.span::before { content: attr(data-start); top: 0; } table.timetable tbody th.span::after { content: attr(data-end); bottom: 0; }`,
                "css": `div#dropdown-menu-filter { display: none; } div#dropdown-menu-bg { backdrop-filter: blur(3px); } div.second-menu-wrap div.menu-area { width: 100%; }
                    li.home div.dropdown-menu { width: 25vw !important; min-width: 400px !important; } .primary .item li.primaryLi.hover { transition: transform 0.25s ease; }
                    .primaryLi .subMenus { cursor: initial; opacity: 0.8; } div#shortcut { width: 27em; } .shortcut-panel .shortcut-item { width: 25%; }
                    .primary-container .primaryLi .subMenus { width: 400px; border-radius: inherit; overflow: auto; } #e-content-area #e-op-area div.e-toolbarTab { padding: 0 !important; }
                    .dropdown.path-li .path-dropdown.second-menu-wrap.dropdown-menu { width: auto; padding: 10px; } .dropdown.path-li .path-dropdown.second-menu-wrap.dropdown-menu .menu-area { padding: 0; }`,
                "privacy": `#accountLoginInfo, #home-page .info-username, body > div.container div.top-bar > h2.info-title, .list-group-item > span:not(.pull-left) { filter: blur(0.2em); }
                    img[src='/my/avatar'] { filter: blur(1em); }`
            };
            setupDynamicStyles("jw", config, jw_css);
            if (window.location.pathname.startsWith("/for-std/course-table")) {
                if (config["jw/sum"]) {
                    const table = $("#lessons");
                    if (table) {
                        const rows = table.querySelectorAll("tbody > tr");
                        const indexes = [3, 9];
                        let sums = [0, 0];
                        for (const row of rows) {
                            for (let i = 0; i < indexes.length; i++) {
                                sums[i] += parseFloat(row.children[indexes[i]].textContent);
                            }
                        }
                        const head = table.querySelector("thead > tr");
                        for (let i = 0; i < indexes.length; i++) {
                            head.children[indexes[i]].title = `总计：${sums[i]}`;
                        }
                    }
                }
            }
            break;
        }
        case 'young.ustc.edu.cn': {
            const config_desc = config_descs.young;
            const config = GM_config(config_desc, false);
            if (!config["young/enabled"]) {
                console.info("[USTC Helper] 'young' feature disabled.");
                break;
            }
            if (window.location.pathname == '/nginx_auth/' && config["young/auto_auth"]) {
                document.getElementsByTagName('a')[0].click();
                return;
            }
            const app = $("#app");
            const router = app.__vue__.$router;
            function main(mutations, observer) {
                const menu = app.querySelector(".ant-menu-root");
                if (!menu) return;
                const default_tab = config["young/default_tab"];
                if (default_tab.length)
                    router.push(default_tab);
                const submenus = menu.querySelectorAll("li.ant-menu-submenu-horizontal:not(.ant-menu-overflowed-submenu) > div");
                if (!submenus.length) return;
                observer.disconnect();
                if (config["young/no_datascreen"]) {
                    app.querySelector("div.header-index-wide > a").remove();
                    function getCloseBtn() {
                        return app.querySelector("span[pagekey='/dataAnalysis/visual']").nextElementSibling;
                    }
                    function close() {
                        const tabs = $(".ant-tabs-nav-animated > div").children;
                        if (tabs.length == 1) return false;
                        const closeBtn = getCloseBtn();
                        if (closeBtn) {
                            closeBtn.click();
                            return !getCloseBtn();
                        } else {
                            return false;
                        }
                    }
                    let retryLeft = 15;
                    const interval = setInterval(() => {
                        if (close() || retryLeft-- <= 0) {
                            clearInterval(interval);
                        }
                    }, 500);
                }
                if (config["young/auto_tab"]) {
                    submenus[0].onclick = (e) => {
                        router.push('/dataAnalysis/studentAnalysis');
                        e.stopImmediatePropagation();
                    }
                    submenus[1].onclick = (e) => {
                        router.push('/personalInformation/personalReport');
                    }
                    submenus[2].onclick = (e) => {
                        router.push('/myproject/SignUp');
                    }
                    submenus[5].onclick = (e) => {
                        router.push('/isystem/departUserList');
                    }
                    app.querySelector(".user-dropdown-menu").onclick = (e) => {
                        $("ul.user-dropdown-menu-wrapper > li:nth-child(7) > a").click();
                    }
                    // They're generated dynamically when you hover over the menu...
                    // const submenuItems = $$(".ant-menu-submenu.ant-menu-submenu-vertical"); // Submenu items with even more submenus
                    // log(submenuItems);
                    // submenuItems.forEach((submenuItem) => {
                    //     const subsubmenuItems = submenuItem.querySelectorAll(".ant-menu.ant-menu-vertical.ant-menu-sub.ant-menu-submenu-content > .ant-menu-item");
                    //     if (subsubmenuItems.length == 1) {
                    //         const pathName = subsubmenuItems[0].querySelector("a")?.pathname;
                    //         if (pathName) {
                    //             submenuItem.onclick = (e) => {
                    //                 router.push(pathName);
                    //             }
                    //         }
                    //     }
                    // });
                }
                if (config["young/shortcut"]) {
                    document.addEventListener("keydown", (e) => {
                        if (document.activeElement.nodeName == "INPUT" || document.activeElement.nodeName == "TEXTAREA") {
                            return;
                        }
                        const tabs = $(".ant-tabs-nav-animated > div").children;
                        const count = tabs.length;
                        let current = 0;
                        for (const tab of tabs) {
                            if (tab.attributes["aria-selected"].value == "true") {
                                break;
                            }
                            current++;
                        }
                        switch (e.key) {
                            case "ArrowLeft":
                                tabs[(current - 1 + count) % count].click();
                                break;
                            case "ArrowRight":
                                tabs[(current + 1) % count].click();
                                break;
                            case "x":
                                tabs[current].querySelector("div > i").click();
                                break;
                            default:
                                if (e.key.length == 1) {
                                    const idx = Number(e.key);
                                    if (idx && 0 < idx && idx <= count) {
                                        tabs[idx - 1].click();
                                    }
                                }
                                break;
                        }
                    })
                }
            }
            const options = {
                childList: true,
                attributes: false,
                subtree: true
            }
            const observer = new MutationObserver(main);
            observer.observe(app, options);
            break;
        }
        case 'wvpn.ustc.edu.cn': {
            const config_desc = config_descs.wvpn;
            const config = GM_config(config_desc);
            if (!config["wvpn/enabled"]) {
                console.info("[USTC Helper] 'wvpn' feature disabled.");
                break;
            }
            if (config["wvpn/custom_collection"]) {
                // let element = $("div.portal-search-input-wrap");
                const options = {
                    childList: true,
                    attributes: false,
                    subtree: true
                }
                const callback = (mutations, observer) => {
                    const input = $("input.portal-search__input");
                    const ele = $("div#__layout > div.wrd-webvpn");
                    if (!input || !input.placeholder || !ele) return;
                    const v = ele.__vue__;
                    observer.disconnect();
                    const loading = Qmsg.loading("📦 正在加载依赖库...");
                    const node = document.createElement("script");
                    node.src = "https://cdn.bootcdn.net/ajax/libs/aes-js/3.1.2/index.js";
                    function fail(s, hint) {
                        console.error("[USTC Helper]", s);
                        Qmsg.error(hint);
                    }
                    function success(s, hint) {
                        console.info("[USTC Helper]", s);
                        Qmsg.success(hint);
                    }
                    function cancel() {
                        console.info("[USTC Helper] User calcelled the operation.");
                        Qmsg.info("你终止了收藏操作！😢");
                    }
                    function invalid() {
                        console.warn("[USTC Helper] Invalid input!");
                        Qmsg.warning("你输入了一个不合法的值！🤔");
                    }
                    node.onload = () => {
                        loading.close();
                        success("Aes-js loaded.", "成功加载依赖库！🥳");
                        input.placeholder = "点击五角星或 Ctrl+D 以收藏 🍻";
                        // Encryption, adapted from https://blog.csdn.net/lijiext/article/details/110931285
                        const utf8 = aesjs.utils.utf8;
                        const hex = aesjs.utils.hex;
                        const AesCfb = aesjs.ModeOfOperation.cfb;
                        const wrdvpnKey = 'wrdvpnisthebest!';
                        const wrdvpnIV = 'wrdvpnisthebest!';
                        function textRightAppend(text, mode) {
                            const segmentByteSize = mode === 'utf8' ? 16 : 32;
                            if (!(text.length % segmentByteSize)) {
                                return text;
                            }
                            const appendLength = segmentByteSize - text.length % segmentByteSize;
                            for (let i = 0; i < appendLength; i++) {
                                text += '0';
                            }
                            return text;
                        }
                        function encrypt(text, key, iv) {
                            const textLength = text.length;
                            text = textRightAppend(text, 'utf8');
                            const keyBytes = utf8.toBytes(key);
                            const ivBytes = utf8.toBytes(iv);
                            const textBytes = utf8.toBytes(text);
                            const aesCfb = new AesCfb(keyBytes, ivBytes, 16);
                            const encryptBytes = aesCfb.encrypt(textBytes);
                            return hex.fromBytes(ivBytes) + hex.fromBytes(encryptBytes).slice(0, textLength * 2);
                        }
                        function encryptUrl(url) {
                            let port = "";
                            let segments = "";
                            let protocol = "";

                            if (url.startsWith("http://")) {
                                url = url.substr(7);
                                protocol = "http";
                            } else if (url.startsWith("https://")) {
                                url = url.substr(8);
                                protocol = "https";
                            } else {
                                return "";
                            }
                            let v6 = "";
                            const match = /\[[0-9a-fA-F:]+?\]/.exec(url);
                            if (match) {
                                v6 = match[0];
                                url = url.slice(match[0].length);
                            }
                            segments = url.split("?")[0].split(":");
                            if (segments.length > 1) {
                                port = segments[1].split("/")[0]
                                url = url.substr(0, segments[0].length) + url.substr(segments[0].length + port.length + 1);
                            }
                            const i = url.indexOf('/');
                            if (i == -1) {
                                if (v6 != "") {
                                    url = v6;
                                }
                                url = encrypt(url, wrdvpnKey, wrdvpnIV)
                            } else {
                                const host = url.slice(0, i);
                                const path = url.slice(i);
                                if (v6 != "") {
                                    host = v6;
                                }
                                url = encrypt(host, wrdvpnKey, wrdvpnIV) + path;
                            }
                            if (port != "") {
                                url = "/" + protocol + "-" + port + "/" + url;
                            } else {
                                url = "/" + protocol + "/" + url;
                            }
                            return url;
                        }
                        // Main functions
                        function random_color() {
                            const r = Math.floor(Math.random() * 256);
                            const g = Math.floor(Math.random() * 256);
                            const b = Math.floor(Math.random() * 256);
                            return `rgb(${r}, ${g}, ${b})`;
                        }
                        function add_collect() {
                            // Get url
                            let url = input.value;
                            if (url.length == 0) {
                                url = prompt("请输入要收藏的网址：");
                            } else {
                                input.value = '';
                            }
                            if (url == undefined || url == null) {
                                cancel();
                                return;
                            } else if (url.length == 0) {
                                invalid();
                                return;
                            }
                            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                                url = "https://" + url;
                            }
                            let url_;
                            try {
                                url_ = new URL(url);
                            } catch (error) {
                                invalid();
                                return;
                            }
                            // Get name
                            let name = ""; let desc = "";
                            name = prompt("请输入收藏项目的名称：", url_.hostname);
                            if (name == null) {
                                cancel();
                                return;
                            }
                            desc = prompt("请输入收藏项目的备注：", url_.hostname);
                            if (desc == null) {
                                cancel();
                                return;
                            }
                            const id = $("div[data-id=collection].block-group > div.block-group__content")?.childElementCount ?? 0;
                            const post_data = {
                                "resource_type": "vpn",
                                "name": name,
                                "detail": desc,
                                "url": url,
                                "redirect": encryptUrl(url),
                                "id": id,
                                "group_id": 2,
                                "logo": "",
                                "_isCollect": false,
                                "_displayName": name,
                                "_desc": desc,
                                "_icon": {
                                    "color": random_color(),
                                    "content": name[0]
                                }
                            }
                            v.addCollect(post_data);
                        }
                        // Simple UI
                        const a = input.parentElement.appendChild(document.createElement("a"));
                        a.text = "⭐";
                        a.style = "position: absolute;left: 150px;top: 20px;";
                        a.onclick = add_collect;
                        // Shortcut
                        input.addEventListener("keydown", (e) => {
                            if (e.key === 'd' && e.ctrlKey) {
                                e.preventDefault();
                                add_collect();
                            }
                        });
                    }
                    node.onerror = (e) => {
                        fail("Failed to load Aes-js. You won't be able to use \"custom_collection\" feature.", "依赖库加载失败，您将无法使用自定义收藏功能！⚠️");
                    }
                    document.head.appendChild(node);
                }
                const observer = new MutationObserver(callback);
                observer.observe(document.body, options);
            }
            break;
        }
        case 'icourse.club': {
            const config_desc = config_descs.icourse;
            const config = GM_config(config_desc);
            if (!config["icourse/enabled"]) {
                console.info("[USTC Helper] 'icourse' feature disabled.");
                break;
            }
            function flash(ele) {
                ele.animate([
                    { opacity: '1' }, // Start state (0%)
                    { opacity: '0' }, // 25%
                    { opacity: '1' }, // 50%
                    { opacity: '0' }, // 75%
                    { opacity: '1' }  // End state (100%)
                ], {
                    duration: 1000,
                    iterations: 2
                });
            }
            function generateList(name, sel, download) {
                const sideBar = $("div.col-md-4.rl-pd-lg");
                const items = $$(sel);
                if (!sideBar || items.length == 0) return;
                const list = sideBar.appendChild(document.createElement("div"));
                list.classList.add("ud-pd-md", "dashed");
                const title = list.appendChild(document.createElement("h4"));
                title.classList.add("blue");
                title.textContent = name;
                function addItem(ele) {
                    const [name, link] = [ele.textContent, ele.href];
                    const div = list.appendChild(document.createElement("div"));
                    div.classList.add("ud-pd-sm");
                    const a = div.appendChild(document.createElement("a"));
                    a.textContent = name;
                    a.href = link;
                    const ext = link.split('.').pop();
                    if (download && name.endsWith(ext)) {
                        a.download = name;
                        ele.download = name;
                    }
                    const span = div.appendChild(document.createElement("span"));
                    span.classList.add("grey", "float-right");
                    span.textContent = "定位";
                    span.style.cursor = "pointer";
                    span.addEventListener("click", (e) => {
                        e.preventDefault();
                        ele.focus();
                        setTimeout(() => flash(ele), 100);
                    });
                    span.insertAdjacentHTML('afterbegin', '<span class="glyphicon glyphicon-share-alt grey"></span>')
                }
                items.forEach(addItem);
            }
            if (config["icourse/filelist"]) {
                generateList("文件列表", "div.review-content a[href^='/uploads/files/']", true);
            }
            if (config["icourse/linklist"]) {
                generateList("链接列表", "div.review-content a:not([href^='/uploads/files/'])", false);
            }
            if (config["icourse/native_top"]) {
                const goTop = $("#gotop");
                goTop?.addEventListener("click", (e) => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    e.stopPropagation();
                }, { capture: true });
            }
            if (config["icourse/shortcut"]) {
                for (const textArea of $$("textarea")) { // Comment section
                    const submit = textArea.nextElementSibling.firstElementChild;
                    if (submit && submit.tagName == "BUTTON") {
                        textArea.addEventListener("keyup", handleKeyup);
                    }
                }
                function handleKeyup(e) {
                    const submit = this.nextElementSibling.firstElementChild;
                    if (e.ctrlKey && e.key == "Enter") {
                        submit.click(); // Ctrl+Enter to post comment
                    } else if (e.key == "Escape") {
                        this.value = ""; // Escape to clear comment
                    }

                }
            }
            const icourse_css = {
                "css": `html { scroll-behavior: smooth; } img { max-width: 100%; }`
            };
            setupDynamicStyles("icourse", config, icourse_css);
            break;
        }
        default:
            console.error("[USTC Helper] Unexpected host: " + window.location.host);
            break;
    }
})();