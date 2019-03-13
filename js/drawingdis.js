$(function () {
    if (drawingCode == 0) {
        alert("No drawing specified");
    }

    var bCreateNewVersion = true;
    var maxVersion = 0;

    executeMsSql("select a.*,b.opname from st_drawings as a inner join m_operator as b on a.opid = b.opid where code = '" + drawingCode + "' order by a.version desc, a.filetype asc;", (err, result) => {
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
        var table = $("<table>").addClass("treetable").append($("<thead>").append($("<th>").text("Drawing Type").css("min-width", "300px")).append($("<th>").text("File Name").css("min-width", "300px")).append($("<th>").text("Update date").css("min-width", "150px")).append($("<th>").text("Owner")).append($("<th>").text("Action").css("min-width", "60px"))).append($("<tbody>"));
        var tmptable;
        for (var i in result.recordset) {
            if (result.recordset[i].stat == 0) bCreateNewVersion = false;
            if (v !== result.recordset[i].version) {
                maxVersion = Math.max(maxVersion, result.recordset[i].version);
                if (v !== false) {
                    var tmp_tr = tmptable.find("tbody tr:first");
                    if (parseInt(tmp_tr.attr("stat")) == 0 && parseInt(tmp_tr.attr("opid")) == user.id) tables.push(tmptable);
                    if (parseInt(tmp_tr.attr("stat")) == 1) tables.push(tmptable);
                }
                tmptable = table.clone();
                v = result.recordset[i].version;
                tmptable.attr("version", v);
            }
            var tr = $("<tr>").append($("<td>").text(drawingType[result.recordset[i].filetype].name)).append($("<td>").text(result.recordset[i].filename)).append($("<td>").text(moment(result.recordset[i].date).utc().format("YYYY-MM-DD HH:mm:ss"))).append($("<td>").text(result.recordset[i].opname));
            tr.attr("sn", result.recordset[i].sn).attr("stat", result.recordset[i].stat).attr("opid", result.recordset[i].opid);
            if (result.recordset[i].stat == 0) {
                if (result.recordset[i].opid == user.id) tr.append($("<td>").html("<span class='iconfont icon-shanchu' bid='ddel' code='" + result.recordset[i].code + "' version='" + result.recordset[i].version + "'></span> <span class='iconfont icon-open' bid='dopen' code='" + result.recordset[i].code + "' version='" + result.recordset[i].version + "' filetype='" + result.recordset[i].filetype + "'></span>"))
                else tr.append($("<td>").html("Being modified"));
            } else if (result.recordset[i].stat == 1) {
                tr.append($("<td>").html("<span class='iconfont icon-open' bid='dopen' code='" + result.recordset[i].code + "' version='" + result.recordset[i].version + "' filetype='" + result.recordset[i].filetype + "'></span>"))
            }
            tmptable.find("tbody").append(tr);
        }
        tables.push(tmptable);

        var pdiv = $("div[bid=drawings]").html("");

        if (bCreateNewVersion) {
            maxVersion++;
            pdiv.append(div.clone().append("<button class='btn btn-primary' version='" + maxVersion + "' code='" + drawingCode + "' bid='newVersion'>Create Version " + maxVersion + "</button>"));
        }

        for (var m in tables) {
            pdiv.append(div.clone().append("<h5> Drawings of <b>" + code + "</b> Version <b>" + tables[m].attr("version") + "</b></h5>").append(tables[m]));
        }

        pdiv.find("span[bid=dopen]").css("cursor", "pointer").click(function () {
            var code = $(this).attr("code");
            var version = $(this).attr("version");
            var filetype = $(this).attr("filetype");
            var btn = $(this);
            btn.hide();
            displayDrawing(code, version, function (rtn) {
                if (!rtn.err) btn.show();
                else alert(rtn.err)
            }, parseInt(filetype));
        });
    });
})