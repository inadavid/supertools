var allcodesHint = [];
var displayBOM = [];

$(function () {
    $("head").append("<link rel='stylesheet' id='extracss' href='../css/awesomplete.css' type='text/css' />");
    $("head").append("<link rel='stylesheet' id='extracss' href='../css/jquery.treetable.theme.default.css' type='text/css' />");
    for (var m in codesInfo) {
        allcodesHint.push({
            label: m + " | " + codesInfo[m].name + " | " + codesInfo[m].spec,
            value: m
        })
    }
})

$("input[bid=bomtop]").on("keypress", function () {
    var val = $(this).val();
    var spec = $("span[bid=codespec]")
    spec.css("margin-left", "50px").css("margin-right", "50px")
    if (codesList.indexOf(val) == -1) {
        spec.text("");
        return;
    } else {
        spec.text(codesInfo[val].name + " | " + codesInfo[val].spec);
        searchBOM(val);
    }

}).css("display", "inline-block").css("width", "200px")
// var as1 = new Awesomplete("input[bid='bomtop']", {
//     minChars: 4,
//     maxItems: 10
// });
// as1.list = codesList;
function reOrderBOM(dbom, top, level = 0) { // rearrange order of BOM for display
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
        .append("<th style='width:10px'>Level</th>")
        .append("<th style='width:10px'>I</th>")
        .append("<th style='width:30px'>Code#</th>")
        .append("<th style='width:10px'>Qty</th>")
        .append("<th style='width:20px'>Unit</th>")
        .append("<th style='width:10px'>PType</th>")
        .append("<th style='width:150px'>Name</th>")
        .append("<th>Desc</th>")
        .append("<th style='width:20px'>PFEP</th>")
    table.append(thead);
    var tbody = $("<tbody>");
    for (var i in dbom) {
        var tr = $("<tr type='bomitem' data-tt-id='" + dbom[i].Code + "' data-tt-parent-id='" + dbom[i].Parent + "'>")
        tr
            .append("<td>" + dbom[i].Level + "</td>")
            .append("<td>" + dbom[i].Order + "</td>")
            .append("<td><input value='" + dbom[i].Code + "' readonly></td>")
            .append("<td>" + dbom[i].Qty + "</td>")
            .append("<td>" + dbom[i].Unit + "</td>")
            .append("<td>" + dbom[i].ProchasingType + "</td>")
            .append("<td>" + dbom[i].Name + "</td>")
            .append("<td>" + dbom[i].Spec + "</td>")
            .append("<td>" + dbom[i].PFEP + "</td>");
        tbody.append(tr);
    }
    table.append(tbody);

    $("div[bid=bomtable]").html("<h5>BOM Tree View</h5>").append(table);
    $("div[bid=bomtable] table").treetable({
        clickableNodeNames: true,
        expandable: true,
        initialState: "expanded"
    });

}

function searchBOM(code) {
    if (code.length != 10) return false;
    sqltext = "WITH CTE AS (SELECT b.*,lvl=0 FROM dbo.st_goodsbom as b WHERE goodsid='" + code + "' UNION ALL SELECT b.*, lvl+1 FROM dbo.st_goodsbom as b INNER JOIN CTE as c ON b.goodsid=c.elemgid) SELECT * FROM CTE order by lvl asc, itemno asc;";
    var tmpList;
    new sql.Request().query(sqltext, (err, result) => {
        // ... error checks

        if (result.rowsAffected == 0) {
            popup("This material has no sub-BOM.", "danger");
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
                    PFEP: result.recordset[i].pfep
                })
            }
            displayBOM = reOrderBOM(displayBOM, code);
        }
        showBOM(displayBOM);
    })
}