# `wechat_video`

## 🪄 功能
从微信公众号视频推送中下载视频。

## 📖 使用
通过运行以下命令安装所需的包：
```shell
pip install -r requirements.txt
```

```text
usage: wechat_video.py [-h] [--output OUTPUT] url

Download videos from video posts by WeChat Official Accounts.

positional arguments:
  url                   URL of the article or album

options:
  -h, --help            show this help message and exit
  --output OUTPUT, -o OUTPUT
                        Output directory
```

## 🍻 示例
你可以在以下这些网址上测试这个项目：
- [示例视频推送](https://mp.weixin.qq.com/s?__biz=Mzg5ODU0MjM2NA%3D%3D&mid=2247483677&idx=1&sn=e299cc8de66a97041cb0832c282f94d4#rd)
- [示例专辑](https://mp.weixin.qq.com/mp/appmsgalbum?action=getalbum&album_id=1640869658155073541#wechat_redirect)

## ⚠️ 警告
此脚本仅供学习目的。请尊重视频创作者的知识产权。

## 🌐 参考
- [Python 断点续传下载文件](https://www.cnblogs.com/yanghao2008/p/16368311.html)
- [伪造请求头绕过微信反爬虫策略](https://github.com/systemmin/wxdown/blob/b3173e19665717b835d96caa92d9aea3af6413db/internal/service/html_parallel.go#L84)
