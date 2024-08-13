from requests import Session
from bs4 import BeautifulSoup
from argparse import ArgumentParser
from os import chdir

class StickerSet:
    def __init__(self, type: str, id: str, retry: int = 8):
        self.type = type
        self.id = id
        self.retry = retry
        self.session = Session()
        self.stickers = []

    def __repr__(self):
        return f"StickerSet({self.type}, {self.id})"

    def __fetch_stickers_list(self):
        url = f"https://stickers.wiki/{self.type}/{self.id}/"
        r = self.session.get(url)
        soup = BeautifulSoup(r.text, "html.parser")
        for sticker in soup.select("main > div > div.sticker > img"):
            self.stickers.append(sticker.get("src") or sticker.get("data-ezsrc"))

    def __download_single_sticker(self, url: str):
        for _ in range(self.retry):
            try:
                r = self.session.get(url)
                r.raise_for_status()
                break
            except:
                pass
        with open(url.split("/")[-1], "wb") as f:
            f.write(r.content)

    def download(self):
        self.__fetch_stickers_list()
        for sticker in self.stickers:
            print(f"Downloading {sticker.removeprefix('https://media.stickerswiki.app/')}...")
            self.__download_single_sticker(sticker)

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--type", "-t", help="Type of stickers (telegram, whatsapp, etc.), default: telegram", default="telegram")
    parser.add_argument("--id", "-i", help="ID of the sticker set", required=True)
    parser.add_argument("--output", "-o", help="Output directory, default: current directory", default="./")
    args = parser.parse_args()
    chdir(args.output)
    sticker_set = StickerSet(args.type.lower(), args.id)
    sticker_set.download()
