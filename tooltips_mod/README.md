# Tooltips Mod

This is a mod version for the [Tooltips on android](https://userstyles.world/style/8853/tooltips-on-android) userstyle with additional features, available on:

- [UserStyles.World](https://userstyles.world/style/19461/tooltips-mod) [![Install directly with Stylus](https://img.shields.io/badge/Install%20directly%20with-Stylus-00adad.svg)](https://userstyles.world/api/style/19461.user.css)
- [GitHub](https://github.com/PRO-2684/gadgets/raw/main/tooltips_mod/) [![Install directly with Stylus](https://img.shields.io/badge/Install%20directly%20with-Stylus-00adad.svg)](https://github.com/PRO-2684/gadgets/raw/main/tooltips_mod/tooltips_mod.user.css)

## Features & Configuration

> [!NOTE]
> Options marked with an asterisk (\*) only take effect when `Theme` is set to `Custom`.

- `Position`: Choose a *position* for the tooltips
    - `'↙'`: Bottom left
    - `'↘'`: Bottom right
    - `'↖'`: Top left
    - `'↗'`: Top right
- `Theme`: Choose a *color scheme* for the tooltips
    - `Chrome`: Chrome-like tooltips
    - `Edge`: Edge-like tooltips
    - `Custom`: Customize your own
- \* `Background`: Customize the background color of the tooltips
- \* `Foreground`: Customize the text color of the tooltips
- \* `BorderColor`: Customize the border color of the tooltips
- `BorderStyle`: Customize the border style of the tooltips
- `TextDecoration`: Choose a text decoration for elements with `title` attribute (`default` for not applying any)
    - Example: `underline dashed`
    - Refer to [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration) for more options
- `Opacity`: Customize the opacity of the tooltips
- `Radius`: Customize the border radius of the tooltips
- `PaddingX`/`PaddingY`: Customize the padding of the tooltips
- `MarginX`/`MarginY`: Customize the margin of the tooltips

## Mod Features

- Migrated to Stylus
- `z-index` set to `9999`, to ensure tooltips are always on top
- Place tooltips on corners of the screen, so as not to disrupt the content (Customizable with `Position`)
- Built-in themes for Chrome and Edge-like tooltips, or customize your own
- Set `text-decoration` for elements with `title` attribute
