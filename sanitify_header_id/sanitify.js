function sanitify(s) {
    // Trim spaces and newlines
    s = s.trim();
    // Replace spaces
    s = s.replaceAll(" ", "-");
    s = s.replaceAll("%20", "-");
    // Remove emojis
    s = s.replaceAll(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDEFF]|\uFE0F| )+-/g, '');
    return s;
}