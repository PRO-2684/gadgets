# `bb_batch_reconcile`

## 🪄 功能

这是一个简单的脚本，用于批量核对 [Blackboard](https://www.blackboard.com/) 中的学生成绩。它使用模拟用户点击的简单方法来批量核对成绩————这不是最有效的方法，但它相当简单，而且效果还不错。

请注意，此脚本仅适用于 Blackboard 的**中文**界面，并且它只会为您取**平均值**。如果您使用的是英文界面，或者您更愿意接受最高/最低分，您可能需要修改脚本第三行。

## 📖 使用

1. 在您的 Blackboard 系统中导航到核对成绩页面。 (类似 `https://bb.example.com/webapps/gradebook/controller/reconcileGrades?course_id=***&id=***`)
2. 将脚本复制到剪贴板，然后粘贴到浏览器控制台中。
3. 按 `Enter` 运行它。

## ⚠️ 警告

- 在 `Enterprise License (3300.0.1-rel.37+c07f12a)` 版本，主题 `Bb Learn 2012` 上测试通过。
- 不能保证在其他版本和主题上工作。
