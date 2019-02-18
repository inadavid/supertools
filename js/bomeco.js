var ECOList = [];
var ECOchanged = false;
var today = moment().format("YYYY-MM-DD");
$(function () {
    if ($("head").has("link[name=iconfont]").length < 1) $("head").append("<link rel='stylesheet' name='iconfont' href='../css/iconfont.css' type='text/css' />");
})

$("input[bid=ecoparent]").on("keypress", function (event) {
    if (event.which == 13) $("button[bid=parentSearch]").trigger("click");
})

$("button[bid=parentSearch]").on("click", function () {
    var parent = $("input[bid=ecoparent]").val();
    if (codesList.indexOf(parent) == -1) {
        popup("The parent code does not exist!", "danger");
        return;
    } else {
        searchChildren(parent);
    }
})

function searchChildren(code) {
    var tableArea = $('div[bid="ecoBody"]');
    tableArea.html("<h5>Searching children of <b>" + code + "</b></h5>")

    var table = $("<table>");
    table.addClass("treetable")
    var thead = $("<thead>");
    thead
        .append("<th style='width:10px'>Order</th>")
        .append("<th style='width:30px'>Code#</th>")
        .append("<th style='width:10px'>Qty</th>")
        .append("<th style='width:20px'>Unit</th>")
        .append("<th style='width:10px'>PType</th>")
        .append("<th style='width:200px'>Name</th>")
        .append("<th style='width:200px'>Spec</th>")
        .append("<th style='width:100px'>Stat</th>")
        .append("<th>Action</th>")
    table.append(thead);
    var tbody = $("<tbody>");

    var selectTD = $("<td>");
    var selectCT = $("<select did='ptype'>");
    for (var i in ptypeList) {
        var opt = $("<option>").val(i).text(i);
        selectCT.append(opt);
    }
    selectTD.append(selectCT);
    var button_delete = $("<span class='iconfont icon-shanchu' bid='delete'>");
    var button_cancel = $("<span class='iconfont icon-cancel' bid='cancel'>");
    var button_confirm = $("<span class='iconfont icon-wancheng' bid='confirm'>");

    var sqltext = "select * from st_goodsbom where goodsid='" + code + "' and startDate<='" + today + "' and endDate>='" + today + "' order by itemno asc;";
    new sql.Request().query(sqltext, (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        for (var m in result.recordset) {
            var tr = $("<tr type='ecoitem' bomsn='" + result.recordset[m].sn + "'>");
            tr
                .append("<td did='Order'>" + result.recordset[m].itemno + "</td>")
                .append("<td><input did='Code' value='" + result.recordset[m].elemgid + "' readonly></td>")
                .append("<td><input did='Qty' value='" + result.recordset[m].quantity + "' readonly></td>")
                .append("<td>" + codesInfo[result.recordset[m].elemgid].unit + "</td>")
                .append("<td><input did='Ptype' value='" + result.recordset[m].ptype + "' readonly></td>")
                .append("<td><input did='Name' value='" + codesInfo[result.recordset[m].elemgid].name + "' readonly></td>")
                .append("<td><input did='Spec' value='" + codesInfo[result.recordset[m].elemgid].spec + "' readonly></td>")
                .append("<td bid='status'>No Change</td>")
                .append("<td bid='action'>   </td>");
            tbody.append(tr);
        }
        var tr = $("<tr type='newitem' class='addaction'>");
        tr
            .append("<td did='Order'><input did='Order'></td>")
            .append("<td><input did='Code'></td>")
            .append("<td><input did='Qty'></td>")
            .append("<td did='Unit'></td>")
            .append(selectTD.clone())
            .append("<td><input did='Name' readonly></td>")
            .append("<td><input did='Spec' readonly></td>")
            .append("<td bid='status'> Addition </td>")
            .append("<td bid='action'>   </td>");
        tbody.append(tr);
        table.append(tbody);
        table.find("tr[type=ecoitem]").each(function () {
            $(this).find("td:last-child").append(button_delete.clone());
        })
        table.find("tr[type=newitem]").each(function () {
            $(this).find("td:last-child").append(button_confirm.clone());
        })
        tableArea.html("<h5><b>" + code + "</b> children list for ECO </h5>").append(table);

        //make area for condition
        var div = $("<div bid='hr'>");
        var datePicker = $('<input type="date" max="2098-12-31" class="form-control form-inline">');
        var dateLabel = $('<span class="form-inline-label"></span>');
        var today = moment().format("YYYY-MM-DD");
        var tomorrow = moment().add(1, 'days').format("YYYY-MM-DD");
        var comments = $('<input type="text" name="comments" class="form-control">');
        var conditionDiv = div.clone().append(dateLabel.clone().text("BOM Applied Date: ")).append(datePicker.clone().attr("min", today).attr("value", tomorrow).attr("name", "bomAppliedDate")).append(dateLabel.clone().text("  | Picklist Applied Date: ")).append(datePicker.clone().attr("min", today).attr("value", tomorrow).attr("name", "picklistAppliedDate"));
        var commentDiv = div.clone().append(dateLabel.clone().text("ECO Comment:")).append(comments.clone());
        tableArea.append(conditionDiv).append(commentDiv);

        tableArea.on("click", "table tbody tr td[bid=action] span[bid=delete]", function () {
            var tr = $(this).parents("tr");
            var curCode = tr.find("input[did=Code]").val().trim();
            if (!confirm("Are you sure to mark item " + curCode + " for deletion?")) return;

            if (tr.attr("bomsn") == "null") {
                var obj = _.find(ECOList, function (obj) {
                    return (obj.action == "addition" && obj.data.code == curCode);
                });
                ECOList = _.without(ECOList, obj);
                tr.remove();
            } else {
                var sn = parseInt(tr.attr("bomsn"));
                ECOList.push({
                    sn: sn,
                    action: "deletion",
                    data: {}
                });
                tr.addClass("deletion").find("td[bid=status]").text("Deleted");
                tr.find("td[bid=action] span[bid=delete]").remove();
                tr.find("td[bid=action]").append(button_cancel.clone());
            }
            ECOCheckChange();
        });
        tableArea.on("click", "table tbody tr td[bid=action] span[bid=cancel]", function () {
            var tr = $(this).parents("tr");
            var sn = parseInt(tr.attr("bomsn"));
            var obj = _.find(ECOList, function (obj) {
                return obj.sn == sn;
            });
            ECOList = _.without(ECOList, obj);
            ECOCheckChange();
            tr.removeClass("deletion").find("td[bid=status]").text("No Change");
            tr.find("td[bid=action] span[bid=cancel]").remove();
            tr.find("td[bid=action]").append(button_delete.clone());
        });

        tableArea.find("table tr[type=newitem] input[did=Code]").change(function () {
            var codeNew = tableArea.find("table tr[type=newitem] input[did=Code]").val();
            if (codesList.indexOf(codeNew) == -1) {
                alert("The 'Code'# does not exist in ERP system.");
                tableArea.find("table tr[type=newitem] input[did=Code]").focus().select();
                return;
            } else {
                tableArea.find("table tr[type=newitem] input[did=Name]").val(codesInfo[codeNew].name);
                tableArea.find("table tr[type=newitem] input[did=Spec]").val(codesInfo[codeNew].spec);
                tableArea.find("table tr[type=newitem] td[did=Unit]").text(codesInfo[codeNew].unit);
            }
        });
        tableArea.on("click", "table tbody tr td[bid=action] span[bid=confirm]", function () {
            var trs = tableArea.find("table tr[type=ecoitem]");
            var curOrders = [];
            var curCodes = [];
            trs.each(function () {
                if ($(this).hasClass("deletion")) return;
                curOrders.push(parseInt($(this).find("td[did=Order]").text()));
                curCodes.push($(this).find("input[did=Code]").val().trim());
            })
            var order = parseInt(tableArea.find("table tr[type=newitem] input[did=Order]").val());
            if (isNaN(order)) {
                order = _.max(curOrders) + 1;
                tableArea.find("table tr[type=newitem] input[did=Order]").val(order)
            }

            if (curOrders.indexOf(order) != -1) {
                alert("The 'Order'# exists in current BOM.");
                tableArea.find("table tr[type=newitem] input[did=Order]").focus().select();
                return;
            }

            var codeNew = tableArea.find("table tr[type=newitem] input[did=Code]").val().trim();
            if (codesList.indexOf(codeNew) == -1) {
                alert("The 'Code'# does not exist in ERP system.");
                tableArea.find("table tr[type=newitem] input[did=Code]").focus().select();
                return;
            }
            if (curCodes.indexOf(codeNew) != -1) {
                alert("The 'Code'# already existed in this list.");
                tableArea.find("table tr[type=newitem] input[did=Code]").focus().select();
                return;
            }

            var qty = parseInt(tableArea.find("table tr[type=newitem] input[did=Qty]").val());
            if (isNaN(qty)) {
                alert("The 'Quantity' is not correct!");
                tableArea.find("table tr[type=newitem] input[did=Qty]").focus().select();
                return;
            }

            var ptype = tableArea.find("table tr[type=newitem] select[did=ptype]").val();

            ECOList.push({
                sn: null,
                action: "addition",
                data: {
                    order: order,
                    code: codeNew,
                    parent: code,
                    qty: qty,
                    ptype: ptype
                }
            });
            ECOCheckChange();
            var tr = $("<tr type='ecoitem' bomsn='null'>");
            tr
                .append("<td did='Order'>" + order + "</td>")
                .append("<td><input did='Code' value='" + codeNew + "' readonly></td>")
                .append("<td><input did='Qty' value='" + qty + "' readonly></td>")
                .append("<td did='Unit'>" + codesInfo[codeNew].unit + "</td>")
                .append("<td did='ptype'>" + ptype + "</td>")
                .append("<td><input did='Name' readonly value='" + codesInfo[codeNew].name + "'></td>")
                .append("<td><input did='Spec' readonly value='" + codesInfo[codeNew].spec + "'></td>")
                .append("<td bid='status'> Addition </td>")
                .append("<td bid='action'>   </td>");
            tr.find("td:last-child").append(button_delete.clone());
            tr.addClass("addition");
            trs.last().after(tr);
            tableArea.find("table tr[type=newitem] input[did=Order]").val("");
            tableArea.find("table tr[type=newitem] input[did=Code]").val("");
            tableArea.find("table tr[type=newitem] input[did=Qty]").val("");
            tableArea.find("table tr[type=newitem] select[did=ptype]").val("B");
            tableArea.find("table tr[type=newitem] input[did=Name]").val("");
            tableArea.find("table tr[type=newitem] input[did=Spec]").val("");
            tableArea.find("table tr[type=newitem] td[did=Unit]").text("");
        });
    });
}

function ECOCheckChange() {
    if (ECOList.length > 0) ECOchanged = true;
    else ECOchanged = false;
}