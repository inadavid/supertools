
$(function () {
    if (drawingSN == 0) {
        alert("No drawing specified");
    }
    var dtype = [
        "2D PDF drawings(.pdf)",
        "2D Solidworks drawings(.slddrw)",
        "3D eDrawings drawings(.igs, .easm, .eprt)",
        "3D Solidworks drawings(.sldasm, .sldprt)"
    ];
    new sql.Request().query("select a.*,b.opname from st_drawings as a inner join m_operator as b on a.opid = b.opid where code = (select code from st_drawings where sn = " + drawingSN + ") order by version desc, filetype asc;", (err, result) => {
        if (err) {
            console.error(err);
            alert("An error occur when fetching drawing information.\n" + JSON.stringify(err));
            return;
        }
        console.log(result);
        var v = false;
        var code = result.recordset[0].code;
        var div = $("<div>").addClass("card-body");
        var tables = [];
        var table = $("<table>").addClass("treetable").append($("<thead>").append($("<th>").text("File Name").css("min-width", "300px")).append($("<th>").text("Drawing Type").css("min-width", "300px")).append($("<th>").text("Owner")).append($("<th>").text("Open"))).append($("<tbody>"));
        var tmptable;
        for (var i in result.recordset) {
            if (v != result.recordset[i].version) {
                if (v !== false) tables.push(tmptable);
                tmptable = table.clone();
                v = result.recordset[i].version;
                tmptable.attr("version", v);
            }
            var tr = $("<tr>").append($("<td>").text(result.recordset[i].filename)).append($("<td>").text(dtype[result.recordset[i].filetype])).append($("<td>").text(result.recordset[i].opname)).append($("<td>").html("<span class='iconfont icon-open' bid='dopen' dsn='" + result.recordset[i].sn + "'></span>"));
            tmptable.find("tbody").append(tr);
        }
        tables.push(tmptable);

        var pdiv = $("div[bid=drawings]").html("");
        for (var m in tables) {
            pdiv.append(div.clone().append("<h5> Drawings of <b>" + code + "</b> Version <b>" + tables[m].attr("version") + "</b></h5>").append(tables[m]));
        }

        pdiv.find("span[bid=dopen]").css("cursor", "pointer").click(function () {
            dsn = parseInt($(this).attr("dsn"));
            displayDrawing(dsn);
        });
    });
})
