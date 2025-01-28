## 🪄 Features

- Drag a link or image to open in a new tab
- Drag a piece of text to search in a new tab
- Customizable search engine and maximum search term length
- Customizable minimum drag distance
- A circle overlay to indicate the minimum drag distance
- Dark Reader support
- Todo list
    - Using `Esc` to interrupt draggy (might not be possible to detect)

## ⚙️ Configuation

- **🎨 Appearance settings**: Settings for the appearance of Draggy overlay.
    - **Circle overlay**: When to show the circle overlay。
        - Always: Always show the circle overlay when dragging is detected
        - Auto: Show the circle overlay only when the detected dragging is targeting text selection or links
        - Never: Never show the circle overlay
- **🛠️ Operation settings**: Settings for the operation of Draggy.
    - **Open tab in background**: Whether to open new tabs in the background。
    - **Open tab insert**: Whether to insert the new tab next to the current tab. If false, the new tab will be appended to the end.
    - **Matching URI in text**: Whether to match URI in the selected text. If enabled ***AND*** the selected text is a valid URI ***AND*** its protocol is allowed, Draggy will open it directly instead of searching.
    - **Minimum drag distance**: Minimum distance to trigger draggy.
- **🔎 Search engine settings**: Configure search engines for different directions. Use `{<max-length>}` as a placeholder for the URL-encoded query, where `<max-length>` is the maximum text length. If `<max-length>` is not specified, the search term will not be truncated.
    - **Search engine (default)**: Default search engine used when dragging text.
    - **Search engine (left)**: Search engine used when dragging text left. Leave it blank to use the default search engine.
    - **Search engine (right)**: Search engine used when dragging text right. Leave it blank to use the default search engine.
    - **Search engine (up)**: Search engine used when dragging text up. Leave it blank to use the default search engine.
    - **Search engine (down)**: Search engine used when dragging text down. Leave it blank to use the default search engine.
    - <details><summary>Author's configuration</summary>
        <ul>
            <li><strong>Search engine (left)</strong>: <code>https://www.deepl.com/zh/translator#en/zh-hans/{}</code> (DeepL Translation)</li>
            <li><strong>Search engine (right)</strong>: <code>https://opnxng.com/search?q={50}</code> (OpnXng Search)</li>
            <li><strong>Search engine (up)</strong>: <code>https://www.google.com/search?q={50}</code> (Google Search)</li>
            <li><strong>Search engine (down)</strong>: <code>https://www.bing.com/search?q={50}</code> (Bing Search)</li>
        </ul>
    </details>
- **⚙️ Advanced settings**: Settings for advanced users or debugging.
    - **Allowed protocols**: Comma-separated list of allowed protocols for matched URI in texts. Leave it blank to allow all protocols.
    - **Maximum time delta**: Maximum time difference between esc/drop and dragend events to consider them as separate user gesture. *Usually there's no need to change this value.*
    - **Process handled events**: Whether to process handled drag events. Note that this may lead to an event being handled multiple times.
    - **Debug mode**: Enables debug mode.

## 📃 Notes

If you're using Microsoft Edge, you might find that "Super Drag Drop" is what you're looking for, which has its own pros and cons compared to Draggy. Below is a comparison table between the two, and if you prefer Super Drag Drop, enable the flag at `edge://flags/#edge-super-drag-drop`, then enable the feature at `edge://settings/superDragDrop`.

| Feature | Draggy | Super Drag Drop |
| --- | --- | --- |
| Drag link, text and image | 🟢 | 🟢 |
| Open tab in background | 🟢 | 🟢 |
| Open tab insert | 🟢 | <span title="Opened tabs always get appended to the end">🔴*</span> |
| Compatibility | 🟡 | 🟢 |
| Custom search engine | <span title="Allows up to 4 different search engines based on dragging direction">🟢*</span> | <span title="Only 1 search engine allowed and limited to Bing or default search engine">🟡*</span> |
| Custom allowed protocols | 🟢 | <span title="Only allows http & https">🔴*</span> |
| Maximum search term length | 🟢 | 🔴 |
| Minimum drag distance | 🟢 | 🔴 |
| Cancel drag | <span title="Move mouse back into the circle (browser's design makes cancelling with Esc impossible)">🟢*</span> | <span title="Press Esc key">🟢*</span> |
| Prompt | <span title="Circle overlay">🟢*</span> | <span title="Top toast">🟢*</span> |
| Website exclude list | <span title="Configure in Tampermonkey">🟢*</span> | 🟢 |
| Hackability | 🟢 | 🔴 |
| Privacy | 🟢 | <span title="Adds tracking parameters when searching">🔴*</span> |
| Cross-browser | <span title="Expected to work on all modern browsers with Tampermonkey">🟢*</span> | <span title="Edge-exclusive">🔴*</span> |
