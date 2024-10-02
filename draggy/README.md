## 🪄 Features

- Drag a link to open in a new tab
- Drag a piece of text to search in a new tab
- Customizable search engine and maximum search term length
- Customizable minimum drag distance
- A circle overlay to indicate the minimum drag distance
- Todo list
    - Using `Esc` to interrupt draggy (might not be possible to detect)

## ⚙️ Configuation

- **Circle overlay**: When to show the circle overlay
    - Always: Always show the circle overlay when dragging is detected
    - Auto: Show the circle overlay only when the detected dragging is targeting text selection or links
    - Never: Never show the circle overlay
- **Search engine**: Search engine used when dragging text. Use `{}` as a placeholder for the URL-encoded query.
- **Maximum text length**: Maximum length of the search term. If the length of the search term exceeds this value, it will be truncated. Set to 0 to disable this feature.
- **Minimum drag distance**: Minimum distance to trigger draggy.
- **Maximum time delta**: Maximum time difference between esc/drop and dragend events to consider them as separate user gesture. *Usually there's no need to change this value.*
- **Debug mode**: Enables debug mode.

## 📃 Notes

If you're using Microsoft Edge, you might find that "Super Drag Drop" is what you're looking for, which has its own pros and cons compared to Draggy. Below is a comparison table between the two, and if you prefer Super Drag Drop, enable the flag at `edge://flags/#edge-super-drag-drop`, then enable the feature at `edge://settings/superDragDrop`.

| Feature | Draggy | Super Drag Drop |
| --- | --- | --- |
| Drag link | ✔️ | ✔️ |
| Drag text | ✔️ | ✔️ |
| Drag image | ❌ (coming soon) | ✔️ |
| Open in background | ❌ | ✔️ |
| Custom search engine | ✔️ | ✔️ (limited to Bing and default search engine) |
| Maximum search term length | ✔️ | ❌ |
| Minimum drag distance | ✔️ | ❌ |
| Cancel drag | Move mouse back into the circle | Press Esc key |
| Prompt | Circle overlay | Top toast |
| Website block list | ✔️ (configure in Tampermonkey) | ✔️ |
