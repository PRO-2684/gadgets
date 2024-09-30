![Greasy Fork](https://img.shields.io/greasyfork/dt/510742) [![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

> If you encounter issues reading Greasy Fork's README, please visit the [README on GitHub](https://github.com/PRO-2684/gadgets/blob/main/github_plus/README.md) for a better experience.

## 🪄 Features

- No use of `MutationObserver` or `setInterval`, purely event-driven, making it more efficient than scripts of similar functionality
- No dangerous monkey patching, ensuring compatibility

## ⚙️ Configuation

- **Personal Access Token**: Your personal access token for GitHub API, starting with `github_pat_` (used for increasing rate limit). For more information, see the [Personal Access Token (PAT)](#-personal-access-token-pat) section.
- **Debug**: Enable debug mode.
- **Release Downloads**: Show how many times a release asset has been downloaded.
- **Release Uploader**: Show who uploaded a release asset.
- **Release Histogram**: Show a histogram of download counts for each release asset.
    - Does not show up if there is only zero or one release asset.
    - Does not show up if none of the release assets have been downloaded.

## 🖼️ Screenshots

Example "Assets" section of [a release](https://github.com/microsoft/terminal/releases/tag/v1.22.2702.0) on GitHub, with `Release Downloads`, `Release Uploader` and `Release Histogram` enabled:

![](./assets.jpg)

Example setup for personal access token:

![](./token.jpeg)

## 🔑 Personal Access Token (PAT)

- Without a PAT, only $60$ requests per hour are allowed; with a PAT, $5000$ requests per hour are allowed, which suffices for most users.
- Find out how to create a fine-grained personal access token [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token).
- Simply select `Public Repositories (read-only)` under `Repository access` tab, which is the default setup. An example image will be shown on the [Screenshots](#-screenshots) section.
- Do note that this script won't be able to add additional information on private repositories.
- Remember to *generate a new token when it expires*.

## 🤔 Known Issues

- The added information might not align well.
