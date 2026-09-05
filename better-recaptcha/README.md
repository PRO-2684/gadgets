# Better reCAPTCHA

[![Support on Afdian](https://img.shields.io/badge/Support-Afdian-%23946CE6?style=flat&logo=afdian)](https://afdian.com/a/PRO-2684)

A userscript that makes reCAPTCHA less tedious to use.

Add [better-recaptcha.js](better-recaptcha.js) to your userscript manager (such as Tampermonkey), then visit a page with reCAPTCHA.

## 🪄 Features

- **Auto click**: Automatically clicks the initial checkbox.
- **Slide select**: Hold the left mouse button and drag across image tiles. Start on an unselected tile to select, or a selected tile to deselect. Retrace your path to restore tiles you back out of; the tile under your pointer stays in the path. Release to finish.

Starting with unselected tiles, dragging `A → B → C → B` leaves only A and B selected.

## ⚙️ Configuration

Toggle **Auto click** and **Slide select** through the script's menu in your userscript manager. Both are enabled by default.

Demo: [testrecaptcha.github.io](https://testrecaptcha.github.io/).

Run regression tests with `node --test better-recaptcha/slide-select.test.cjs` from the repository root.
