# Dev Notes

## Established Features

> For more detailed information, please refer to the source code. It contains explanations and insights that may not be covered here.

### `Release *` Features

- First, we need to listen for `DOMContentLoaded` and `turbo:load` events to know when DOM is ready or there has been a content change. In both cases, we need to re-check the page (`setupListeners`).
- Then, we should find all release-related `include-fragment` elements. By using devtools, we learn that they will be dynamically replaced with the actual content, so it's vital to investigate them.
- Search GitHub and we can find [the repo for `include-fragment`](https://github.com/github/include-fragment-element/) with documentation. We can learn from the documentation that a `include-fragment` element will dispatch a `include-fragment-replace` event, just after the content has been fetched and parsed, and before it's inserted into the DOM. Better still, it comes with a handy `detail.fragment` property of type [`DocumentFragment`](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment), which is the parsed content.
- So, for each `include-fragment` element, we listen for the `include-fragment-replace` event and then process the `detail.fragment` to add our additional information (`onFragmentReplace`).
- In order to query additional information for a given release, we simply call the ["Get a release by tag name" API](https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-a-release-by-tag-name). We can then extract the information we need and add it to the `DocumentFragment`.

### `Tracking Prevention` Feature

By investigating source code (thanks for the source mapping) and setting breakpoints, we can find out that GitHub initializes tracking endpoints from certain `<meta>` tags. By clearing these tags' `content` property, we can prevent some tracking. Also, GitHub patches `fetch` to also send analytics data, so we need to revert this patch as well.

## Catppuccin Icons

- `associations.json` & `icons.json`: Extracted from [`catppuccin-web-file-explorer-icons-{version}-sources.zip`](https://github.com/catppuccin/web-file-explorer-icons/releases/).
- `palette.json`: Extracted and [simplified](./simplify-palette.js) from `palette.json` in the [Catppuccin palette](https://github.com/catppuccin/palette).

## Research Notes

### Commit Signatures

```javascript
$$("[class^='ListItem-module__listItem']").forEach(e => console.log(e.__reactProps$8h4h1f32xkn.children[3].props.children.props.deferredData.signatureInformation))
// Note that the string after __reactProps$ may vary
```

### Global Search

- Input Element: `$("qbsearch-input")`
    - Events:
        - `qbsearch-input:close`
        - `qbsearch-input:expand`
        - `qbsearch-input:updateText`
    - Properties:
        - `ast`
        - `lastParsedQuery`
        - `parser`
        - `parsing`
        - `search`
        - `queryBuilder`
        - `retract`
    - Listens to `queryBuilder.parentElement`'s `submit` event
- Query Builder: `$("qbsearch-input").queryBuilder`
    - Events:
        - `blackbird-monolith.manageCustomScopes`
        - `blackbird-monolith.search`
        - `convert-to-query-syntax`
        - `query`
        - `query-builder:navigate`
        - `search-copilot-chat`
    - Properties:
        - `attachProvider`
            ```javascript
            const provider = {}; // TODO
            qb.addEventListener("query-builder:request-provider", e => {
                qb.attachProvider(provider);
            }, {once: true});
            await qb.requestProviders();
            ```

### Loading State Detection

```javascript
document.addEventListener("soft-nav:start", console.log);
navigation.addEventListener("navigate", console.log);
document.addEventListener("soft-nav:end", console.log);
```

### Webpack Chunk Patching

```javascript
if (config.get("appearance.catppuccinIcons")) {
    const HOOK_POINT = "webpackChunk_github_ui_github_ui";
    const CHUNK_NAME = "46358"; // Content of the first array
    const MODULE_ID = 59663; // The module ID that contains the target function

    const chunks = [];
    unsafeWindow[HOOK_POINT] = chunks;
    const originalPush = Array.prototype.push;
    chunks.push = function (...args) {
        // Check if the chunk contains the target module
        for (const chunk of args) {
            console.log("Push chunk:", chunk[0][0]);
            if (chunk[0][0] === CHUNK_NAME) {
                console.log("Found target chunk:", chunk);
                // Patch the target module
                chunk[1][MODULE_ID] = patchedFunction;
                // TODO: Revert the patch after use
                // chunks.push = originalPush;
                break;
            }
        }
        return originalPush.apply(this, args);
    };

    function patchedFunction(exports, module, require) {
        // todo
    }
}
```
