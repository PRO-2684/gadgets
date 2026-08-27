const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "ghp.js"), "utf8");

function loadFactories() {
    let factories;
    const sandbox = { globalThis: {} };
    sandbox.globalThis.__GHP_TEST_HOOK__ = (value) => {
        factories = value;
    };

    try {
        vm.runInNewContext(source, sandbox, { filename: "ghp.js" });
    } catch (error) {
        if (factories) throw error;
    }

    return factories;
}

function deferred() {
    let resolve;
    const promise = new Promise((done) => {
        resolve = done;
    });
    return { promise, resolve };
}

function createDocument() {
    const children = [];
    const head = {
        children,
        appendChild(node) {
            if (!children.includes(node)) children.push(node);
            node.parentElement = head;
            return node;
        },
    };
    return {
        head,
        createElement(tagName) {
            return {
                tagName: tagName.toUpperCase(),
                id: "",
                textContent: "",
                disabled: false,
                parentElement: null,
            };
        },
        getElementById(id) {
            return children.find((node) => node.id === id) ?? null;
        },
    };
}

function createStyleFixture(overrides = {}) {
    const values = {
        "code.cursorBlink": false,
        "code.cursorAnimation": false,
        "code.fullWidth": false,
        "code.hideReadonlyTip": false,
        "appearance.stickyAvatar": false,
        "appearance.stickyMore": false,
        "appearance.hideHeaderUnderline": false,
        "appearance.visibleDetails": false,
        "appearance.customMenuIcon": "",
        "appearance.dashboard": 0,
        "appearance.leftSidebar": 0,
        "appearance.rightSidebar": 0,
        "code.tabSize": 4,
        "appearance.catppuccinIcons": 0,
        ...overrides,
    };
    const document = createDocument();
    const ready = deferred();
    const { createStyleSheetModule } = loadFactories();
    const styleSheets = createStyleSheetModule({
        document,
        ready: ready.promise,
        settings: { get: (prop) => values[prop] },
        idPrefix: "ghp-",
        catppuccinPalette: {
            latte: { rosewater: "#dc8a78" },
            frappe: {},
            macchiato: {},
            mocha: {},
        },
    });
    return {
        document,
        ready,
        styleSheets,
        find: (id) => document.getElementById(id),
    };
}

function createLifecycleFixture(overrides = {}, environmentOverrides = {}) {
    const values = {
        "appearance.customMenuIcon": "",
        "additional.extendedUserInfo": false,
        "additional.extendedRepoInfo": false,
        "additional.archivedRepoStars": false,
        "additional.trackingPrevention": false,
        "advanced.debug": false,
        ...overrides,
    };
    const ready = deferred();
    const settingListeners = { get: [], set: [] };
    const eventListeners = new Map();
    const calls = [];
    const frames = [];
    let connectMenu;

    const settings = {
        get: (prop) => values[prop],
        onGet(listener) {
            settingListeners.get.push(listener);
        },
        onSet(listener) {
            settingListeners.set.push(listener);
        },
    };
    const events = {
        on(name, listener, options) {
            if (!eventListeners.has(name)) eventListeners.set(name, []);
            eventListeners.get(name).push({ listener, options });
        },
    };
    const actions = {
        styleSheets: {
            mount() {
                calls.push(["mountStyles"]);
                return Promise.resolve();
            },
            applySetting(prop, value) {
                calls.push(["applyStyle", prop, value]);
                return Promise.resolve(true);
            },
        },
        refreshIcons: (...args) => calls.push(["refreshIcons", ...args]),
        connectCustomMenu(onConnected) {
            calls.push(["connectCustomMenu"]);
            connectMenu = onConnected;
        },
        refreshReleases: (...args) =>
            calls.push(["refreshReleases", ...args]),
        refreshUserInfo: (...args) =>
            calls.push(["refreshUserInfo", ...args]),
        refreshRepoInfo: (...args) =>
            calls.push(["refreshRepoInfo", ...args]),
        patchArchivedRepoStars: (...args) =>
            calls.push(["patchArchivedRepoStars", ...args]),
        clearTrackingMetadata: (...args) =>
            calls.push(["clearTrackingMetadata", ...args]),
        protectFetch: () => calls.push(["protectFetch"]),
        showRateLimit: () => calls.push(["showRateLimit"]),
        logEvent: (name, event) => calls.push(["logEvent", name, event]),
    };
    const { createFeatureLifecycleModule } = loadFactories();
    const lifecycle = createFeatureLifecycleModule({
        ready: ready.promise,
        settings,
        events,
        scheduleFrame(fn) {
            frames.push(fn);
        },
        environment: {
            isMainSite: true,
            readyState: "loading",
            ...environmentOverrides,
        },
        actions,
    });

    return {
        calls,
        frames,
        lifecycle,
        ready,
        connectMenu: (setIcon) => connectMenu(setIcon),
        emit(name, event = { type: name }) {
            const registered = eventListeners.get(name) ?? [];
            for (const { listener } of [...registered]) listener(event);
            eventListeners.set(
                name,
                registered.filter(({ options }) => !options.once),
            );
        },
        emitGet(prop) {
            for (const listener of settingListeners.get) listener({ prop });
        },
        emitSet(prop, after) {
            values[prop] = after;
            for (const listener of settingListeners.set)
                listener({ prop, after });
        },
        listenerCount: (name) => eventListeners.get(name)?.length ?? 0,
        listeners: () => [...eventListeners.values()].flat(),
        settingListenerCount: (kind) => settingListeners[kind].length,
    };
}

