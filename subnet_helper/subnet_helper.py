try:
    from rich import print
except ImportError:
    RICH = False
else:
    RICH = True

def binToList(s: str) -> list[str]:
    # Convert 1110000001000000 to [224, 64, 0, 0]
    # Split into octets
    octets = [s[i:i+8] for i in range(0, len(s), 8)]
    # Pad with 0
    octets = [octet.ljust(8, "0") for octet in octets]
    # Convert to int
    l = [int(octet, 2) for octet in octets]
    if len(l) < 4:
        l += [0] * (4 - len(l))
    return l

def spacePad(s: str):
    # Add spaces every 8 characters
    return " ".join([s[i:i+8] for i in range(0, len(s), 8)])

def prefixToHuman(s: str) -> str:
    #  Convert 11100000 01000000 to 224.64.0.0/16
    # Remove spaces
    s = s.replace(" ", "")
    length = len(s)
    l = binToList(s)
    ipv4 = ".".join([str(i) for i in l])
    return f"{ipv4}/{length}"

def humanToPrefix(s: str) -> str:
    # Convert 224.64.0.0/16 to 11100000 01000000
    parts = s.split("/")
    length = int(parts[1])
    parts = parts[0].split(".")
    # Convert to binary
    l = [bin(int(part))[2:].zfill(8) for part in parts]
    if len(l) < 4: # Complete with 0
        l += ["0" * 8] * (4 - len(l))
    binary = " ".join(l)
    length_with_spaces = length + (length // 8)
    return binary[:length_with_spaces]

def prefixToRange(s: str):
    # From binary prefix to available IP range
    # Remove spaces
    s = s.replace(" ", "")
    length = len(s)
    left = 32 - length
    print(f"  Available IP count: 2^{left} = {2 ** left}")
    l = binToList(s)
    start = ".".join([str(i) for i in l])
    l = binToList(s + "1" * left)
    end = ".".join([str(i) for i in l])
    print(f"  Available IP range: {start} - {end}")
    print(f"  Available IP range (bin): {spacePad(s + '0' * left)} - {spacePad(s + '1' * left)}")

if __name__ == "__main__":
    while True:
        try:
            s = input("> ")
        except KeyboardInterrupt:
            break
        if "/" in s:
            prefix = humanToPrefix(s)
            print(f"[cyan]Prefix: {prefix}[/cyan]" if RICH else f"Prefix: {prefix}")
        else:
            prefix = s
            print(f"[cyan]Human-friendly: {prefixToHuman(prefix)}[/cyan]" if RICH else f"Human-friendly: {prefixToHuman(prefix)}")
        prefixToRange(prefix)
    exit(0)
