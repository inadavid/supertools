var allcodesHint = [];
var displayBOM = [];

$(function () {
    if ($("head").has("link[name=awesomeplete]").length < 1) $("head").append("<link rel='stylesheet' name='awesomeplete' href='../css/awesomplete.css' type='text/css' />");
    //if ($("head").has("link[name=treeable]").length < 1) $("head").append("<link rel='stylesheet' name='treeable' href='../css/jquery.treetable.theme.default.css' type='text/css' />");

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


    $(document).on("mousedown", "table.treetable tbody tr", function (e) {
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
})

$("input[bid=bomtop]").on("keypress", function (event) {
    if (event.which == 13) $("button[bid=bomSearch]").trigger("click");

})

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
        searchParent(val);
        searchFG(val);
    }
})

function reOrderBOM(dbom, top) { // rearrange order of BOM for display
    var tmpArr = [];
    for (var i in dbom) {
        if (dbom[i].pid == top) tmpArr.push(dbom[i]);
    }
    if (tmpArr.length == 0) return false;
    tmpArr = _.sortBy(tmpArr, "Order");
    var rtnArr = [];
    for (var m in tmpArr) {
        rtnArr.push(tmpArr[m]);
        var subArr = reOrderBOM(dbom, tmpArr[m].pid + "." + tmpArr[m].Code);
        if (subArr) {
            for (var n in subArr) rtnArr.push(subArr[n]);
        }
    }
    return rtnArr;
}

function showBOM(dbom) {
    if (dbom.length == 0) return;
    var plist = [];
    for (var i in dbom) {
        if (plist.indexOf(dbom[i].Parent) == -1) plist.push(dbom[i].Parent);
    }
    var table = $("<table>");
    table.addClass("treetable")
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
        var tr = $("<tr type='bomitem' data-tt-id='" + dbom[i].pid + "." + dbom[i].Code + "' data-tt-parent-id='" + dbom[i].pid + "' class='" + (plist.indexOf(dbom[i].Code) == -1 ? "" : "branch") + "'>")
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

    $("div[bid=bomcard]").html("<h5><strong>" + $("input[bid=bomtop]").val() + "</strong> BOM Tree View &nbsp; &nbsp; &nbsp; <button class='btn btn-form btn-warning btn-sm' bid='exportBOM'>Export BOM</button> <button class='btn btn-form btn-primary btn-sm' bid='exportPL'>Export Picklist</button></h5>").append(table);

    var jstt = com_github_culmat_jsTreeTable;
    // $("div[bid=bomcard] table").treetable({
    //     expandable: true,
    //     indent: 5,
    //     clickableNodeNames: false,
    //     expanderTemplate: '<span></span>',
    //     initialState: "collapsed" //Possible values: "expanded" or "collapsed".
    // });

    jstt.treeTable($('div[bid=bomcard] table'))
    $("div[bid=bomcard] table tbody tr td input").each(function () {
        $(this).attr("title", $(this).val());
    });

    $("td[did=Order],td[did=SN]").on("dblclick", function () {
        var code = $(this).parent("tr").find("input[did='Code']").val();
        $("input[bid=bomtop]").val(code);
        $("button[bid=bomSearch]").trigger("click");
    });

    $("button[bid=exportBOM]").click(function () {
        var cloneArr = JSON.parse(JSON.stringify(dbom));
        var rdata = [];
        var count = 1;
        for (var i in cloneArr) {
            var obj = {};
            obj.SN = count++;
            obj.Level = cloneArr[i].Level;
            obj.Order = cloneArr[i].Order;
            obj.Code = cloneArr[i].Code;
            obj.Qty = cloneArr[i].Qty;
            obj.Unit = cloneArr[i].Unit;
            obj.PT = cloneArr[i].ProchasingType;
            obj.Name = cloneArr[i].Name;
            obj.Spec = cloneArr[i].Spec;
            obj.PFEP = cloneArr[i].PFEP;
            rdata.push(obj);
        }
        var path = require('path');
        var toLocalPath = path.resolve(app.getPath("documents"));
        var filepath = dialog.showSaveDialog({
            defaultPath: toLocalPath,
            title: 'Save exported BOM for ' + $("input[bid=bomtop]").val(),
            filters: [{
                name: 'CSV (Comma-Separated Values) for Excel',
                extensions: ['csv']
            }]
        });
        if (filepath !== undefined) {
            savedata(filepath, rdata, true);
        }
    });

    $("button[bid=exportPL]").click(function () {
        var cloneArr = JSON.parse(JSON.stringify(dbom));
        var rdata = [];
        var count = 1;
        for (var i in cloneArr) {
            if (cloneArr[i].ProchasingType != "B" && cloneArr[i].ProchasingType != "b") continue;
            if (cloneArr[i].rQty == 0) continue;
            var oobj = _.find(rdata, function (obj) {
                return obj.Code == cloneArr[i].Code;
            })
            if (oobj == undefined) {
                var nobj = {};
                nobj.SN = count++;
                nobj.Code = cloneArr[i].Code;
                nobj.Qty = cloneArr[i].rQty;
                nobj.Unit = cloneArr[i].Unit;
                nobj.Name = cloneArr[i].Name;
                nobj.Spec = cloneArr[i].Spec;
                rdata.push(nobj);
            } else {
                oobj.Qty += cloneArr[i].rQty;
            }
        }
        var path = require('path');
        var toLocalPath = path.resolve(app.getPath("documents"));
        var filepath = dialog.showSaveDialog({
            defaultPath: toLocalPath,
            title: 'Save exported Picklist for ' + $("input[bid=bomtop]").val(),
            filters: [{
                name: 'CSV (Comma-Separated Values) for Excel',
                extensions: ['csv']
            }]
        });
        if (filepath !== undefined) {
            savedata(filepath, rdata, true);
        }
    });


}

