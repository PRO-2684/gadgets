[![Greasy Fork](https://img.shields.io/greasyfork/dt/517291)](https://greasyfork.org/scripts/517291) [![Support on Afdian](https://img.shields.io/badge/Support-Afdian-%23946CE6?style=flat&logo=afdian)](https://afdian.com/a/PRO-2684)

## 🪄 Features

This script allows you to export cookies of current tab to a file. Currently, it supports the following formats:

- `cookies.txt`: [Netscape HTTP Cookie](http://curl.haxx.se/rfc/cookie_spec.html) File
- `cookies.json`: JSON format

## 📚 Usage

Right-click on any page and select `Tampermonkey` - `Export Cookies`. Then, press OK if you want to export in Netscape format (`cookies.txt`), or press Cancel if you want to export in JSON format (`cookies.json`).

## ⚠️ Notes

Do note that:

- You need to **whitelist** `.json` at Tampermonkey's options page, in order to export to `cookies.json`. (`.txt` is whitelisted by default)
- `httpOnly` cookies are supported at the BETA versions of Tampermonkey only.

## ✨ Credits

- [Get-cookies.txt-LOCALLY](https://github.com/kairi003/Get-cookies.txt-LOCALLY/)
