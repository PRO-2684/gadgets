const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { readFileSync, mkdtempSync, rmSync, existsSync } = require('node:fs');
const { createServer } = require('node:http');
const { tmpdir } = require('node:os');
const { join, resolve, sep } = require('node:path');
const { promisify } = require('node:util');
const { test } = require('node:test');

// Real browser + pinned upstream libraries; no npm dependencies.
const browser = process.env.BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

async function checks() {
    const assert = (condition, message) => { if (!condition) throw new Error(message); };
    const load = (src, parent = document.body) => new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        parent.append(script);
    });
    try {
        if (/late|fallback/.test(location.search)) {
            // Let DOMContentLoaded pass without jQuery; scripts remain direct children.
            await new Promise(resolve => setTimeout(resolve, 30));
            await load('/jquery.js');
            await load('/nice.js');
        }
        const $ = window.jQuery;
        assert(typeof $.fn.niceScroll === 'function', 'shim available');
        const a = document.querySelector('#a');
        const b = document.querySelector('#b');
        const untouched = document.createElement('div');
        assert($(a).getNiceScroll().length === 0, 'lookup must not create instances');
        assert($(a).getNiceScroll(0) === false, 'missing indexed lookup is false');
        const first = $(a).niceScroll($(a.firstElementChild), { cursorwidth: 9 });
        assert(first.version === 'test', 'real library did not overwrite shim');
        assert(first === $(a).niceScroll(), 'repeat initialization retains identity');
        assert(first === $.data(a, '__nicescroll'), 'compatible data key');
        assert(first.doc[0] === a.firstElementChild && first.win[0] === a, 'jQuery wrapper arguments');
        assert(first.opt.cursorwidth === 9, 'options preserved');
        const group = $([a, b]).niceScroll();
        assert(group.length === 2 && group.eq(0) === first, 'multiple initialization returns collection');
        assert($(a).getNiceScroll().eq(0) === first, 'single lookup returns collection');
        assert($([untouched, a]).getNiceScroll(0) === false, 'index applies to elements, not filtered instances');
        assert($([untouched, a]).getNiceScroll(1) === first, 'sparse indexed lookup');
        assert(group.hide().show().resize().stop() === group, 'collection chaining');
        let calls = 0;
        group.each(function (index, instance) { assert(this === instance, 'each context'); calls++; });
        assert(calls === 2, 'each visits instances');
        first.doScrollTop(80);
        first.doScrollLeft(35);
        assert(a.scrollTop === 80 && a.scrollLeft === 35, 'programmatic scrolling is native');
        assert(first.getScrollTop() === 80 && first.getScrollLeft() === 35, 'native position getters');
        group.doScrollPos(10, 40);
        assert(a.scrollTop === 40 && b.scrollTop === 40, 'collection broadcasts scrolling');
        assert(getComputedStyle(a).overflowY === 'auto', 'target overflow repaired');
        assert(getComputedStyle(document.querySelector('#locked')).overflowY === 'hidden', 'unrelated locks preserved');
        assert(document.querySelectorAll('[id^="ascrail"]').length === 0, 'real NiceScroll did not create rails');
        const wheel = new WheelEvent('wheel', { deltaY: 20, bubbles: true, cancelable: true });
        a.dispatchEvent(wheel);
        assert(!wheel.defaultPrevented, 'wheel input not hijacked');
        const nativePage = $('body').niceScroll();
        nativePage.doScrollTop(120);
        assert(document.scrollingElement.scrollTop === 120, 'body maps to document scroller');
        nativePage.remove();
        assert($.nicescroll.length === 2, 'registry tracks live instances');
        group.remove();
        assert($.nicescroll.length === 0 && $(a).getNiceScroll(0) === false, 'remove clears registry and data');
        assert(a.style.overflowY === '', 'remove restores owned inline styles');
        assert($(a).niceScroll() !== first, 'reinitialize after remove');
        assert($().niceScroll().resize().length === 0, 'empty collection chaining');
        const inline = document.createElement('div');
        inline.style.cssText = 'overflow:hidden!important;width:100px;height:100px';
        inline.innerHTML = '<div style="width:500px;height:500px"></div>';
        document.body.append(inline);
        const inlineInstance = $(inline).niceScroll();
        inlineInstance.doScrollTop(50);
        assert(inline.scrollTop === 50 && getComputedStyle(inline).overflowY === 'auto', 'inline overflow repaired');
        inlineInstance.remove();
        assert(inline.style.getPropertyValue('overflow-y') === 'hidden' &&
            inline.style.getPropertyPriority('overflow-y') === 'important', 'original CSS priority restored');
        const altered = $(inline).niceScroll();
        inline.style.setProperty('overflow-y', 'scroll');
        altered.remove();
        assert(inline.style.overflowY === 'scroll', 'later site style changes preserved');
        inline.style.removeProperty('overflow');
        const visible = $(inline).niceScroll();
        visible.doScrollTop(60);
        assert(inline.scrollTop === 60 && getComputedStyle(inline).overflowY === 'auto', 'default visible overflow becomes native scroll container');
        visible.remove();
        assert(inline.style.overflow === '', 'default overflow restored');
        // Another global jQuery, then noConflict: both copies remain usable.
        await load('/jquery.js');
        const second = window.jQuery.noConflict(true);
        assert(second !== $ && window.jQuery === $, 'noConflict restores globals');
        assert(typeof second.fn.niceScroll === 'function', 'new jQuery copy patched');
        assert($(a).getNiceScroll().length === 1, 'old copy retains instance');
        assert(window.observations.every(options => !options.subtree), 'no recursive observers');
        assert(window.failures.length === 0, window.failures.join('\n'));
        document.querySelector('#result').textContent = 'PASS';
    } catch (error) {
        document.querySelector('#result').textContent = 'FAIL: ' + error.stack;
    }
}

