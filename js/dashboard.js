$(() => {
    var sqltxt = "select a.*,b.opname from st_goodsbom_stat as a inner join m_operator as b on a.opid=b.opid where a.opid=" + user.id + " order by date desc;";
    new sql.Request().query(sqltxt, (err, result) => {
        if (err) {
            alert("Error happened: \n" + JSON.stringify(err));
            console.error(err)
            return;
        }
        $('table[bid="dtable"] tbody').html("")

        if (result.rowsAffected == 0) {
            $('table[bid="dtable"] tbody').append('<td colspan="6">No BOM in system.</td>');
        } else {
            for (var i in result.recordset) {
                var data = result.recordset[i];
                var tr = $("<tr>").attr("sn", data.sn).attr("top", data.bomtop);
                tr.append($("<td>").text(data.sn));
                tr.append($("<td>").text(data.bomtop));
                tr.append($("<td>").text(codesInfo[data.bomtop].name + " | " + codesInfo[data.bomtop].spec));
                tr.append($("<td>").text(data.opname));
                tr.append($("<td>").text(moment(data.date).utc().format("YYYY-MM-DD HH:mm:ss")));
                tr.append($("<td>").append($("<span class='iconfont icon-shanchu' bid='delete' sn=" + data.sn + ">")));
                $('table[bid="dtable"] tbody').append(tr);
            }
        }

        $('table[bid="dtable"] tbody span.iconfont').css("cursor", "pointer").click(function () {
            var code = $(this).parents("tr").attr("top").trim();
            var sn = $(this).parents("tr").attr("sn").trim();
            if (!confirm("Do you really want to detail bom of " + code + "?")) return false;
            sqltxt = "delete from st_goodsbom where mark = " + sn + "; delete from st_bomtop where goodsid = '" + code + "'; delete from st_picklists where code = '" + code + "'; delete from st_goodsbom_stat where sn = " + sn + ";";
            new sql.Request().query(sqltxt, (err, result) => {
                if (err) {
                    alert("Error happened: \n" + JSON.stringify(err));
                    console.error(err)
                    return;
                }
                loadPanel("dashboard");
            });
        })
    });
})