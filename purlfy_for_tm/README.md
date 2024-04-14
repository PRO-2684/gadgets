# pURLfy for Tampermonkey

![Greasy Fork](https://img.shields.io/greasyfork/dt/492480) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

The ultimate URL purifier - Tampermonkey version. This script uses [pURLfy core](https://github.com/PRO-2684/pURLfy) as its core, and integrates its URL purifying functionality into a Tampermonkey script.

## Installation

Simply navigate to [Greasy Fork](https://greasyfork.org/scripts/492480) and click the "Install this script" button.

## Configuration

For advanced users, you can configure which hooks are enabled by modifying this script's external storage in Tampermonkey:

```jsonc
{
    "hook.location.href": true, // Check `location.href` (not really a hook, actually)
    "hook.click": true, // Intercept `click` events
    "hook.mousedown": true, // Intercept `mousedown` events
    "hook.window.open": true // Hook `window.open` calls
}
```

## How it works

### Purifying URLs

See [pURLfy core](https://github.com/PRO-2684/pURLfy) and its source code for more information.

### Hooks

This script hooks certain methods, intercepts calls to them, purifies the URLs, and then calls the original methods with the purified URLs. For more information, see the source code.
