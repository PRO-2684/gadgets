# GitHub Plus Style and Lifecycle Design

## Goal

Deepen style-sheet and feature-lifecycle behavior into two independently committed modules while keeping `github_plus/ghp.js` a directly installable, build-free userscript.

## Constraints

- Preserve current user-visible behavior and GitHub event timing.
- Keep every generated `<style>` under `<head>` after `documentReady` resolves.
- Give every stylesheet one stable, once-prefixed ID.
- Keep inactive conditional styles mounted and disabled; value/default styles may contain empty CSS.
- Include fixed, conditional, enum, tab-size, and Catppuccin-variable styles behind the style-sheet seam.
- Preserve which configuration changes are live and which require navigation or reload.
- Use only Node built-ins for tests.
- Commit the style-sheet and lifecycle refactors independently.

## Style-sheet module

`createStyleSheetModule({ document, ready, settings, idPrefix, catppuccinPalette })` returns:

- `mount(): Promise<void>` — idempotently creates or adopts every owned stylesheet after readiness.
- `applySetting(prop, value): Promise<boolean>` — updates an owned configuration style and returns `false` for unrelated settings.

The implementation privately owns style declarations, setting classification, ID normalization, readiness, mounting, adoption, update rules, and CSS rendering. Repeated and pre-readiness updates preserve node identity and use the latest value.

## Feature-lifecycle module

`createFeatureLifecycleModule({ ready, settings, events, scheduleFrame, environment, actions })` returns:

- `start(): Promise<void>` — idempotently installs existing startup, navigation, and configuration behavior.

The implementation privately owns the existing mapping from configuration gates and GitHub events to feature actions. It preserves initial timing, event names, passive options, frame scheduling, and startup-only configuration gates. No registration DSL, live feature normalization, retry policy, or teardown interface is added.

## Test seam

Factories are defined before browser-dependent startup. When `globalThis.__GHP_TEST_HOOK__` is a function, the userscript passes the currently available factories to it and returns before reading GM or browser globals. Node tests evaluate the production file through `node:vm`, capture factories, and supply in-memory adapters.

Commit 1 exposes only `createStyleSheetModule`; commit 2 extends the hook with `createFeatureLifecycleModule`.

