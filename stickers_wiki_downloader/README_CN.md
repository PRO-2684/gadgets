# `stickers_wiki_downloader`

## 🪄 功能
从 [stickers.wiki](https://stickers.wiki/) 下载整套贴纸。

## 📖 使用
```text
usage: swd.py [-h] [--type TYPE] --id ID [--output OUTPUT]

options:
  -h, --help            show this help message and exit
  --type TYPE, -t TYPE  Type of stickers (telegram, whatsapp, etc.), default: telegram
  --id ID, -i ID        ID of the sticker set
  --output OUTPUT, -o OUTPUT
                        Output directory, default: current directory
```

例如：

```bash
python swd.py -i ymypm1
```

## ⚠️ 警告
- 本脚本仅供教育目的使用，请勿用于任何商业目的。
- 仅在 Telegram 贴纸上进行了测试。

## 🌐 参考
与代码片段相关的有用/启发性内容。