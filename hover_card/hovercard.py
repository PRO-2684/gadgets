from requests import Session

x = Session()
x.headers = {
    "referer": "https://github.com/",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "cache-control": "no-cache",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
    "x-requested-with": "XMLHttpRequest",
}

def hovercard(query):
    '''`query`: In the format of <user>/<repo>, e.g. `d`.'''
    r = x.get(f"https://github.com/{query}/hovercard")
    assert r.status_code == 200
    return r.text

if __name__ == "__main__":
    text = hovercard("PRO-2684/gadgets")
    with open("test.html", "w") as f:
        f.write(text)
