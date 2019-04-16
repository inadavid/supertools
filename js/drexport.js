$(function () {
    var moment = require('moment');
    var fromdate, todate;
    $("input[name=fromdate]").val(moment().format("YYYY-MM-DD"));
    $("input[name=todate]").val(moment().format("YYYY-MM-DD"));
    $("button[bid=export]").click(function () {
        if (moment($("input[name=fromdate]").val()) > moment($("input[name=todate]").val())) {
            alert("'To Date' is earlier than 'From Date'");
            return;
        }

        fromdate = moment($("input[name=fromdate]").val()).format("YYYY-MM-DD 00:00:00");
        todate = moment($("input[name=todate]").val()).format("YYYY-MM-DD 00:00:00");
        sqltxt = "select a.billcode, convert(varchar, a.billdate, 111) as billdate, b.amount as amount_dr, b.remark, b.userdef1, a.price, a.amount, a.quantity, c.code, c.name from aa_billflow as a inner join i_draw as b on a.billcode = b.billcode inner join l_goods as c on a.goodsid = c.goodsid where a.billdate >= '" + fromdate + "' and a.billdate <= '" + todate + "';";

        executeMsSql(sqltxt, function (err, result) {
            if (err) throw err;
            var tmppath = app.getPath("temp") + "/SuperTools";
            if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath);
            savedata(tmppath + "/ExportDR-" + moment($("input[name=fromdate]").val()).format("YYYYMMDD-") + moment($("input[name=todate]").val()).format("YYYYMMDD") + ".csv", result.recordset, true);
        })
    })
})