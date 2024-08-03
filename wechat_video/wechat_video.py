from argparse import ArgumentParser
from math import log10
from os import chdir, path
from re import DOTALL, search, sub
from shutil import move
from time import sleep
from urllib import parse

from json5 import loads
from requests import RequestException, Session

INTERVAL = 5
CHUNK_SIZE = 1024
HEADERS = {
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "DNT": "1",
    "Sec-Ch-Ua": '"Not)A;Brand";v="99", "Microsoft Edge";v="127", "Chromium";v="127"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0",
}
VIDEO_HEADERS = {
    "Host": "mpvideo.qpic.cn",
    "Origin": "https://mp.weixin.qq.com",
    "Referer": "https://mp.weixin.qq.com/",
    "Range": "bytes=0-",
}
x = Session()
x.headers.update(HEADERS)


def get_retry(url, headers={}, stream=False, retries=3):
    for i in range(retries):
        try:
            r = x.get(url, headers=headers, timeout=60, stream=stream)
            return r
        except Exception as e:
            print(f"  Error: {e}")
            print(f"  Retrying {i + 1}/{retries}...")
            sleep(INTERVAL)
    raise Exception("  Failed to fetch the URL:", url)


def format_article_url(article_url: str) -> str:
    """Clean and format the article URL."""
    # 1. https://mp.weixin.qq.com/s?__biz=Mzg5ODU0MjM2NA==&amp;amp;mid=2247483677&amp;amp;idx=1&amp;amp;sn=e299cc8de66a97041cb0832c282f94d4&amp;amp;chksm=c061bf6ef7163678ca9a04f8a3dcdeffaaeb8abe55772fbbdb53fa1dd665c72df807acf8613f#rd
    #   => https://mp.weixin.qq.com/s?__biz=Mzg5ODU0MjM2NA==&mid=2247483677&idx=1&sn=e299cc8de66a97041cb0832c282f94d4
    decoded = article_url.replace("&amp;amp;", "&")
    # 2. Only preserve `__biz`, `mid`, `idx`, `sn` query parameters
    url = parse.urlparse(decoded)
    query = parse.parse_qs(url.query)
    query = {k: v for k, v in query.items() if k in {"__biz", "mid", "idx", "sn"}}
    query_str = parse.urlencode(query, doseq=True)
    cleaned = f"{url.scheme}://{url.netloc}{url.path}?{query_str}"
    # 3. Replace 'http://' with 'https://'
    return cleaned.replace("http://", "https://")


def extract_video_info(html: str) -> list:
    """Extract the video information from the HTML."""
    # Extract the __mpVideoTransInfo array string
    match = search(
        r"window\.__mpVideoTransInfo\s*=\s*(\[\s*\{.*?\},\s*\]);", html, DOTALL
    )
    if not match:
        return []
    json_str = match.group(1)
    # Remove '* 1 || 0'
    json_str = sub(r"\s*\*\s*1\s*\|\|\s*0", "", json_str)
    # Only keep url in '(url).replace(/^http(s?):/, location.protocol)'
    json_str = sub(
        r"\(\s*(\'http[^\)]*)\)\.replace\(\s*/\^http\(s\?\):/, location\.protocol\s*\)",
        r"\1",
        json_str,
    )
    data = loads(json_str)
    return data


def best_quality(data: list) -> dict:
    """Return the URL of the best quality video."""
    # Consider first `video_quality_level`, then `filesize`
    # Note that they're both strings, so we should convert them to integers
    item = max(
        data,
        key=lambda x: (int(x["video_quality_level"] or 0), int(x["filesize"]) or 0),
    )
    return item


