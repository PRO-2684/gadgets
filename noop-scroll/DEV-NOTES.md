# Noop Scroll development notes

## Goal and scope

Let the browser handle scrolling while preserving the library calls a site uses. Cosmetic scrollbar operations can be noops; navigation calls must still move the native scroll container. Avoid intercepting all wheel listeners or overriding `Event.preventDefault`: those affect unrelated controls, gestures, and dialogs.

Only **NiceScroll** is implemented. Lenis, Locomotive Scroll, and smooth-scrollbar below are research notes, not advertised support. There is no generic adapter framework until a second implementation demonstrates what should be shared.

## NiceScroll

Reference: [upstream source, including the collection and jQuery entry points](https://github.com/inuyaksa/jquery.nicescroll/blob/master/jquery.nicescroll.js). Browser regression tests currently use NiceScroll 3.7.6 and jQuery 3.7.1.

### Installation

- Run at `document-start`. Patch an already exposed jQuery and intercept ordinary assignments to `window.jQuery` and `window.$` synchronously. Check `fn.jquery` before treating either global as jQuery; `$` may belong to another library.
- Track installations by `$.fn` identity. Reassignment and `noConflict()` must preserve the globals' values, and each new jQuery copy needs its own adapter.
- Retain `$.fn.niceScroll`, `$.fn.getNiceScroll`, and `$.nicescroll` through getter/setter properties. The setter accepts and ignores ordinary replacement assignments, so the upstream plugin can execute without strict-mode assignment failures. Properties remain configurable; this is compatibility, not tamper resistance.
- Never cancel loading by changing an inserted script's `src` or text. Script preparation may already have happened; a MutationObserver is not a reliable blocking hook. See the [HTML script processing model](https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element).
- A single observer watches direct children only (`childList: true`, no `subtree`). `document` and `html` discover roots, including when no root exists yet; `head` and `body` provide fallback discovery. Captured script `load` events are accepted only for direct children of those two containers. No filename matching is necessary.
- Keep fallback observation after DOMContentLoaded for late scripts. Discovering a body is never treated as successful adapter installation.

Global properties that already have accessors, or cannot be safely redefined, are left intact. For those, observations and script load events only provide **best-effort** installation. A script can assign a private/global jQuery and initialize NiceScroll synchronously before those callbacks run.

The real library is allowed to execute: it may still install jQuery scroll hooks or global metadata. The adapter instances use `ishwscroll: false` so the tested upstream hooks take their native path. If real instances already exist, use their `remove()` methods before installing. Previously captured functions/instances cannot be replaced retroactively, so early installation remains the supported path. Private module imports and descriptor-based replacement are outside scope.

### Compatibility contract

- `niceScroll()` initializes once per selected element, using `__nicescroll` as the data key. Return an instance for one result, a collection for zero/multiple.
- Accept options and selector/DOM/jQuery content arguments. Resolve the viewport from the selected element and `doc`/`win` options; the content itself is not necessarily the scroll container.
- `getNiceScroll()` returns a collection and never initializes an element. Indexed lookup addresses the original jQuery selection and returns `false` when no instance exists, rather than indexing a filtered list.
- Collections expose numeric indices, `length`, `push`, `eq`, `each`, and the upstream broadcast operations: `show`, `hide`, `toggle`, `onResize`, `resize`, `remove`, `stop`, and `doScrollPos`. Iteration snapshots members so removing instances from the global registry does not skip entries.
- `$.nicescroll` holds live instances and mutable default `options`; `:nicescroll` checks registration. It is not a jQuery-wrapped metadata object.
- Position getters, setters, `doScrollTop`, `doScrollLeft`, and `doScrollPos` delegate to native scrolling, ignoring animation duration. Page targets use `document.scrollingElement`; element targets scroll their resolved viewport.
- Cursor visibility, resize, and stop operations are harmless chainable noops. There is no universal unknown-property proxy. Extra callbacks, momentum, zooming, and internal rail objects are not emulated; add concrete compatibility only when a real site needs it.
- Repair hidden/clipped overflow only on the identified viewport (html/body for page scrolling). Non-page viewports with default visible overflow also become native scroll containers. Save inline values and priorities. `remove()` unregisters the instance and restores only inline properties still carrying our applied value. Unrelated containers are untouched. Later site CSS changes are not continually overridden, and transforms introduced by arbitrary site code are not removed.

## Future library approaches

### Lenis

[Lenis settings and API](https://github.com/darkroomengineering/lenis#settings) provide a promising smaller alternative to reimplementing its instance API: wrap an exposed constructor and force `smoothWheel: false`, `syncTouch: false`. Keep the real instance so event subscriptions, sizing, and integrations retain their expected behavior. Verify native input on the specific supported version; these options do not mean the library has no listeners or lifecycle effects.

Decide separately whether programmatic `scrollTo` should also be instant. Do not blindly noop `stop()`/`start()`, which sites can use for modal scroll locks. A full native shim would need meaningful positions, `scrollTo`, event subscription and unsubscription, and lifecycle behavior. `destroy()` removes the real instance's events, but does not preserve callers' expectations by itself.

### Locomotive Scroll

The [current upstream implementation](https://github.com/locomotivemtl/locomotive-scroll) is built on Lenis and also provides element detection and animation. Support must be version-specific: investigate configuration at Locomotive's own exposed constructor before replacing the whole object. A hook on `window.Lenis` does not reach a Lenis dependency bundled privately inside Locomotive.

Keep viewport detection/callback behavior where possible. For older releases, inspect that release's native/smooth modes and DOM/CSS behavior independently; do not assume current Lenis options apply. Full replacement can leave animated content hidden if the site depends on callbacks to reveal it.

### smooth-scrollbar

[Upstream API](https://github.com/dolphin-wood/smooth-scrollbar/blob/develop/docs/api.md). Investigate a separate adapter for initialization, instance lookup, native positions, scrolling, listeners, and destruction. Account for the library's content wrappers and layout expectations; disabling smoothing alone is not a proven native-scroll solution.

Prefer interception before initialization. Late recovery needs version-tested teardown and layout restoration, including position preservation. Add support only with a real affected page and a focused browser fixture.

## Verification

Run `node --test noop-scroll/noop-scroll.test.cjs` from the repository root. The dependency-free Node runner downloads pinned jQuery/NiceScroll assets and serves local fixtures to headless Edge. Set `BROWSER` to another Chromium-family executable if needed. Temporary browser profiles are isolated and removed.

Fixtures cover early/existing/late jQuery, non-configurable globals with direct body script loading, actual upstream plugin execution, collection semantics, native positions, overflow repair/restoration, removal, multiple jQuery copies, and `noConflict`. Observer calls are also checked for absence of `subtree`.

These are browser integration tests, not userscript-manager sandbox tests. Before publishing, test the installed userscript in the intended manager/browser on the linked demo and a real target site, including wheel/touch, keyboard, anchors, and modal locks. Configure `@match` for the intended sites; it remains `none` in the source rather than enabling the shim across every website.

Live smoke check (2026-09-05): refreshed the installed debug userscript on the linked GitHub Preview demo. With its jQuery 1.12.4, all five instances used the adapter and no custom NiceScroll rails remained. Native programmatic scrolling worked on the page and all four containers; a trusted wheel event scrolled the page without cancellation, and PageDown scrolled the simple container. No page errors were reported. Touch input and modal locks were not exercised.