test("test hook exposes the style-sheet factory before browser startup", () => {
    const factories = loadFactories();

    assert.equal(typeof factories?.createStyleSheetModule, "function");
});

test("test hook exposes the feature-lifecycle factory", () => {
    const factories = loadFactories();

    assert.equal(typeof factories?.createFeatureLifecycleModule, "function");
});

test("archived repositories enable the native star action before hydration", () => {
    const { patchArchivedRepoStarData } = loadFactories();
    const script = {
        textContent: JSON.stringify({
            payload: {
                sidebarAbout: {
                    repo: { isArchived: true },
                    star: { canStar: false, viewerHasStarred: false },
                    viewer: {
                        isLoggedIn: true,
                        emuContributionBlocked: false,
                    },
                },
            },
        }),
    };
    const root = { querySelector: () => script };

    assert.equal(patchArchivedRepoStarData(root), true);
    assert.deepEqual(JSON.parse(script.textContent), {
        payload: {
            sidebarAbout: {
                repo: { isArchived: true },
                star: { canStar: true, viewerHasStarred: false },
                viewer: {
                    isLoggedIn: true,
                    emuContributionBlocked: false,
                },
            },
        },
    });
});

test("server star restrictions remain unchanged", () => {
    const { patchArchivedRepoStarData } = loadFactories();
    const cases = [
        {
            name: "active repository",
            repo: { isArchived: false },
            star: { canStar: false },
            viewer: { isLoggedIn: true, emuContributionBlocked: false },
        },
        {
            name: "logged-out viewer",
            repo: { isArchived: true },
            star: { canStar: false },
            viewer: { isLoggedIn: false, emuContributionBlocked: false },
        },
        {
            name: "EMU-blocked viewer",
            repo: { isArchived: true },
            star: { canStar: false },
            viewer: { isLoggedIn: true, emuContributionBlocked: true },
        },
        {
            name: "already-enabled payload",
            repo: { isArchived: true },
            star: { canStar: true },
            viewer: { isLoggedIn: true, emuContributionBlocked: false },
        },
    ];

    for (const { name, repo, star, viewer } of cases) {
        const payload = { payload: { sidebarAbout: { repo, star, viewer } } };
        const script = { textContent: JSON.stringify(payload) };

        assert.equal(
            patchArchivedRepoStarData({ querySelector: () => script }),
            false,
            name,
        );
        assert.deepEqual(JSON.parse(script.textContent), payload, name);
    }
});

test("malformed embedded data is ignored", () => {
    const { patchArchivedRepoStarData } = loadFactories();
    const script = { textContent: "{" };

    assert.equal(
        patchArchivedRepoStarData({ querySelector: () => script }),
        false,
    );
    assert.equal(script.textContent, "{");
});

