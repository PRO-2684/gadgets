# Scrollbar Mod

This is a mod version for the [Scrollbar Advanced](https://userstyles.world/style/329/scrollbar-advanced) userstyle, available on:

- [UserStyles.World](https://userstyles.world/style/329/scrollbar-advanced) [![Install directly with Stylus](https://img.shields.io/badge/Install%20directly%20with-Stylus-00adad.svg)](https://userstyles.world/api/style/16203.user.css)
- [GitHub](https://github.com/PRO-2684/gadgets/raw/main/scrollbar_mod/) [![Install directly with Stylus](https://img.shields.io/badge/Install%20directly%20with-Stylus-00adad.svg)](https://github.com/PRO-2684/gadgets/raw/main/scrollbar_mod/scrollbar_mod.user.css)

## Features & Configuration

> [!NOTE]
> Options marked with an asterisk (\*) are only available when `Theme` is set to `Custom`.

- `Theme`: Choose a *color scheme* for the scrollbar
- \* `Track Color`: Customize the track color of the scrollbar
- \* `Handle Color`: Customize the handle color of the scrollbar
- \* `Handle Hover`: Customize the handle color of the scrollbar when hovered
- \* `Handle Active`: Customize the handle color of the scrollbar when activated
- `Radius`: Customize the radius of the scrollbar handle and background
- `Scrollbar Width`: Customize the width of the scrollbar *when hovered*
- `Scrollbar Handle Shrink`: Set how much the scrollbar handle should shrink on both sides when not hovered
- `Background Visibility`: Control the visibility of the scrollbar background
    - `Visible-On-Hover`: The scrollbar background is only visible when hovered over the scrollbar
    - `Always-Visible`: The scrollbar background is always visible
    - `Always-Hidden`: The scrollbar background is always hidden
- `Opacity`: Set the opacity of the scrollbar
- `Force`: Use `!important` on all properties, so as to override website styles (not recommended)

## Mod Features

- New features
    - `Handle Active` feature
    - `ScrollBar Handle Shrink` feature
    - `Opacity` feature
    - `Force` feature
- Renamed & improved features
    - `Handle Radius` renamed to `Radius`, which now also affects the scrollbar background
    - `Transparent Track` renamed to `Background Visibility`, with an additional option to show only when hovered
- Some minor adjustments
    - Code formatting
    - Consistent variable naming
    - Using nested CSS
    - Changing default scrollbar width from 7px to 8px
    - Use hash object to replace `if-else`s
    - Also set `height` property so as to apply the style to horizontal scrollbars as well
    - ...More
- Detailed documentation
