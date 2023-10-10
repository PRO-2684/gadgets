# `bb_batch_reconcile`

## 🪄 Function

This is a simple script to batch reconcile student grades in [Blackboard](https://www.blackboard.com/). It uses the simple method of emulating user clicks to batch reconcile grades. This is not the most efficient method, but it is rather simple and works pretty well.

Note that this script is intended for **Chinese** interface of Blackboard, and it accepts the **mean value** for you. If you are using the English interface or would rather accept the highest/lowest grade, you may need to change L3 in the script.

## 📖 Usage

1. Navigate to the reconcile page in your Blackboard system. (Something like `https://bb.example.com/webapps/gradebook/controller/reconcileGrades?course_id=***&id=***`)
2. Copy the script to the clipboard, and paste it into the browser console.
3. Press `Enter` to run it.

## ⚠️ Warning

- Tested on `Enterprise License (3300.0.1-rel.37+c07f12a)`, theme `Bb Learn 2012`.
- Not guaranteed to work on other versions and themes.
