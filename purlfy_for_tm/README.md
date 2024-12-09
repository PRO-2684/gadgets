<img src="https://github.com/PRO-2684/pURLfy/raw/main/images/logo.svg" align="right" style="width: 6em; height: 6em; max-width: 100%;">

# pURLfy for Tampermonkey

[![Greasy Fork](https://img.shields.io/greasyfork/dt/492480)](https://greasyfork.org/scripts/492480) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

The ultimate URL purifier - Tampermonkey version. This script uses [pURLfy core](https://github.com/PRO-2684/pURLfy) as its core, and integrates its URL purifying functionality into a Tampermonkey script.

## Installation

Simply navigate to [Greasy Fork](https://greasyfork.org/scripts/492480) and click the "Install this script" button.

## Configuration

- **📖 Rules Settings**: Enable or disable rules
    - **Tracking**: Rules for purifying tracking links
    - **Outgoing**: Rules for purifying outgoing links
    - **Shortener**: Rules for restoring shortened links
    - **Alternative**: Redirects you from some websites to their better alternatives
    - **Other**: Rules for purifying other types of links
    - **Remove Text Fragment**: Remove Text Fragments from URL
- **🪝 Hooks Settings**: Enable or disable hooks
    - **location.href**: Check location.href
    - **click**: Intercept `click` events
    - **mousedown**: Intercept `mousedown` events
    - **auxclick**: Intercept `auxclick` events
    - **touchstart**: Intercept `touchstart` events
    - **window.open**: Hook `window.open` calls
    - **pushState**: Hook `history.pushState` calls
    - **replaceState**: Hook `history.replaceState` calls
    - **Bing**: Site-specific hook for Bing
- **📊 Statistics**: Show statistics
    - **URL**: Number of links purified
    - **Parameter**: Number of parameters removed
    - **Decoded**: Number of URLs decoded (`param` mode)
    - **Redirected**: Number of URLs redirected (`redirect` mode)
    - **Visited**: Number of URLs visited (`visit` mode)
    - **Character**: Number of characters deleted
- **⚙️ Advanced options**: Advanced options
    - **Purify URL**: Manually purify a URL
    - **Senseless Mode**: Enable senseless mode
    - **Disable Beacon**: Overwrite [`navigator.sendBeacon`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) to a no-op function
        - Try out this feature on [Ping Spotter](https://apps.armin.dev/ping-spotter/#) - the "Beacon API" section will show "Request blocked"
    - **Debug Mode**: Enable debug mode

## Updating rules

### Configuring the update interval for rules

Navigate to Tampermonkey `Dashboard` - `Settings` - `External`, and choose the update interval you want from the dropdown menu.

### Updating rules manually

Navigate to Tampermonkey `Dashboard` - `Installed Userscripts` - `pURLfy for Tampermonkey` - `External`, and for each entry under `Resources`, click the `Update` or `Delete` button. After refreshing the page, the rules will be updated automatically.

## How it works

### Purifying URLs

See [pURLfy core](https://github.com/PRO-2684/pURLfy) and its source code for more information.

### Rules

Rules files can be fount at [pURLfy rules](https://github.com/PRO-2684/pURLfy-rules).

### Hooks

This script hooks certain methods, intercepts calls to them, purifies the URLs, and then calls the original methods with the purified URLs. For more information, see the source code.

## Related scripts

[去除链接重定向](https://greasyfork.org/scripts/483475)
