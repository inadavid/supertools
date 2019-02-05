$(() => {
    var sql_history = sqlite.run("select sn, remark, bom_top, stat, time from bom order by sn desc;");
    var tbody = '<tr><td colspan="6"> 还没有SQL生成记录 </td></tr>';
    if (sql_history.length != 0) {
        tbody = "";
        for (var i = 0; i < sql_history.length; i++) {
            tbody += "<tr>";
            tbody += "<td>" + sql_history[i].sn + "</td>";
            tbody += "<td>" + sql_history[i].remark + "</td>";
            tbody += "<td class='selectable'>" + sql_history[i].bom_top + "</td>";
            tbody += "<td>" + sql_history[i].time + "</td>";
            tbody += "<td>" + (sql_history[i].stat == 0 ? "未执行" : (sql_history[i].stat == 1 ? "已执行" : "已删除")) + "</td>";
            if (sql_history[i].stat == 0) tbody += "<td><button type='button' bid='exe' class='btn btn-success btn-xs custom' sn='" + sql_history[i].sn + "'>执行SQL，导入ERP系统</button> </td> ";
            else if (sql_history[i].stat == 1) tbody += "<td><button type='button' bid='del' class='btn btn-danger btn-xs custom' sn='" + sql_history[i].sn + "'>回滚SQL，删除已经导入的内容</button> </td> ";
            else tbody += "<td> </td> ";
            tbody += "</tr>";
        }
    }
    $("table[bid=dtable] tbody").append(tbody);

    $("button[bid]").on("click", (e) => {
        if (config.fSQLserver != 4) {
            popup("数据库未准备好", "danger");
            return;
        }
        var sn = $(e.currentTarget).attr("sn");
        var action = $(e.currentTarget).attr("bid");
        var data = sqlite.run("select * from bom where sn =" + sn + " limit 1;")[0];
        if (data == undefined) {
            popup("数据读取出错！", "danger");
            return;
        }
        if (action == "exe") {
            if (!confirm("确定要执行导入操作么？本操作会导入" + data.rows + "条新的BOM数据。")) return;
            (async () => {
                try {
                    await sql.query(data.sql_delete);
                    await sql.query(data.sql_insert);
                    sqlite.update("bom", {
                        stat: 1
                    }, { sn: sn });
                    var moment = require('moment');
                    var d = {
                        time: moment().format("YYYY-MM-DD HH:mm:ss"),
                        type: 1,
                        data: JSON.stringify(data),
                        remark: "insert bom items ok and done"
                    };
                    sqlite.insert("log", d);
                    popup("\nBOM相关层级已经插入", "success");
                    loadPanel("dashboard");

                } catch (err) {
                    // ... error checks
                    popup(err + "\n请重新加载后再试。", "danger");
                }
            })()
        }
        if (action == "del") {
            if (!confirm("确定要执行导入操作么？本操作会删除" + data.rows + "条的BOM数据。\n请注意，此操作不可逆！！！")) return;
            (async () => {
                try {
                    await sql.query(data.sql_delete);
                    sqlite.update("bom", {
                        stat: 2
                    }, { sn: sn });
                    var moment = require('moment');
                    var d = {
                        time: moment().format("YYYY-MM-DD HH:mm:ss"),
                        type: 2,
                        data: JSON.stringify(data),
                        remark: "delete bom items ok and done"
                    };
                    sqlite.insert("log", d);
                    popup("\nBOM相关层级已经删除", "success");
                    loadPanel("dashboard");

                } catch (err) {
                    // ... error checks
                    popup(err + "\n请重新加载后再试。", "danger");
                }
            })()
        }
    })
})