function searchBOM(code) {
    if (code.length != 10) return false;
    displayBOM = [];
    $("div[bid=bomcard]").html("<h5>Searching BOM, please wait...</h5>");
    sqltext = "WITH CTE AS (SELECT b.*,cast('" + code + "' as varchar(2000)) as pid , lvl=1, convert(FLOAT, b.quantity) as rQty FROM dbo.st_goodsbom as b WHERE goodsid='" + code + "' UNION ALL SELECT b.*, cast(c.pid+'.'+b.goodsid as varchar(2000)) as pid, lvl+1, CONVERT(FLOAT, c.quantity*b.quantity) as rQty FROM dbo.st_goodsbom as b INNER JOIN CTE as c ON b.goodsid=c.elemgid) SELECT * FROM CTE;";
    new sql.Request().query(sqltext, (err, result) => {
        // ... error checks

        if (result.rowsAffected == 0) {
            $("div[bid=bomcard]").html("<h5><strong>" + $("input[bid=bomtop]").val() + "</strong> has no sub/children BOM</h5>");
            displayBOM = [];
        } else {
            for (var i in result.recordset) {
                displayBOM.push({
                    Level: result.recordset[i].lvl,
                    Order: result.recordset[i].itemno,
                    Code: result.recordset[i].elemgid,
                    Parent: result.recordset[i].goodsid,
                    Name: codesInfo[result.recordset[i].elemgid].name,
                    Qty: result.recordset[i].quantity,
                    Unit: codesInfo[result.recordset[i].elemgid].unit,
                    Spec: codesInfo[result.recordset[i].elemgid].spec,
                    ProchasingType: result.recordset[i].ptype,
                    PFEP: result.recordset[i].pfep,
                    pid: result.recordset[i].pid,
                    rQty: result.recordset[i].rQty
                });
            }
            displayBOM = reOrderBOM(displayBOM, code);
        }
        showBOM(displayBOM);
    })
}