test("mount waits for readiness and creates stable styles under head", async () => {
    const fixture = createStyleFixture();
    const mounting = fixture.styleSheets.mount();

    assert.equal(fixture.document.head.children.length, 0);
    fixture.ready.resolve();
    await mounting;

    const cursor = fixture.find("ghp-code.cursorBlink");
    assert.equal(cursor.parentElement, fixture.document.head);
    assert.equal(cursor.disabled, true);
    assert.match(cursor.textContent, /navigation-cursor/);
    assert.equal(fixture.find("ghp-appearance.dashboard").textContent, "");
    assert.equal(
        fixture.find("ghp-tabSize").textContent,
        "pre, code { tab-size: 4; }",
    );
    assert.equal(
        fixture.find("ghp-catppuccin-icons-css-variables").textContent,
        "",
    );
    assert.ok(fixture.find("ghp-release"));

    const originalCursor = cursor;
    await fixture.styleSheets.applySetting("code.cursorBlink", true);
    assert.equal(fixture.find("ghp-code.cursorBlink"), originalCursor);
    assert.equal(originalCursor.disabled, false);
});

test("latest pre-ready setting wins and value styles reuse their node", async () => {
    const fixture = createStyleFixture();
    const update = fixture.styleSheets.applySetting("code.tabSize", 8);

    assert.equal(fixture.document.head.children.length, 0);
    fixture.ready.resolve();
    await update;

    const tabSize = fixture.find("ghp-tabSize");
    assert.equal(tabSize.textContent, "pre, code { tab-size: 8; }");
    await fixture.styleSheets.applySetting("code.tabSize", 2);
    assert.equal(fixture.find("ghp-tabSize"), tabSize);
    assert.equal(tabSize.textContent, "pre, code { tab-size: 2; }");
});

test("Catppuccin variables use the shared style seam", async () => {
    const fixture = createStyleFixture();
    fixture.ready.resolve();
    await fixture.styleSheets.mount();

    await fixture.styleSheets.applySetting("appearance.catppuccinIcons", 1);
    assert.equal(
        fixture.find("ghp-catppuccin-icons-css-variables").textContent,
        ":root {\n  --ctp-rosewater: #dc8a78;\n}",
    );
});

test("unrelated settings are ignored", async () => {
    const fixture = createStyleFixture();

    assert.equal(
        await fixture.styleSheets.applySetting("advanced.debug", true),
        false,
    );
});

test("lifecycle start is idempotent and preserves ready ordering", async () => {
    const fixture = createLifecycleFixture();

    const first = fixture.lifecycle.start();
    const second = fixture.lifecycle.start();

    assert.equal(first, second);
    assert.deepEqual(fixture.calls, [["mountStyles"]]);
    assert.equal(fixture.listenerCount("soft-nav:react-done"), 1);
    assert.equal(fixture.listenerCount("turbo:load"), 2);
    assert.equal(
        fixture.listeners().every(({ options }) => options.passive === true),
        true,
    );
    assert.equal(fixture.settingListenerCount("get"), 1);
    assert.equal(fixture.settingListenerCount("set"), 0);

    fixture.ready.resolve();
    await first;

    assert.deepEqual(fixture.calls, [
        ["mountStyles"],
        ["connectCustomMenu"],
        ["refreshReleases"],
    ]);
    assert.equal(fixture.settingListenerCount("set"), 1);
});

