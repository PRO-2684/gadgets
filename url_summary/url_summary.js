function getFaviconURL(url, doc) { // Get the favicon URL of a website - doesn't guarantee the favicon exists
    const favicons = doc.querySelectorAll("link[rel~='icon']");
    let maxArea = -1;
    let maxIndex = -1;
    favicons.forEach((favicon, index) => {
        const sizes = favicon.getAttribute("sizes")?.split("x");
        const area = sizes.length === 2 ? sizes[0] * sizes[1] : 0;
        if (area > maxArea) {
            maxArea = area;
            maxIndex = index;
        }
    });
    if (maxIndex !== -1) {
        return favicons[maxIndex].href;
    } else {
        return (new URL(url)).origin + "/favicon.ico";
    }
}
function getTitle(doc) { // Get the title of a website
    const title = doc.querySelector("title");
    return title?.textContent || "";
}
function getDesc(doc) { // Get the description of a website
    const desc = doc.querySelector("meta[name~='description']");
    return desc?.content || "";
}
function getKeywords(doc) { // Get the keywords of a website
    const keywords = doc.querySelector("meta[name~='keywords']");
    return keywords?.content || "";
}
function summary(url, doc) { // Get the summary of a website
    return {
        favicon: getFaviconURL(url, doc),
        title: getTitle(doc),
        desc: getDesc(doc),
        keywords: getKeywords(doc),
    };
}