function searchParent(code) {
    var sqltxt = "select goodsid from st_goodsbom where elemgid='" + code + "' group by goodsid";
    var parentsList = [];
    $("div[bid=parentcard]").html("<h5>Searching parents, please wait...</h5>")
    new sql.Request().query(sqltxt, (err, result) => {
        // ... error checks

        if (result.rowsAffected == 0) {
            $("div[bid=parentcard]").html("<h5><strong>" + $("input[bid=bomtop]").val() + "</strong> has no parents</h5>");
        } else {
            var count = 1;
            for (var i in result.recordset) {
                parentsList.push({
                    SN: count++,
                    Parent: result.recordset[i].goodsid,
                    Name: codesInfo[result.recordset[i].goodsid].name,
                    Unit: codesInfo[result.recordset[i].goodsid].unit,
                    Spec: codesInfo[result.recordset[i].goodsid].spec
                })
            }

            //data ready, now do table
            var table = $("<table>");
            table.addClass("treetable")
            var thead = $("<thead>");
            thead
                .append("<th style='width:10px'>SN</th>")
                .append("<th style='width:30px'>Code#</th>")
                .append("<th style='width:150px'>Name</th>")
                .append("<th style='width:150px'>Desc</th>")
                .append("<th style='width:20px'>Unit</th>")
            table.append(thead);
            var tbody = $("<tbody>");
            for (var i in parentsList) {
                var tr = $("<tr type='parentitem'>")
                tr
                    .append("<td did='SN'>" + parentsList[i].SN + "</td>")
                    .append("<td><input did='Code' value='" + parentsList[i].Parent + "' readonly></td>")
                    .append("<td><input did='Name' value='" + parentsList[i].Name + "' readonly></td>")
                    .append("<td><input did='Spec' value='" + parentsList[i].Spec + "' readonly></td>")
                    .append("<td>" + parentsList[i].Unit + "</td>");
                tbody.append(tr);
            }
            table.append(tbody);

            $("div[bid=parentcard]").html("<h5><strong>" + $("input[bid=bomtop]").val() + "</strong> Parent(s) list</h5>").append(table);
        }

    })
}

function searchFG(code) {
    $("div[bid=fgcard]").html("<h5>Searching applied Finish Goods, please wait...</h5>");
    var fglist = [];
    var sqltxt = "WITH CTE AS (SELECT b.*,cast('" + code + "' as varchar(2000)) as pid , lvl=1 FROM dbo.st_goodsbom as b WHERE elemgid='" + code + "' UNION ALL SELECT b.*, cast(c.pid+'.'+b.goodsid as varchar(2000)) as pid, lvl+1 FROM dbo.st_goodsbom as b INNER JOIN CTE as c ON c.goodsid=b.elemgid) SELECT e.goodsid FROM CTE as e inner join st_bomtop as d on d.goodsid=e.goodsid group by e.goodsid;";
    new sql.Request().query(sqltxt, (err, result) => {
        // ... error checks

        if (result.rowsAffected == 0) {
            $("div[bid=fgcard]").html("<h5><strong>" + $("input[bid=bomtop]").val() + "</strong> has no applied Finish Good</h5>");
        } else {
            var count = 1;
            for (var i in result.recordset) {
                fglist.push({
                    SN: count++,
                    Parent: result.recordset[i].goodsid,
                    Name: codesInfo[result.recordset[i].goodsid].name,
                    Spec: codesInfo[result.recordset[i].goodsid].spec
                })
            }

            //data ready, now do table
            var table = $("<table>");
            table.addClass("treetable")
            var thead = $("<thead>");
            thead
                .append("<th style='width:10px'>SN</th>")
                .append("<th style='width:30px'>Code#</th>")
                .append("<th style='width:150px'>Name</th>")
                .append("<th style='width:150px'>Desc</th>")
            table.append(thead);
            var tbody = $("<tbody>");
            for (var i in fglist) {
                var tr = $("<tr type='parentitem'>")
                tr
                    .append("<td did='SN'>" + fglist[i].SN + "</td>")
                    .append("<td><input did='Code' value='" + fglist[i].Parent + "' readonly></td>")
                    .append("<td><input did='Name' value='" + fglist[i].Name + "' readonly></td>")
                    .append("<td><input did='Spec' value='" + fglist[i].Spec + "' readonly></td>")
                tbody.append(tr);
            }
            table.append(tbody);

            $("div[bid=fgcard]").html("<h5><strong>" + $("input[bid=bomtop]").val() + "</strong> applied Finish Goods list</h5>").append(table);
        }

    })
}