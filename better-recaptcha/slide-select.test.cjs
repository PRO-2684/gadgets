const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');

// Run the actual userscript; only the browser and reCAPTCHA click boundary are faked.
function setup(initial = [false, false, false, false]) {
    const listeners = new WeakMap();
    function target(extra = {}) {
        const object = { ...extra, addEventListener(type, handler) {
            const events = listeners.get(this);
            if (!events[type]) events[type] = new Set();
            events[type].add(handler);
        } };
        listeners.set(object, {});
        return object;
    }
    const tiles = initial.map(selected => target({
        selected, isConnected: true,
        classList: { contains(name) {
            assert.equal(name, 'rc-imageselect-tileselected');
            return tiles.find(tile => tile.classList === this).selected;
        } },
        click() { this.selected = !this.selected; },
    }));
    const body = target({ querySelectorAll: () => tiles });
    const document = target({ querySelector: selector => selector === 'div' ? {} : body });
    const window = target();
    let observe;
    runInNewContext(readFileSync(`${__dirname}/better-recaptcha.js`, 'utf8'), {
        document, window, console: { log() {} },
        location: { pathname: '/recaptcha/api2/bframe' },
        GM: { info: { script: { name: 'test', version: 'test' } } },
        GM_config: class { get() { return true; } },
        MutationObserver: class { constructor(callback) { observe = callback; } observe() {} },
    });
    observe([]);
    return {
        tiles, document, window,
        fire(object, type, buttons = 1) {
            for (const handler of listeners.get(object)[type] || []) {
                handler.call(object, { buttons, button: 0, preventDefault() {} });
            }
        },
        state: () => tiles.map(tile => tile.selected),
    };
}

test('backtracking removes the path tail and can extend again', () => {
    const { tiles: [a, b, c, d], fire, state } = setup();
    fire(a, 'mousedown');
    fire(b, 'mouseenter');
    fire(c, 'mouseenter');
    assert.deepEqual(state(), [true, true, true, false]);
    fire(b, 'mouseenter');
    assert.deepEqual(state(), [true, true, false, false]);
    fire(c, 'mouseenter');
    fire(a, 'mouseenter');
    assert.deepEqual(state(), [true, false, false, false]);
    fire(d, 'mouseenter');
    assert.deepEqual(state(), [true, false, false, true]);
});

test('selecting preserves selected tiles and backtracking restores original states', () => {
    const { tiles: [a, b, c], fire, state } = setup([false, true, false, false]);
    fire(a, 'mousedown');
    fire(b, 'mouseenter');
    fire(c, 'mouseenter');
    assert.deepEqual(state(), [true, true, true, false]);
    fire(a, 'mouseenter');
    assert.deepEqual(state(), [true, true, false, false]);
});

test('starting on a selected tile erases and backtracking restores mixed states', () => {
    const { tiles: [a, b, c], fire, state } = setup([true, false, true, false]);
    fire(a, 'mousedown');
    fire(b, 'mouseenter');
    fire(c, 'mouseenter');
    assert.deepEqual(state(), [false, false, false, false]);
    fire(a, 'mouseenter');
    assert.deepEqual(state(), [false, false, true, false]);
});

test('mouse release or window blur ends a stroke', () => {
    for (const end of ['mouseup', 'blur']) {
        const { tiles: [a, b, c], fire, state, document, window } = setup();
        fire(a, 'mousedown');
        fire(b, 'mouseenter');
        fire(end === 'blur' ? window : document, end, 0);
        fire(c, 'mouseenter');
        assert.deepEqual(state(), [true, true, false, false]);
        fire(b, 'mousedown');
        fire(a, 'mouseenter');
        assert.deepEqual(state(), [false, false, false, false]);
    }
});

test('a disconnected tile invalidates the previous challenge path', () => {
    const { tiles: [a, b], fire, state } = setup();
    fire(a, 'mousedown');
    a.isConnected = false;
    fire(b, 'mouseenter');
    assert.deepEqual(state(), [true, false, false, false]);
});

test('idle entry does nothing and observing a released button clears the path', () => {
    const { tiles: [a, b], fire, state, document } = setup();
    fire(a, 'mouseenter', 0);
    fire(a, 'mousedown', 2);
    assert.deepEqual(state(), [false, false, false, false]);
    fire(a, 'mousedown');
    fire(a, 'mouseenter');
    assert.deepEqual(state(), [true, false, false, false]);
    fire(document, 'mousemove', 0);
    fire(b, 'mouseenter');
    assert.deepEqual(state(), [true, false, false, false]);
});
