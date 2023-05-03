# `checkbox_patch`

## 🪄 Function
Patches the property `checked` of a certain checkbox, so that a `change` event will also be issued when the `checked` value is modified by other scripts. Usually `change` event will only be issued if the checkbox is clicked by a user.

You may assume that the checkbox is clicked by a user if the event `isTrusted`, and modified by a script if not.

## 📖 Usage
```javascript
let checkbox = document.querySelector('input[type="checkbox"]'); // Provide the checkbox you'd like to patch
patch(checkbox); // Feed it into the patch function
checkbox.addEventListener("change", (e) => console.log(e)); // Add an event listener to make it work
// Done! 🥳
```

## 🍻 Example
See `checkbox_test.html`.

## ⚠️ Warning
Not recommended for serious code as it may break things.

## 🌐 Reference
https://stackoverflow.com/questions/76155771/how-to-properly-listen-for-checkbox-checked-when-it-is-modified-by-scripts
https://stackoverflow.com/a/68426166/16468609