def download_video(video_url: str, filename: str):
    """Download the video given the video URL."""
    # Chunked download
    print(f"🔍 Downloading {filename}...", end="\r")
    tmp_file_path = filename + ".tmp"
    if not path.exists(filename) or path.exists(tmp_file_path):
        try:
            r = get_retry(video_url, headers=VIDEO_HEADERS, stream=True)
            r.raise_for_status() # Raise an exception if the response is not 200 OK
            total_size = int(r.headers["Content-Length"])
            if path.exists(tmp_file_path):
                tmp_size = path.getsize(tmp_file_path)
                print(f"  Already downloaded {tmp_size} Bytes out of {total_size} Bytes ({100 * tmp_size / total_size:.2f}%)")
                if tmp_size == total_size:
                    move(tmp_file_path, filename)
                    print("✅ Downloaded {filename} successfully.")
                    return True
            else:
                tmp_size = 0
                print(f"  File is {total_size} Bytes, downloading...")

            res_left = get_retry(video_url, headers={"Range": f"bytes={tmp_size}-", **VIDEO_HEADERS}, stream=True)

            with open(tmp_file_path, "ab") as f:
                for chunk in res_left.iter_content(chunk_size=CHUNK_SIZE):
                    tmp_size += len(chunk)
                    f.write(chunk)
                    f.flush()

                    done = int(50 * tmp_size / total_size)
                    print(f"\r  [{'█' * done}{' ' * (50 - done)}] {100 * tmp_size / total_size:.0f}%", end="")

            if tmp_size == total_size:
                move(tmp_file_path, filename)
                print(f"✅ Downloaded {filename} successfully.")

        except RequestException as e:
            # Log the error
            print(e)
            with open(filename + '_log.txt', 'a+', encoding = 'UTF-8') as f:
                f.write('%s, %s\n' % (video_url, e))
            print(f"❌ Failed to download {filename}.")
    else:
        print(f"✅ Downloaded {filename} successfully.")

def download_single(article_url: str, filename: str):
    """Download a single video from the given `article_url`."""
    # `article_url` be like: https://mp.weixin.qq.com/s?__biz=Mzg5ODU0MjM2NA%3D%3D&mid=2247483677&idx=1&sn=e299cc8de66a97041cb0832c282f94d4#rd
    assert article_url.startswith("https://mp.weixin.qq.com/s?"), "Invalid article URL"
    print(f"Extracting video from {article_url}...")
    r = x.get(article_url)
    if "环境异常" in r.text:
        print("Aborted due to detected environment exception.")
        return
    data = extract_video_info(r.text)
    if not data:
        print("No video found.")
        return
    item = best_quality(data)
    item["url"] = item["url"].replace("&amp;", "&")
    download_video(item["url"], f"{filename}.mp4")


def extract_album_info(html: str) -> list:
    """Extract the album information from the HTML."""
    # Extract the __appmsgalbum array string
    match = search(r"var\s+videoList\s+=\s*(\[\s*\{.*?\}\s*\]);", html, DOTALL)
    if not match:
        return []
    json_str = match.group(1)
    # Remove ' * 1'
    json_str = sub(r"\s+\*\s+1", "", json_str)
    data = loads(json_str)
    return data


def extract_article_urls(album_info: list) -> list:
    """Extract the list of article URLs from the `album_info`."""
    return [format_article_url(item["url"]) for item in album_info if item["url"]]


def fetch_article_urls(album_url: str) -> list:
    """Fetch the list of article urls from the `album_url`."""
    # `album_url` be like: https://mp.weixin.qq.com/mp/appmsgalbum?action=getalbum&album_id=1640869658155073541#wechat_redirect
    assert album_url.startswith(
        "https://mp.weixin.qq.com/mp/appmsgalbum?"
    ), "Invalid album URL"
    r = x.get(album_url)
    album_info = extract_album_info(r.text)
    article_urls = extract_article_urls(album_info)
    return article_urls


def download_album(album_url: str):
    """Download all videos from the given `album_url`."""
    print("Fetching article URLs...")
    article_urls = fetch_article_urls(album_url)
    print(f"Found {len(article_urls)} articles.")
    i = 1
    length = int(log10(len(article_urls))) + 1
    for article_url in article_urls:
        sleep(INTERVAL)
        download_single(article_url, f"{i:0{length}}")
        i += 1


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.description = "Download videos from video posts by WeChat Official Accounts."
    parser.add_argument("url", help="URL of the article or album")
    parser.add_argument("--output", "-o", help="Output directory", default=".")
    args = parser.parse_args()
    url = args.url
    chdir(args.output)
    if url.startswith("https://mp.weixin.qq.com/mp/appmsgalbum?"):
        download_album(url)
    elif url.startswith("https://mp.weixin.qq.com/s?"):
        download_single(url, "video")
    elif url:
        print("Invalid URL")
    else:
        print("No URL provided")
