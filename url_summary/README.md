# `url_summary`

## 🪄 Function
Get the summary information of the given URL, including:

- Favicon (not guaranteed to exist, largest size when available)
- Title
- Description
- Keywords

## 📖 Usage
```javascript
summary(url, doc); // url: URL, doc: web document object
// Return value
{
    favicon: String, // Icon address
    title: String, // Title
    description: String, // Description
    keywords: String // Keywords
}
```

## 🍻 Example

```javascript
// Get the summary information of the current page
console.log(summary(location.href, document));
// Get the summary information of given page (note the cross-domain issue)
const url = 'https://www.youtube.com';
fetch(url)
    .then(response => response.text())
    .then(text => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        console.log(summary(url, doc));
    }
);
// An example of return value
{
    "favicon": "https://www.youtube.com/s/desktop/d133835b/img/favicon.ico",
    "title": "YouTube",
    "desc": "Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.",
    "keywords": "video, sharing, camera phone, video phone, free, upload"
}
```
