/**
 * Generate a markdown documentation from the configuration description
 * @param {Object} configDesc The configuration description
 */
function genDoc(configDesc) {
    // - **name**: title (if any)
    //   - Sub-items (if parent is a folder)

    // Generate a markdown list item
    function genListItem(name, title, indent = 0, items = null) {
        // let str = `- **${name}**`;
        let str = `${" ".repeat(indent)}- **${name}**`;
        if (title) str += `: ${title}`;
        if (items) {
            str += "\n";
            for (const [key, item] of Object.entries(items)) {
                if (key.startsWith("$")) continue;
                str += genListItem(item.name, item.title, indent + 4, item.items);
            }
        }
        return str + "\n";
    }

    let doc = "";
    for (const [key, item] of Object.entries(configDesc)) {
        if (key.startsWith("$")) continue;
        doc += genListItem(item.name, item.title, 0, item.items);
    }
    return doc;
}
