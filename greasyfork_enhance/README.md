![Greasy Fork](https://img.shields.io/greasyfork/dt/467078) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

> If you encounter formatting issues reading Greasy Fork's README, please visit the [README on GitHub](https://github.com/PRO-2684/gadgets/blob/main/greasyfork_enhance/README.md) for a better experience.

## 🪄 Functions

- Add anchors for headers (`h1~h6`) at Greasyfork pages, so you can navigate easily
- Quickly goes back to top
  - Double click white space at either sides
  - Click `↑` button at lower right corner
- Aside panel for showing outline (*Dynamic opacity*)
- Fix current tab link to make it functional as well (Including tabs at script detail page and the logo at homepage)
- Larger file drop area
- Copy/hide/show code support ([Test link](https://greasyfork.org/scripts/470224))
  - Auto hide code that has larger line number than given value
- More recognizable tables
- Flat layout
- Advanced search syntax (**Case-insensitive**)
  - `site:`: Only display scripts for given site, e.g. query `ad site:youtube.com` will navigate you to `https://greasyfork.org/scripts/by-site/youtube.com?q=ad`
  - `type:`: Search in specified type, including:
    - `script`: Script search (default)
    - `lib`, `library`: Library search
    - ~~`code`: Code search~~
    - `user`: User search
  - `lang:`: Specify programming language (Only for script search)
    - `js`, `javascript`: JavaScript (default)
    - `css`: CSS
    - `any`, `all`: All languages
  - `sort:`: Specify sorting method (Only for script search)
    - `rel`, `relevant`, `relevance`: Sort by relevance (default when query is given)
    - `day`, `daily`, `daily_install`, `daily_installs`: Sort by daily installs (default when no query is given)
    - `total`, `total_install`, `total_installs`: Sort by total installs
    - `score`, `rate`, `rating`, `ratings`: Sort by rating
    - `created`, `created_at`: Sort by creation time
    - `updated`, `updated_at`: Sort by update time
    - `name`, `title`: Sort by name
- Display alternative URLs for libraries
- Display a short link to current script
- Keyboard shortcuts
    - `Ctrl+Enter` inside a textarea to submit forms
    - `Enter` to focus on first search box / textarea
    - `Escape` to unfocus
- Image proxy using `wsrv.nl`
- Customize Tab indentation size

## ⚙️ Configuation

> Config marked with `*` requires refreshing to take effect

- **Auto hide code**: whether to hide long code snippets
- **Min rows to hide**: minimum number of rows to hide that piece of code
- **Tab size**: Tab indentation size
- **Hide buttons**: whether to hide floating buttons
- **Flat layout**: whether to enable flat layout
- **Animation**: Enable animation
- **Alternative URLs for library**: Display alternative URLs for libraries
- **Short link**: Display a short link to current script
- **Shortcut**: Enable keyboard shortcuts
- \***Search syntax**: Enable partial search syntax
- \***Image proxy**: Use `wsrv.nl` as proxy for user-uploaded images
