# Open in Current

## 🪄 Function

Always open pages in the current window, instead of creating a popup.

## 📖 Usage

By default, it **doesn't apply to any websites**. In order for this script to take effect on a site, you need to add the website to **this script's `User matches` list**. (You can find it at `Dashboard` - `Installed Userscripts` - `CORS Helper` - `Settings` - `Includes/Excludes` - `User matches` - `Add...`)

## 🤔 How it works

Only keep `noopener`, `noreferrer`, and `attributionsrc` in the [`windowFeatures` argument](https://developer.mozilla.org/en-US/docs/Web/API/Window/open#windowfeatures).
