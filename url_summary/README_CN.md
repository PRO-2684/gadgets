# `url_summary`

## 🪄 功能
获取给定网址的摘要信息，包括：

- 图标 (不保证网址存在, 存在时取最大尺寸)
- 标题
- 描述
- 关键词

## 📖 使用方法
```javascript
summary(url, doc); // url: 网址, doc: 网页文档对象
// 返回值
{
    favicon: String, // 图标地址
    title: String, // 标题
    description: String, // 描述
    keywords: String // 关键词
}
```

## 🍻 例子
```javascript
// 获取当前页面的摘要信息
console.log(summary(location.href, document));
// 获取指定页面的摘要信息 (注意跨域问题)
const url = 'https://www.youtube.com';
fetch(url)
    .then(response => response.text())
    .then(text => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        console.log(summary(url, doc));
    }
);
// 返回值示例
{
    "favicon": "https://www.youtube.com/s/desktop/d133835b/img/favicon.ico",
    "title": "YouTube",
    "desc": "在 YouTube 上畅享你喜爱的视频和音乐，上传原创内容并与亲朋好友和全世界观众分享你的视频。",
    "keywords": "视频, video, 分享, sharing, 拍照手机, camera phone, 视频手机, video phone, 免费, free, 上传, upload"
}
```
