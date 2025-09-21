# UCAS Helper

## 🪄 Functions

- [🔑 SEP](https://sep.ucas.ac.cn/)
    - 🔐 Auto login*
        - `None`: Do nothing
        - `Focus`: Focus on the first unfilled field (username, password or captcha), or the submit button if all filled
        - `Auto`: Automatically submit the form when all fields are filled, otherwise focus on the first unfilled field
    - 🧼 Cleaner UI
- [🪶 Course Selection](http://xkgo.ucas.ac.cn:3000/courseManage/selectCourse)
    - 📃 Assistive course selection
        - Configure your list of course IDs, or simply follow them
        - When the result contains your desired courses, this script will:
            1. Checks if they are available
            2. If available, it will check them and invert its color for you
            3. If at least one is available, it will focus on the captcha input and mark it red
    - 🟢 Keep Alive
