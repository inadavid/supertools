var allcodesHint = [];
var displayBOM = [];

$(function () {
    if ($("head").has("link[name=awesomeplete]").length < 1) $("head").append("<link rel='stylesheet' name='awesomeplete' href='../css/awesomplete.css' type='text/css' />");
    if ($("head").has("link[name=treeable]").length < 1) $("head").append("<link rel='stylesheet' name='treeable' href='../css/jquery.treetable.theme.default.css' type='text/css' />");

    var sqltext = "select goodsid from st_bomtop;";
    new sql.Request().query(sqltext, (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        allcodesHint = [];
        for (var m in result.recordset) {
            allcodesHint.push({
                label: result.recordset[m].goodsid + " | " + codesInfo[result.recordset[m].goodsid].name + " | " + codesInfo[result.recordset[m].goodsid].spec,
                value: result.recordset[m].goodsid
            })
        }
        new Awesomplete("input[bid=bomtop]", {
            list: allcodesHint,
            minChars: 4,
            maxItems: 15,
        });
    });

})

$("input[bid=bomtop]").on("keypress", function (event) {
    if (event.which == 13) $("button[bid=bomSearch]").trigger("click");

}).css("display", "inline-block").css("width", "200px")

$("button[bid=bomSearch]").on("click", function () {
    var val = $("input[bid=bomtop]").val();
    var spec = $("span[bid=codespec]")
    spec.css("margin-left", "50px").css("margin-right", "50px")
    if (codesList.indexOf(val) == -1) {
        spec.text("");
        return;
    } else {
        spec.text(codesInfo[val].name + " | " + codesInfo[val].spec);
        searchBOM(val);
    }
})

function reOrderBOM(dbom, top, level = 1) { // rearrange order of BOM for display
    var tmpArr = [];
    for (var i in dbom) {
        if (dbom[i].Parent == top && dbom[i].Level == level) tmpArr.push(dbom[i]);
    }
    if (tmpArr.length == 0) return false;
    tmpArr = _.sortBy(tmpArr, "Order");
    var rtnArr = [];
    for (var m in tmpArr) {
        rtnArr.push(tmpArr[m]);
        var subArr = reOrderBOM(dbom, tmpArr[m].Code, tmpArr[m].Level + 1);
        if (subArr) {
            for (var n in subArr) rtnArr.push(subArr[n]);
        }
    }
    return rtnArr;
}

