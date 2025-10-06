# `wechat_video`

## 🪄 Function

Download videos from video posts by WeChat Official Accounts.

## 📖 Usage

Install the required packages by running:

```shell
pip install -r requirements.txt
```

```text
usage: wechat_video.py [-h] [--output-dir OUTPUT_DIR] [--output OUTPUT] url

Download videos from video posts by WeChat Official Accounts.

positional arguments:
  url                   URL of the post or album

options:
  -h, --help            show this help message and exit
  --output-dir OUTPUT_DIR, -O OUTPUT_DIR
                        Output directory
  --output OUTPUT, -o OUTPUT
                        Output file name (in the case of a single file)
```

## 🍻 Example

You can test this project on the following URLs:

- [Example video post](https://mp.weixin.qq.com/s?__biz=Mzg5ODU0MjM2NA%3D%3D&mid=2247483677&idx=1&sn=e299cc8de66a97041cb0832c282f94d4#rd)
- [Example album](https://mp.weixin.qq.com/mp/appmsgalbum?action=getalbum&album_id=1640869658155073541#wechat_redirect)

## ⚠️ Warning

This script is for educational purposes only. Please respect the intellectual property rights of the video creators.

## 🌐 Reference

- [Downloading files with support for breakpoint transmission in Python (Chinese)](https://www.cnblogs.com/yanghao2008/p/16368311.html)
- [Handling WeChat anti crawling strategy by faking request headers](https://github.com/systemmin/wxdown/blob/b3173e19665717b835d96caa92d9aea3af6413db/internal/service/html_parallel.go#L84)
