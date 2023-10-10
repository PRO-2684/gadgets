let rows = table.querySelectorAll("#reconcileTable div.row.notReconciled");
function reconcile(row) {
    let btn = row.querySelector("div.cell.reconciledGrade .nav-menu li a[title$='平均']");
    if (btn) btn.click();
}
if (rows) {
    rows.forEach(reconcile);
}
