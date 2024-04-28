# pURLfy for Tampermonkey

![Greasy Fork](https://img.shields.io/greasyfork/dt/492480) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

The ultimate URL purifier - Tampermonkey version. This script uses [pURLfy core](https://github.com/PRO-2684/pURLfy) as its core, and integrates its URL purifying functionality into a Tampermonkey script.

## Installation

Simply navigate to [Greasy Fork](https://greasyfork.org/scripts/492480) and click the "Install this script" button.

## Configuration

Statistics can be viewed by clicking `Show Statistics` in the menu, and can be cleared by clicking OK.

For advanced users, you can configure which hooks and rules are enabled by modifying this script's external storage in Tampermonkey:

```jsonc
{
    "hooks": {
        "location.href": true, // Check `location.href` (not really a hook, actually)
        "click": true, // Intercept `click` events
        "mousedown": true, // Intercept `mousedown` events
        "window.open": true // Hook `window.open` calls
    },
    "rules": {
        "cn": true, // Enable Chinese rules
        "alternative": false // Enable alternative rules (Redirects you from some websites to their better alternatives)
    }
}
```

## Updating rules manually

Navigate to Tampermonkey `Dashboard` - `Installed Userscripts` - `pURLfy for Tampermonkey` - `External`, and for each entry under `Resources`, click the `Delete` button. After refreshing the page, the rules will be updated automatically.

## How it works

### Purifying URLs

See [pURLfy core](https://github.com/PRO-2684/pURLfy) and its source code for more information.

### Rules

Rules files can be fount at [pURLfy rules](https://github.com/PRO-2684/pURLfy-rules).

### Hooks

This script hooks certain methods, intercepts calls to them, purifies the URLs, and then calls the original methods with the purified URLs. For more information, see the source code.
