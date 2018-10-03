$(() => {
    var sql_history = sqlite.run("select sn, remark, stat, time from bom order by sn desc;");
    var tbody = '<tr><td colspan="5"> 还没有SQL生成记录 </td></tr>';
    if (sql_history.length != 0) {
        tbody = "<tr>";
        for (var i = 0; i < sql_history.length; i++) {
            tbody += "<td>" + sql_history[i].sn + "</td>";
            tbody += "<td>" + sql_history[i].remark + "</td>";
            tbody += "<td>" + sql_history[i].time + "</td>";
            tbody += "<td>" + (sql_history[i].stat == 0 ? "未执行" : (sql_history[i].stat == 1 ? "已执行" : "已删除")) + "</td>";
            if (sql_history[i].stat == 0) tbody += "<td><button type='button' bid='exe' class='btn btn-success btn-xs' sn='" + sql_history[i].sn + "'>执行SQL，导入ERP系统</button> </td> ";
            else if (sql_history[i].stat == 1) tbody += "<td><button type='button' bid='del' class='btn btn-danger btn-xs' sn='" + sql_history[i].sn + "'>回滚SQL，删除已经导入的内容</button> </td> ";
            else tbody += "<td> </td> ";
        }
        tbody += "</tr>";
    }
    $("table[bid=dtable] tbody").append(tbody);
})