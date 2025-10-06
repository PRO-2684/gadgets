[![Greasy Fork](https://img.shields.io/greasyfork/dt/467078)](https://greasyfork.org/scripts/467078) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

> If you encounter formatting issues reading Greasy Fork's README, please visit the [README on GitHub](https://github.com/PRO-2684/gadgets/blob/main/greasyfork_enhance/README.md) for a better experience.

## 🪄 Functions

- Auto login
- Filter out (hides) scripts whose name matches the given regular expression, disabled when left empty (examples listed below)
    - `.{30,}`: Hide scripts whose name length is greater than 30
    - `网盘|网课|网购`: Hide scripts containing `网盘`, `网课`, or `网购`
    - `[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDEFF]|\uFE0F`: Hide scripts containing emojis
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
- Show version number in script list
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
- Keyboard shortcuts
    - `Ctrl+Enter` inside a textarea to submit forms
    - `Enter` to focus on first search box / textarea
    - `Escape` to unfocus
    - `ArrowLeft` and `ArrowRight` for previous and next page
- Image proxy using `wsrv.nl`
- Customize Tab indentation size
- Metadata parsing
- ... and more

## ⚙️ Configuration

> Config marked with `*` requires refreshing to take effect

- **🔎 Filter and Search**
    - **\*Anchor**: Show anchor for each heading
    - **\*Outline**: Show an outline for the page, if your screen is wide enough
    - **Shortcut**: Enable keyboard shortcuts
    - **Regex filter**: Use regex to filter out matching scripts
    - **\*Search syntax**: Enable partial search syntax for Greasy Fork search bar
- **📝 Code blocks**
    - **\*Toolbar**: Show toolbar for code blocks, which allows copying and toggling code
    - **Auto hide code**: Hide long code blocks by default (Need "\*Toolbar" to be enabled)
    - **Min rows to hide**: Minimum number of rows to hide (Need "\*Toolbar" to be enabled)
    - **Tab size**: Set Tab indentation size
    - **Animation**: Enable animation for toggling code blocks
    - **Metadata**: Parses certain important script metadata and displays it on the script code page
- **🎨 Display**
    - **Hide buttons**: Hide floating buttons added by this script
    - **Sticky pagination**: Make pagination bar sticky
    - **Flat layout**: Use flat layout for script list and descriptions
    - **Show version**: Show version number in script list
    - **Navigation bar**: Override navigation bar style
        - `Default`: Use default style
        - `Desktop`: Use desktop style
        - `Mobile`: Use mobile style
    - **Always show notification**: Always show the notification widget
- **🔑 Credentials** (Experimental)
    - **\*Auto login**: Automatically login to Greasy Fork, if not already (only support email/password login, without 2FA)
        - `Never`: Never auto login
        - `HomepageOnly`: Auto login only on homepage
        - `Always`: Always auto login
    - **Capture credentials**: Automatically save email and password after login attempt, overwriting existing values
    - **Email**: Email address for auto login
    - **Password**: Password for auto login
- **🔧 Other**
    - **Short link**: Display a shortened link to current script
    - **Alternative URLs for library**: Show a list of alternative URLs for a given library
    - **\*Image proxy**: Use `wsrv.nl` as proxy for user-uploaded images
    - **Debug**: Enable debug mode
