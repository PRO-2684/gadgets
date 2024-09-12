# 🪄 Functions

1. [Unified authentication](https://passport.ustc.edu.cn/)
    - Auto recognize verification code (Adapted from [this script](https://greasyfork.org/scripts/431681) by [@J-Paven](https://greasyfork.org/users/810521))
    - Focus on the captcha input / login button (so you only need to hit `Enter` to login)
    - Prompt service domain, url and its credibility (If the service is provided by a student or teacher, you may contact him/her via email by clicking "Student" or "Staff")
    - Auto login (require previous one checked; official services only; clicks "login" after 5s)
    - View/fake browser fingerprint to bypass device check

2. [USTC Mail](https://mail.ustc.edu.cn/)
    - Focus on the login button
    - Remove watermarks
    - Remove background image

3. [Rec](https://rec.ustc.edu.cn/)
    - Auto clicking into USTC CAS login page
    - Setting certain links to open at the current tab (can greatly improve performance)

4. [BB System(Online Teaching Platform)](https://www.bb.ustc.edu.cn/)
    - Auto clicking login at both main page and the page asking for authentication if you access the site outside the campus network
    - Checking your homework status (Uploaded, Not uploaded, Error)
        - Allows for ignoring homeworks (Skips checking their status)

5. [Education Administration System](https://jw.ustc.edu.cn)
    - Auto focus on or click login button.
    - Shortcut support (``` ` ``` for going back to homepage)
    - Hide your scores at "我的成绩" page using "尚未评教"
        - Double click a certain entry to hide/show it
        - Double click the table header to hide/show all entries
        - Support for statistics
    - Show the start/end time of every class
    - Certain CSS improvements
    - Show the sum of credit and period at course table
    - Hides your personal/sensitive information

6. [Second Classroom](https://young.ustc.edu.cn/login/)
    - Customize the tab on entering
    - Auto clicking login at the page asking for authentication if you access the site outside the campus network
    - Auto navigate to frequently-used submenu when clicking on main menu
    - Remove annoying data screen image
    - Shortcut support

7. [Web VPN](https://wvpn.ustc.edu.cn/)
    - Allows for customize your collections.

8. [Icourse](https://icourse.club/)
    - Display all uploaded files/attachments and aoto naming
    - Display all mentioned links
    - Certain CSS improvements; Use native go to top method
    - Anti filtering: See [this script](https://greasyfork.org/scripts/494053)

If you need a certain feature, leave a comment and I might add it as far as I can.

# ⌨️ Shortcuts

- Left/Right arrow: Switching tabs
- Numbers (1-9): Switch to given tab
- x: Close current tab
- Scroll wheel: Switch tabs

# ⚙️ Configuation

Open the Tampermonkey menu when the script is running.

- Unified authentication
    - **Enabled**: If false, all features will be disabled for passport.ustc.edu.cn
    - **Code recognition**: Enable auto recognizing verification code
    - **Focus**: Whether to focus on "Login" button
    - **Service**: Hint service domain and its credibility
    - **Auto login**: Whether automatically clicks login button
    - **Show fingerprint**: Whether to display browser fingerprint
    - **Fake fingerprint**: Fake browser fingerprint
- USTC Mail
    - **Enabled**: If false, all features will be disabled for mail.ustc.edu.cn
    - **Focus**: Whether to focus on "Login" button
    - **Remove watermark**: Removes watermarks
- Rec
    - **Enabled**: ...
    - **Auto login**: Whether automatically clicks login (USTC cas login)
    - **Open in current tab**: Whether open links in current tab (Significantly improves performance)
- BB System(Online Teaching Platform)
    - **Enabled**: ...
    - **Auto authenticate**: Whether automatically authenticate when accessing outside school net
    - **Auto login**: Whether automatically clicks login
    - **Show homework status**: Whether to display homework status (may consume some traffic)
- Education Administration System
    - **Enabled**: ...
    - **Login**: What to do to the login button: 'none', 'focus', 'click'
    - **Shortcut**: Shortcut support
    - **Score mask**: Hide/reveal your scores with dblclick
    - **Detailed time**: Show the start/end time of every class
    - **CSS improve**: Certain improvements of CSS
    - **Sum**: Show the sum of credit and period at course table
    - **Privacy**: Hides your personal/sensitive information
- Second Classroom
    - **Enabled**: ...
    - **Auto authenticate**: Whether automatically authenticate when accessing outside school net
    - **Default tab**: The tab on entering
    - **Auto tab**: Auto navigate to frequently-used submenu
    - **No data screen**: Remove annoying data screen image
    - **Shortcut**: Shortcut support
- Web VPN
    - **Enabled**: ...
    - **Custom collection**: Allows for customizing collections
- Icourse
    - **Enabled**: ...
    - **File list**: Display all uploaded files/attachments and auto naming
    - **Link list**: Show all links posted in the review section
    - **CSS improve**: Certain improvements of CSS
    - **Link list**: Use native method to scroll to top

For more USTC related scripts, you can refer to script set [USTC collection](https://greasyfork.org/zh-CN/scripts?set=586574).
