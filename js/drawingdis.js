$(function () {
    if (drawingCode == 0) {
        alert("No drawing specified");
    }
    var dtype = [
        "2D PDF drawings(.pdf)",
        "2D Solidworks drawings(.slddrw)",
        "3D eDrawings drawings(.igs, .easm, .eprt)",
        "3D Solidworks drawings(.sldasm, .sldprt)"
    ];
    new sql.Request().query("select a.*,b.opname from st_drawings as a inner join m_operator as b on a.opid = b.opid where code = '" + drawingCode + "' order by version desc, filetype asc;", (err, result) => {
        if (err) {
            console.error(err);
            alert("An error occur when fetching drawing information.\n" + JSON.stringify(err));
            return;
        }
        //drawingCode = 0;

        // downloadDrawing(drawingCode, false, false, function (fillpath) {
        //     const path = require('path');
        //     var fp = path.normalize(filepath);
        //     console.log(fp);
        //     //$("div.card-body:first").append('<webview src="' + fp + '" style="width:400px;height:300px" plugins></webview>')
        // })

        var v = false;
        var code = result.recordset[0].code;
        var div = $("<div>").addClass("card-body");
        var tables = [];
        var table = $("<table>").addClass("treetable").append($("<thead>").append($("<th>").text("Drawing Type").css("min-width", "300px")).append($("<th>").text("File Name").css("min-width", "300px")).append($("<th>").text("Update date").css("min-width", "150px")).append($("<th>").text("Owner")).append($("<th>").text("Open"))).append($("<tbody>"));
        var tmptable;
        for (var i in result.recordset) {
            if (v !== result.recordset[i].version) {
                if (v !== false) tables.push(tmptable);
                tmptable = table.clone();
                console.log(tables)
                v = result.recordset[i].version;
                tmptable.attr("version", v);
            }
            var tr = $("<tr>").append($("<td>").text(dtype[result.recordset[i].filetype])).append($("<td>").text(result.recordset[i].filename)).append($("<td>").text(moment(result.recordset[i].date).utc().format("YYYY-MM-DD HH:mm:ss"))).append($("<td>").text(result.recordset[i].opname)).append($("<td>").html("<span class='iconfont icon-open' bid='dopen' code='" + result.recordset[i].code + "' version='" + result.recordset[i].version + "'></span>"));
            tmptable.find("tbody").append(tr);
        }
        tables.push(tmptable);

        var pdiv = $("div[bid=drawings]").html("");
        for (var m in tables) {
            pdiv.append(div.clone().append("<h5> Drawings of <b>" + code + "</b> Version <b>" + tables[m].attr("version") + "</b></h5>").append(tables[m]));
        }

        pdiv.find("span[bid=dopen]").css("cursor", "pointer").click(function () {
            var code = $(this).attr("code");
            var version = $(this).attr("version");
            var btn = $(this);
            btn.hide();
            displayDrawing(code, version, function () {
                btn.show();
            });
        });
    });
})