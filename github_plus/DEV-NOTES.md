# Notes

## Commit Signatures

```javascript
$$("[class^='ListItem-module__listItem']").forEach(e => console.log(e.__reactProps$8h4h1f32xkn.children[3].props.children.props.deferredData.signatureInformation))
// Note that the string after __reactProps$ may vary
```

## Global Search

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