test("lifecycle preserves startup gates and navigation routing", async () => {
    const fixture = createLifecycleFixture({
        "additional.extendedUserInfo": true,
        "additional.extendedRepoInfo": true,
        "additional.trackingPrevention": true,
    });

    const started = fixture.lifecycle.start();
    assert.deepEqual(fixture.calls, [
        ["mountStyles"],
        ["clearTrackingMetadata"],
        ["protectFetch"],
    ]);
    assert.equal(fixture.listenerCount("soft-nav:end"), 1);
    assert.equal(fixture.listenerCount("soft-nav:react-done"), 2);
    assert.equal(fixture.listenerCount("turbo:load"), 4);
    assert.equal(fixture.listenerCount("turbo:before-render"), 1);

    fixture.emit("soft-nav:end");
    fixture.emit("soft-nav:react-done");
    fixture.emit("turbo:load");
    const newBody = {};
    fixture.emit("turbo:before-render", { detail: { newBody } });

    assert.equal(fixture.frames.length, 1);
    fixture.frames[0]();
    assert.deepEqual(fixture.calls.slice(3), [
        ["refreshUserInfo"],
        ["refreshIcons"],
        ["refreshRepoInfo"],
        ["refreshIcons"],
        ["refreshReleases"],
        ["refreshUserInfo"],
        ["clearTrackingMetadata"],
        ["refreshRepoInfo"],
    ]);

    fixture.ready.resolve();
    await started;
});

test("lifecycle patches star data before initial and Turbo rendering", () => {
    const fixture = createLifecycleFixture({
        "additional.archivedRepoStars": true,
    });
    const newBody = { marker: "new body" };

    fixture.lifecycle.start();
    fixture.emit("readystatechange", {
        target: { readyState: "interactive" },
    });
    fixture.emit("readystatechange", {
        target: { readyState: "complete" },
    });
    fixture.emit("turbo:before-render", { detail: { newBody } });

    assert.equal(fixture.listenerCount("readystatechange"), 0);
    assert.deepEqual(fixture.calls.slice(-2), [
        ["patchArchivedRepoStars"],
        ["patchArchivedRepoStars", newBody],
    ]);
});

test("lifecycle patches immediately when startup is already interactive", () => {
    const fixture = createLifecycleFixture(
        { "additional.archivedRepoStars": true },
        { readyState: "interactive" },
    );

    fixture.lifecycle.start();

    assert.deepEqual(fixture.calls.slice(0, 2), [
        ["mountStyles"],
        ["patchArchivedRepoStars"],
    ]);
    assert.equal(fixture.listenerCount("readystatechange"), 0);
});

test("archived repository stars remain disabled by default", () => {
    const fixture = createLifecycleFixture();

    fixture.lifecycle.start();
    fixture.emit("readystatechange", {
        target: { readyState: "interactive" },
    });
    fixture.emit("turbo:before-render", { detail: { newBody: {} } });

    assert.equal(fixture.listenerCount("readystatechange"), 0);
    assert.equal(fixture.listenerCount("turbo:before-render"), 0);
    assert.equal(
        fixture.calls.some(([name]) => name === "patchArchivedRepoStars"),
        false,
    );
});

test("lifecycle routes live style and delayed custom-menu settings", async () => {
    const fixture = createLifecycleFixture({
        "appearance.customMenuIcon": "🥞",
    });
    const started = fixture.lifecycle.start();
    fixture.ready.resolve();
    await started;

    fixture.emitSet("code.tabSize", 8);
    assert.deepEqual(fixture.calls.at(-1), ["applyStyle", "code.tabSize", 8]);

    const icons = [];
    fixture.connectMenu((icon) => icons.push(icon));
    assert.deepEqual(icons, ["🥞"]);
    assert.equal(fixture.settingListenerCount("set"), 2);

    fixture.emitSet("appearance.customMenuIcon", "🍔");
    assert.deepEqual(icons, ["🥞", "🍔"]);
});

test("lifecycle routes rate-limit and debug events without changing gates", () => {
    const fixture = createLifecycleFixture({ "advanced.debug": true });
    fixture.lifecycle.start();

    const event = { type: "soft-nav:start", marker: 42 };
    fixture.emitGet("advanced.rateLimit");
    fixture.emit("soft-nav:start", event);
    assert.deepEqual(fixture.calls.slice(-2), [
        ["showRateLimit"],
        ["logEvent", "soft-nav:start", event],
    ]);

    fixture.emitSet("additional.extendedUserInfo", true);
    fixture.emit("soft-nav:end");
    assert.equal(
        fixture.calls.some(([name]) => name === "refreshUserInfo"),
        false,
    );
});
