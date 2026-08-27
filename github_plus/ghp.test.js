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

test("test hook exposes the style-sheet factory before browser startup", () => {
    const factories = loadFactories();

    assert.equal(typeof factories?.createStyleSheetModule, "function");
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
