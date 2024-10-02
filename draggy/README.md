## 🪄 Features

- Drag a link to open in a new tab
- Drag a piece of text to search in a new tab
- Customizable search engine and maximum search term length
- Todo list
    - Using `Esc` to interrupt draggy
    - Customizable minimum drag distance
    - A circle overlay to indicate the minimum drag distance

## ⚙️ Configuation

- **Debug mode**: Enables debug mode.
- **Search engine**: Search engine used when dragging text. Use `{}` as a placeholder for the URL-encoded query.
- **Maximum text length**: Maximum length of the search term. If the length of the search term exceeds this value, it will be truncated. Set to 0 to disable this feature.
- **Maximum time delta**: Maximum time difference between esc/drop and dragend events to consider them as separate user gesture. *Usually there's no need to change this value.*
- ~~**Minimum drag distance**: Minimum distance to trigger draggy.~~
- ~~**Overlay color**: Color of the circle overlay. Set to `transparent` to hide the overlay.~~
