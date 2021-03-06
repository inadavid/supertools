$(function () {
    var moment = require('moment');
    var fromdate, todate;
    $("input[name=fromdate]").val(moment().format("YYYY-MM-DD"));
    $("input[name=todate]").val(moment().format("YYYY-MM-DD"));
    $("button[bid=drawbill]").click(function () {
        if (!checkDate()) return;
        var btn = $(this);
        btn.prop("disabled", true);
        [fromdate, todate] = checkDate();
        sqltxt = "select a.billcode, convert(varchar, a.billdate, 111) as billdate, b.amount as amount_dr, b.remark, b.userdef1, d.referbillcode, a.price, a.amount, a.quantity, c.code, c.name from aa_billflow as a inner join i_draw as b on a.billcode = b.billcode inner join l_goods as c on a.goodsid = c.goodsid inner join i_drawdetail as d on a.billid=d.billid and a.goodsid=d.goodsid where a.billdate >= '" + fromdate + "' and a.billdate <= '" + todate + "';";

        executeMsSql(sqltxt, function (err, result) {
            if (err) throw err;
            var table = HTMLTable(result.recordset, "table-sm");
            $("div[bid=drtable]").html("").append(table);
            btn.prop("disabled", false);
        })
    })
    $("button[bid=otheroutbill]").click(function () {
        if (!checkDate()) return;
        var btn = $(this);
        btn.prop("disabled", true);
        [fromdate, todate] = checkDate();
        sqltxt = "select a.billcode, convert(varchar, a.billdate, 111) as billdate, c.code, c.name, b.quantity, a.remark, a.userdef1, b.aprice, b.price, b.amount, a.amount as amount_bill from i_otheroutdetail as b inner join i_otherout as a on a.billid = b.billid and a.billdate >= '" + fromdate + "' and a.billdate <= '" + todate + "' inner join l_goods as c on b.goodsid = c.goodsid;";
        executeMsSql(sqltxt, function (err, result) {
            if (err) throw err;
            var table = HTMLTable(result.recordset, "table-sm");
            $("div[bid=drtable]").html("").append(table);
            btn.prop("disabled", false);
        })
    })
    $("button[bid=cmbill]").click(function () {
        if (!checkDate()) return;
        var btn = $(this);
        btn.prop("disabled", true);
        [fromdate, todate] = checkDate();
        sqltxt = "select a.billcode, convert(varchar, a.billdate, 111) as billdate, c.code, c.name, b.quantity, b.aprice, b.price, b.amount, a.amount as amount_bill from cm_drawdetail as b inner join cm_draw as a on a.billid = b.billid and a.billdate >= '" + fromdate + "' and a.billdate <= '" + todate + "' inner join l_goods as c on b.goodsid = c.goodsid;";
        executeMsSql(sqltxt, function (err, result) {
            if (err) throw err;
            var table = HTMLTable(result.recordset, "table-sm");
            $("div[bid=drtable]").html("").append(table);
            btn.prop("disabled", false);
        })
    })
    $("button[bid=cabill]").click(function () {
        if (!checkDate()) return;
        var btn = $(this);
        btn.prop("disabled", true);
        [fromdate, todate] = checkDate();
        sqltxt = "select a.billdate as [CA Billdate], a.billcode as [CA Code], b.billcode as [CE Code], b.lcappamt as [CE Amount],c.billcode as [CF Code], c.expense as [CF Expense], c.material as [CF Material], c.quantity as [CF Qty], d.code, d.name, d.specs from cm_expenseapp as a inner join cm_expenseappexpense as e on e.billid=a.billid inner join cm_expense as b on e.referbillid = b.billid inner join cm_expenseappfinished as f on f.billid=a.billid inner join cm_finished as c on f.referbillid=c.billid inner join l_goods as d on d.goodsid = c.goodsid where a.billdate >= '" + fromdate + "' and a.billdate <= '" + todate + "' order by [CA Code] desc, [CE Code] asc, [CF Code] asc;";
        console.log(sqltxt)
        executeMsSql(sqltxt, function (err, result) {
            if (err) throw err;
            for(var i in result.recordset){
                result.recordset[i]["CA Billdate"]=moment(result.recordset[i]["CA Billdate"]).format("YYYY-MM-DD");
            }
            var table = HTMLTable(result.recordset, "table-sm");
            $("div[bid=drtable]").html("").append(table);
            btn.prop("disabled", false);
        })
    })
    $("button[bid=export]").click(function () {
        var btn = $(this);
        btn.prop("disabled", true);
        var table = $("div[bid=drtable]").find("table");
        if (table.length == 0) return false;
        var data = JSON.parse(table.attr("data"));
        var tmppath = app.getPath("temp") + "/SuperTools";
        if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath);
        savedata(tmppath + "/ExportDR-" + moment($("input[name=fromdate]").val()).format("YYYYMMDD-") + moment($("input[name=todate]").val()).format("YYYYMMDD") + ".csv", data, true, function () {
            btn.prop("disabled", false);
        });
    });
})

function checkDate() {
    if (moment($("input[name=fromdate]").val()) > moment($("input[name=todate]").val())) {
        alert("'To Date' is earlier than 'From Date'");
        return false;
    }

    fromdate = moment($("input[name=fromdate]").val()).format("YYYY-MM-DD 00:00:00");
    todate = moment($("input[name=todate]").val()).format("YYYY-MM-DD 00:00:00");
    return [fromdate, todate];
}