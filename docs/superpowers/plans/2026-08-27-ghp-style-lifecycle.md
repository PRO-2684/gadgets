# GitHub Plus Style and Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace scattered stylesheet and feature timing logic with two deep, testable modules in two independent commits.

**Architecture:** Keep the single-file userscript distribution. Pure factories sit at the top of the IIFE, production composes browser adapters below the test hook, and Node evaluates the same file with in-memory adapters.

**Tech Stack:** JavaScript userscript, Node.js 24 built-in `node:test`, `node:assert`, `node:vm`, and Git.

**Spec:** `docs/superpowers/specs/2026-08-27-ghp-style-lifecycle-design.md`

## Global Constraints

- Keep `github_plus/ghp.js` directly installable without a build step or dependency.
- Mount generated styles under `<head>` only after the existing `documentReady` promise resolves.
- Preserve user-visible feature behavior and exact GitHub event routing.
- Keep unrelated working-tree changes untouched.
- Produce one style-sheet commit followed by one lifecycle commit.

---

### Task 1: Deep style-sheet module

**Files:**
- Create: `github_plus/ghp.test.js`
- Modify: `github_plus/ghp.js`
- Create: `docs/superpowers/specs/2026-08-27-ghp-style-lifecycle-design.md`
- Create: `docs/superpowers/plans/2026-08-27-ghp-style-lifecycle.md`

**Interfaces:**
- Consumes: `{ document, ready, settings: { get(prop) }, idPrefix, catppuccinPalette }`
- Produces: `createStyleSheetModule(options) -> { mount(): Promise<void>, applySetting(prop, value): Promise<boolean> }`

- [ ] **Step 1: Write a failing test for the test hook**

Add a `node:vm` loader that sets `globalThis.__GHP_TEST_HOOK__`, evaluates `ghp.js`, and asserts that `createStyleSheetModule` is captured before browser startup.

- [ ] **Step 2: Run the hook test and verify RED**

Run: `node --test github_plus/ghp.test.js`

Expected: FAIL because the current userscript never invokes the hook.

- [ ] **Step 3: Add the factory hook and minimal factory**

Define `createStyleSheetModule` before `GM_info` reads. Invoke the hook and return early when present.

- [ ] **Step 4: Write failing observable style tests**

Using an in-memory document adapter, assert literal outcomes:

```js
assert.equal(fakeDocument.head.children.length, 0);
ready.resolve();
await styleSheets.mount();
assert.equal(find("ghp-code.cursorBlink").disabled, true);
assert.equal(find("ghp-tabSize").textContent, "pre, code { tab-size: 4; }");
assert.equal(find("ghp-catppuccin-icons-css-variables").textContent, "");
```

Also assert repeated updates reuse the same node, enabled conditional styles use `disabled = false`, enum/value defaults may be empty, a pre-ready update wins, and unrelated settings return `false`.

- [ ] **Step 5: Run style tests and verify RED**

Run: `node --test github_plus/ghp.test.js`

Expected: FAIL on missing mounting and update behavior.

- [ ] **Step 6: Implement the private style registry and migrate callers**

Move fixed, conditional, enum, tab-size, and Catppuccin-variable CSS behind `createStyleSheetModule`. Replace `injectCSS`, `cssHelper`, `enumStyleHelper`, `tabSize`, `updateCatppuccinColors`, and the style callback table with:

```js
const styleSheets = createStyleSheetModule({
    document,
    ready: documentReady,
    settings: { get: (prop) => config.get(prop) },
    idPrefix,
    catppuccinPalette,
});
void styleSheets.mount();
```

Route current configuration-set events through `styleSheets.applySetting(prop, after)`.

- [ ] **Step 7: Verify GREEN and syntax**

Run:

```powershell
node --test github_plus/ghp.test.js
node --check github_plus/ghp.js
```

Expected: all tests pass; syntax check exits 0.

- [ ] **Step 8: Commit style-sheet module**

```powershell
git add -- github_plus/ghp.js github_plus/ghp.test.js docs/superpowers/specs/2026-08-27-ghp-style-lifecycle-design.md docs/superpowers/plans/2026-08-27-ghp-style-lifecycle.md
git commit -m "refactor(ghp): deepen style sheet handling"
```

---

### Task 2: Deep feature-lifecycle module

**Files:**
- Modify: `github_plus/ghp.js`
- Modify: `github_plus/ghp.test.js`

**Interfaces:**
- Consumes: `{ ready, settings, events, scheduleFrame, environment, actions }`
- Produces: `createFeatureLifecycleModule(options) -> { start(): Promise<void> }`
- Consumes from Task 1: `styleSheets.mount()` and `styleSheets.applySetting(prop, value)`

- [ ] **Step 1: Write failing lifecycle tests**

Capture `createFeatureLifecycleModule` from the test hook. With in-memory settings/events and recording feature actions, assert:

- `start()` is idempotent.
- Existing listeners are installed under their exact event names.
- ready-gated actions wait for readiness.
- startup-only configuration gates remain startup-only.
- repo refresh from `turbo:load` uses `scheduleFrame`.
- style changes route immediately through `applySetting`.
- Custom Menu Icon configuration starts only after its connection action initializes.
- rate-limit get, Tracking Prevention, and debug routing retain current ordering.

- [ ] **Step 2: Run lifecycle tests and verify RED**

Run: `node --test github_plus/ghp.test.js`

Expected: FAIL because the hook does not expose `createFeatureLifecycleModule`.

- [ ] **Step 3: Implement lifecycle factory and browser adapters**

Move current `documentReady.then`, `document.addEventListener`, and `config.addEventListener` orchestration behind one idempotent `start()` implementation. Keep feature actions and DOM transformations unchanged.

- [ ] **Step 4: Remove migrated top-level orchestration**

Delete only subscriptions and gates now owned by lifecycle. Leave each feature implementation intact and pass it through the production `actions` adapter.

- [ ] **Step 5: Verify GREEN, syntax, and complete suite**

Run:

```powershell
node --test github_plus/ghp.test.js
node --check github_plus/ghp.js
```

Expected: all tests pass; syntax check exits 0.

- [ ] **Step 6: Commit lifecycle module**

```powershell
git add -- github_plus/ghp.js github_plus/ghp.test.js
git commit -m "refactor(ghp): centralize feature lifecycle"
```

---

### Task 3: Final verification and review

**Files:**
- Verify: `github_plus/ghp.js`
- Verify: `github_plus/ghp.test.js`

**Interfaces:**
- Consumes: both committed module interfaces
- Produces: verified two-commit branch state

- [ ] **Step 1: Run fresh verification**

```powershell
node --test github_plus/ghp.test.js
node --check github_plus/ghp.js
git status --short
git log -2 --oneline
```

- [ ] **Step 2: Review both commit ranges**

Review the first commit against the style-sheet requirements and the second against the behavior-preserving lifecycle requirements. Fix Critical or Important findings in the corresponding commit when safe; otherwise add a follow-up commit and report why.