test('NiceScroll browser compatibility and load ordering', { timeout: 90000 }, async t => {
    assert.ok(existsSync(browser), 'Set BROWSER to a Chromium/Edge executable');
    const assets = {
        '/noop.js': readFileSync(join(__dirname, 'noop-scroll.js'), 'utf8'),
        '/checks.js': `(${checks})();`,
    };
    await Promise.all([
        ['/jquery.js', 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js'],
        ['/nice.js', 'https://cdnjs.cloudflare.com/ajax/libs/jquery.nicescroll/3.7.6/jquery.nicescroll.min.js'],
    ].map(async ([path, url]) => {
        const response = await fetch(url);
        assert.ok(response.ok, `Download ${url}: ${response.status}`);
        assets[path] = await response.text();
    }));
    const server = createServer((req, res) => {
        if (assets[req.url]) {
            res.setHeader('Content-Type', 'text/javascript');
            return res.end(assets[req.url]);
        }
        const mode = new URL(req.url, 'http://localhost').searchParams.get('mode');
        const scripts = mode === 'existing' ? ['/jquery.js', '/noop.js', '/nice.js']
            : /late|fallback/.test(mode) ? ['/noop.js'] : ['/noop.js', '/jquery.js', '/nice.js'];
        res.setHeader('Content-Type', 'text/html');
        res.end(`<!doctype html><html><head><script>
            window.unsafeWindow = window;
            window.GM_info = {script: {name: 'Noop Scroll test', version: 'test'}};
            window.failures = [];
            window.addEventListener('error', e => failures.push(e.message));
            window.observations = [];
            window.MutationObserver = class extends MutationObserver {
                observe(target, options) { observations.push(options); super.observe(target, options); }
            };
            window.$ = { unrelated: true };
            ${mode === 'fallback' ? `for (const key of ['jQuery', '$']) {
                Object.defineProperty(window, key, {value: window[key], writable: true, configurable: false});
            }` : ''}
            </script>${scripts.map(src => `<script src="${src}"></script>`).join('')}
            <style>body{height:3000px}.viewport{width:100px;height:100px;overflow:hidden}.content{width:600px;height:600px}</style>
            <script defer src="/checks.js"></script></head><body>
            <div id="a" class="viewport"><div class="content"></div></div>
            <div id="b" class="viewport"><div class="content"></div></div>
            <div id="locked" style="overflow:hidden"></div><pre id="result">PENDING</pre>
            </body></html>`);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        for (const mode of ['early', 'existing', 'late', 'fallback']) {
            await t.test(mode, async () => {
                const profile = mkdtempSync(join(tmpdir(), 'noop-scroll-test-'));
                try {
                    const { stdout } = await promisify(execFile)(browser, [
                        '--headless', '--disable-gpu', '--no-first-run', '--disable-extensions',
                        `--user-data-dir=${profile}`, '--dump-dom', '--virtual-time-budget=5000',
                        `http://127.0.0.1:${server.address().port}/?mode=${mode}`,
                    ], { timeout: 20000, maxBuffer: 2 * 1024 * 1024 });
                    const result = stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1];
                    assert.equal(result, 'PASS', result || stdout);
                } finally {
                    // Only remove the unique profile created inside the OS temp directory.
                    assert.ok(resolve(profile).startsWith(resolve(tmpdir()) + sep));
                    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
                }
            });
        }
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});