function showBOM(dbom) {
    if (dbom.length == 0) return;
    var table = $("<table>");
    var thead = $("<thead>");
    thead
        .append("<th width='100%'>Level</th>")
        .append("<th style='width:10px'>SN</th>")
        .append("<th style='width:10px'>Order</th>")
        .append("<th style='width:30px'>Code#</th>")
        .append("<th style='width:10px'>Qty</th>")
        .append("<th style='width:20px'>Unit</th>")
        .append("<th style='width:10px'>PType</th>")
        .append("<th style='width:150px'>Name</th>")
        .append("<th style='width:150px'>Desc</th>")
        .append("<th style='width:20px'>PFEP</th>")
    table.append(thead);
    var tbody = $("<tbody>");
    var count = 1;
    for (var i in dbom) {
        var tr = $("<tr type='bomitem' data-tt-id='" + dbom[i].Code + "' data-tt-parent-id='" + dbom[i].Parent + "'>")
        tr
            .append("<td>" + dbom[i].Level + "</td>")
            .append("<td did='SN'>" + (count++) + "</td>")
            .append("<td did='Order'>" + dbom[i].Order + "</td>")
            .append("<td><input did='Code' value='" + dbom[i].Code + "' readonly></td>")
            .append("<td><input did='Qty' value='" + dbom[i].Qty + "' readonly></td>")
            .append("<td>" + dbom[i].Unit + "</td>")
            .append("<td>" + dbom[i].ProchasingType + "</td>")
            .append("<td><input did='Name' value='" + dbom[i].Name + "' readonly></td>")
            .append("<td><input did='Spec' value='" + dbom[i].Spec + "' readonly></td>")
            .append("<td><input did='PFEP' value='" + dbom[i].PFEP + "' readonly></td>");
        tbody.append(tr);
    }
    table.append(tbody);

    $("div[bid=bomtable]").html("<h5><strong>" + $("input[bid=bomtop]").val() + "</strong> BOM Tree View &nbsp; &nbsp; &nbsp;<button class='btn btn-form btn-primary btn-sm' bid='expandAll'>Expand All</button> <button class='btn btn-form btn-success btn-sm' bid='collapseAll'>Collapse All</button> <button class='btn btn-form btn-warning btn-sm' bid='exportBOM'>Export BOM</button></h5>").append(table);

    $("div[bid=bomtable] table").treetable({
        expandable: true,
        indent: 15,
        clickableNodeNames: false,
        expanderTemplate: '<div></div>',
        initialState: "collapsed" //Possible values: "expanded" or "collapsed".
    });

    $("div[bid=bomtable] table tbody tr td input").each(function () {
        $(this).attr("title", $(this).val());
    });

    $("div[bid=bomtable] table tbody tr").on("click", function () {
        if ($(this).hasClass("selected")) $(this).removeClass("selected");
        else {
            $("div[bid=bomtable] table tbody tr").removeClass("selected");
            $(this).addClass("selected");
        }
    });
    $("td[did=Order],td[did=SN]").on("dblclick", function () {
        var code = $(this).parent("tr").find("input[did='Code']").val();
        $("input[bid=bomtop]").val(code);
        $("button[bid=bomSearch]").trigger("click");
    });

    $("table.treetable tbody tr td:first-child").on("dblclick", function () {
        $(this).find("div").trigger("click");
    });
    $("button[bid=expandAll]").click(function () {
        $("div[bid=bomtable] table").treetable("expandAll");
    });
    $("button[bid=collapseAll]").click(function () {
        $("div[bid=bomtable] table").treetable("collapseAll");
    });
    $("button[bid=exportBOM]").click(function () {
        var iconv = require('iconv-lite');
        var cloneArr = JSON.parse(JSON.stringify(dbom));
        for (var i in cloneArr) {
            delete cloneArr[i].Parent;
        }
        var path = require('path');
        var toLocalPath = path.resolve(app.getPath("documents"));
        var filepath = dialog.showSaveDialog({
            defaultPath: toLocalPath,
            title: 'Save exported BOM',
            filters: [{
                name: 'CSV (Open via Excel)',
                extensions: ['csv']
            }]
        });
        if (filepath !== undefined) {
            var msExcelBuffer = Buffer.concat([
                new Buffer('\xEF\xBB\xBF', 'binary'),
                new Buffer(data2csv(cloneArr))
            ]);
            fs.writeFile(filepath, msExcelBuffer, function (err) {
                if (!err) popup("CVS file exported successfully!", "success");
                else popup(err, "danger");
            });

        }
    });

    $("table.treetable tbody tr").on("mousedown", function (e) {
        if (e.button == 2) {
            var codetr = $(this);
            var codeinput = codetr.find("input[did=Code]");
            clipboard.writeText(codeinput.val().trim());
            codetr.addClass("bgcolor_highlight");
            setTimeout(function () {
                codetr.removeClass("bgcolor_highlight");
            }, 500)
            return false;
        }
        return true;
    });

}

function searchBOM(code) {
    if (code.length != 10) return false;
    $("div[bid=bomtable]").html("<h5>Searching BOM, please wait...</h5>");
    sqltext = "WITH CTE AS (SELECT b.*,lvl=0 FROM dbo.st_goodsbom as b WHERE goodsid='" + code + "' UNION ALL SELECT b.*, lvl+1 FROM dbo.st_goodsbom as b INNER JOIN CTE as c ON b.goodsid=c.elemgid) SELECT * FROM CTE order by lvl asc, itemno asc;";
    new sql.Request().query(sqltext, (err, result) => {
        // ... error checks

        if (result.rowsAffected == 0) {
            popup("This material has no sub-BOM.", "danger");
            displayBOM = [];
        } else {
            for (var i in result.recordset) {
                displayBOM.push({
                    Level: result.recordset[i].lvl + 1,
                    Order: result.recordset[i].itemno,
                    Code: result.recordset[i].elemgid,
                    Parent: result.recordset[i].goodsid,
                    Name: codesInfo[result.recordset[i].elemgid].name,
                    Qty: result.recordset[i].quantity,
                    Unit: codesInfo[result.recordset[i].elemgid].unit,
                    Spec: codesInfo[result.recordset[i].elemgid].spec,
                    ProchasingType: result.recordset[i].ptype,
                    PFEP: result.recordset[i].pfep
                })
            }
            displayBOM = reOrderBOM(displayBOM, code);
        }
        showBOM(displayBOM);
    })
}