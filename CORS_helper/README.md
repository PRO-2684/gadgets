# CORS Helper

A simple script that helps bypass CORS restrictions.

## 📦 Installation

- [GitHub](https://github.com/PRO-2684/gadgets/raw/main/CORS_helper/cors.js)
- [Greasy Fork](https://update.greasyfork.org/scripts/508769/CORS%20Helper.user.js)

## 🪄 Usage

By default, it **doesn't apply to any websites**. In order for this script to take effect on a site, you need to add the website to **this script's `User matches` list**. (You can find it at `Dashboard` - `Installed Userscripts` - `CORS Helper` - `Settings` - `Includes/Excludes` - `User matches` - `Add...`)

After this, refresh the page and you'll have access to `GM_fetch` function under the `window` object, which behaves like `fetch` but without CORS restrictions.

## 🤔 How it works

```javascript
// ...
// @require      https://cdn.jsdelivr.net/npm/@trim21/gm-fetch@0.1.15
// ...
unsafeWindow.GM_fetch = GM_fetch;
```

Yes, that's it. It simply exposes the `GM_fetch` function under `window`.

## ⚠️ Disclaimer

Please only enable this script on websites you trust, otherwise you're on your own.

## 🎉 Acknowledgements

[Trim21/gm-fetch](https://github.com/Trim21/gm-fetch), for providing wrappers for `GM.xmlHttpRequest` that are compatible with `fetch`.
