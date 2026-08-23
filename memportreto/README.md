# Memportreto

> The name comes from `self-portrait` in [Esperanto](https://en.wikipedia.org/wiki/Esperanto).

Managing user profiles for different sites.

## 🎩 Common Options

- Language: `en`, `en-US`, `zh-CN`, `zh-Hans`
- Timezone: `America/New_York`, `Europe/London`, `Asia/Singapore`, `Asia/Shanghai`

## 📖 Notes

For Tampermonkey, you should go to "Content Script API" and choose "UserScripts API Dynamic" for this script to work reliably.

## ✅ TODO

- Other font-detection mechanism?
    - DOM layout
    - `document.fonts.check()`
    - SVG
    - ...
- Make it a standalone Chrome extension
    - Spoof [Accept-Language header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language)
- Whitelist fonts
    - Need to consider site-registered fonts
- Custom font list

## 🎉 Credits

- [yArna/isChinaUser](https://github.com/yArna/isChinaUser)
