# Open in Current

## 🪄 Function

Always open pages in the current window, instead of creating a popup.

## 📖 Usage

By default, it **doesn't apply to any websites**. In order for this script to take effect on a site, you need to add the website to **this script's `User matches` list**. (You can find it at `Dashboard` - `Installed Userscripts` - `CORS Helper` - `Settings` - `Includes/Excludes` - `User matches` - `Add...`)

## 🤔 How it works

Intercept [`window.open`](https://developer.mozilla.org/en-US/docs/Web/API/Window/open), and only keep `noopener`, `noreferrer`, and `attributionsrc` in the [`windowFeatures` argument](https://developer.mozilla.org/en-US/docs/Web/API/Window/open#windowfeatures).

## 🔗 Comparison

[Open links in current tab](https://greasyfork.org/scripts/4416) allows you to open links in the current tab, instead of a new tab. It might seem similar to this script, but is fundamentally different.

| | Open in Current | Open links in current tab |
| - | - | - |
| Focus | Disable popups | Disable new tabs |
| Method | Intercept `window.open` | Intercept clicks and `window.open` |
| Default scope | No website | All websites |
