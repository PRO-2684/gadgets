# UCAS Helper

## 🪄 Functions

> Items marked with an asterisk requires reloading the page for the changes to take effect.

- [🔑 SEP](https://sep.ucas.ac.cn/)
    - 🔐 Auto login*: Choose auto login strategy, works best with browser auto-fill
        - `None`: Do nothing
        - `Focus`: Focus on the first unfilled field (username, password or captcha), or the submit button if all filled
        - `Auto`: Automatically submit the form when all fields are filled, otherwise focus on the first unfilled field; Not working due to browser security policy
    - 🧼 Cleaner UI: Make the navigation page cleaner
    - 📂 Extended entries: Add more entries in  flyout menus
        - `课程` - `在线学习`
            - [考勤系统](https://sep.ucas.ac.cn/portal/site/539/001/1)
- [🪶 Course Selection](http://xkgo.ucas.ac.cn:3000/courseManage/selectCourse)
    - 📃 Assistive course selection
        - Configure your list of course IDs, or simply follow them
        - When the result contains your desired courses, this script will:
            1. Checks if they are available
            2. If available, it will check them and invert its color for you
            3. If at least one is available, it will focus on the captcha input and mark it red
    - 🟢 Keep Alive
- 📝 Course Evaluation (`https://xkcts.ucas.ac.cn:8443/evaluate/*` / `https://jwxk.ucas.ac.cn/evaluate/*`)
    - 📐 Larger click area*: Clicking on the cell will be treated as clicking the radio button inside, and clicking on the header will select all options in that column
    - ⏎ Enter to submit*: Pressing Enter in the validation code field will submit the form
    - ➕ Add spaces*: Add spaces after your answers to circumvent the 15 characters requirement
- 📅 Course Schedule (`https://xkcts.ucas.ac.cn:8443/course/*` / `https://jwxk.ucas.ac.cn/course/*`)
    - ⏎ Enter to query*: Pressing Enter in the fields will trigger the query
- [🎓 MOOC](https://mooc.ucas.edu.cn/)
    - ☁️ Auto space: Automatically go to personal space when entering the portal
    - 📂 Native selector: Use the native file selector instead of the custom one, allowing drag-and-drop
    - 🏁 Force finish*: Allows you to forcibly mark the file as finished, useful if you got stuck on certain files. Currently supported file type(s):
        - PDF
    - 🚫 Hide watermark: Hide the watermark over the videos
    - 🆕 New layout*: Redirect to the new course layout for a better experience
    - 🖼️ Hide course cover: Hide the course cover in the course list for a compact view (only for new layout)

## ➕ Auxiliary scripts

- [MOOC Bug Fix](./mooc-bug-fix.js): Fix various bugs in the MOOC system
    - [Avatar changing page](https://i.mooc.ucas.edu.cn/settings/photo)

## 🖼️ Screenshots

### Native selector

![nativeSelector](nativeSelector.png)
