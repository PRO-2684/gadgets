// Execute in https://github.com/catppuccin/palette/blob/main/palette.json
const text = document.querySelector("#read-only-cursor-text-area").textContent;
const palette = JSON.parse(text);
const simplifiedPalette = {};
for (const [key, value] of Object.entries(palette)) {
    // Skip non-color entries
    if (typeof value === "object") {
        // simplifiedPalette[key] = value;
        const colors = {};
        for (const [colorKey, colorValue] of Object.entries(value.colors)) {
            colors[colorKey] = colorValue.hex;
        }
        simplifiedPalette[key] = colors;
    }
}
console.log(JSON.stringify(simplifiedPalette, null, 4));
