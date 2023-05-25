# `sanitify_header_id`

## 🪄 Function
Sanitify/Sanitize given string (header id) so that it is (hopefully) free of emojis, with its spaces replaced by `-`.

## 📖 Usage
```javascript
sanitify(s);
```

## 🍻 Example
```javascript
["🪄 Function", "📖 Usage", "🍻 Example", "⚠️ Warning", "🌐 Reference", "⚙️ Test Header"].forEach(s => console.log(sanitify(s)));
// Yields:
// Function
// Usage
// Example
// Warning
// Reference
// Test-Header
```

## ⚠️ Warning
Do not expect it to clean 100% of emojis, as they are such a headache.

## 🌐 Reference
TBA.
