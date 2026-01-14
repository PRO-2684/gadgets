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

By investigating source code (thanks for the source mapping) and setting breakpoints, we can find out that GitHub initializes tracking endpoints from certain `<meta>` tags. By clearing these tags' `content` property, we can prevent some tracking.

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
