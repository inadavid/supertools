var ECOList = [];
var ECOchanged = false;
var today = moment().format("YYYY-MM-DD");
$(function () {

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
    var existedFlag = false;
    var tableArea = $('div[bid="ecoBody"]');

    //existed eco check
    var sqltext = "select sn from st_bomeco where parentgid = '" + code + "' and cast([date] as date)=cast(getdate() as date);";
    new sql.Request().query(sqltext, (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        if (result.recordset.length > 0) {
            var sn = result.recordset[0].sn;
            existedFlag = "There is already an ECO : " + ecoID(sn) + " on code: " + code + " in system today!";
            alert(existedFlag);
            setTimeout(function () {
                tableArea.html("<h5>ECO existed on " + code + " today. Cannot make new ECO</h5>");
            }, 100);
            return;
        }
    });

    tableArea.html("<h5>Searching children of <b>" + code + "</b></h5>")

    var table = $("<table>");
    table.addClass("treetable")
    var thead = $("<thead>");
    thead
        .append("<th style='width:10px'>Order</th>")
        .append("<th style='width:30px'>Code#</th>")
        .append("<th style='width:10px'>Qty</th>")
        .append("<th style='width:20px'>Unit</th>")
        //.append("<th style='width:10px'>PType</th>")
        .append("<th style='width:200px'>Name</th>")
        .append("<th style='width:200px'>Spec</th>")
        .append("<th style='width:100px'>Stat</th>")
        .append("<th style='width:100px'>Action</th>")
    table.append(thead);
    var tbody = $("<tbody>");

    // var selectTD = $("<td>");
    // var selectCT = $("<select did='ptype'>");
    // for (var i in ptypeList) {
    //     var opt = $("<option>").val(i).text(i);
    //     selectCT.append(opt);
    // }
    // selectTD.append(selectCT);
    var button_delete = $("<span class='iconfont icon-shanchu' bid='delete'>");
    var button_cancel = $("<span class='iconfont icon-cancel' bid='cancel'>");
    var button_confirm = $("<span class='iconfont icon-wanchengchenggong' bid='confirm'>");

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
                //.append("<td><input did='Ptype' value='" + result.recordset[m].ptype + "' readonly></td>")
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
            //.append(selectTD.clone())
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
        var dateLabel = $('<span class="form-inline-label"></span>');
        var comments = $('<input type="text" name="comments" class="form-control">');
        var btnSubmit = $("<button>").attr("bid", "submit").addClass("btn btn-form btn-primary");
        var commentDiv = div.clone().append(dateLabel.clone().text("ECO Comment:")).append(comments.clone());

        tableArea.append(commentDiv).append(div.clone().append(btnSubmit.text("Submit").prop("disabled", true)));

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
                    data: {
                        order: parseInt(tr.find("td[did=Order]").text().trim()),
                        code: curCode,
                        qty: parseFloat(tr.find("input[did=Qty]").val().trim()),
                        //ptype: tr.find("input[did=Ptype]").val().trim()
                        ptype: "P"
                    }
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
            if (isNaN(Number(order))) {
                order = Math.abs(Number(_.max(curOrders))) + 1;
                console.log(order)
                if(order =="Infinity") order = 1;
                tableArea.find("table tr[type=newitem] input[did=Order]").val(order)
            }

            if (curOrders.length > 0 && curOrders.indexOf(order) != -1) {
                alert("The 'Order'# exists in current BOM.");
                tableArea.find("table tr[type=newitem] input[did=Order]").focus().select();
                return;
            }

            var codeNew = tableArea.find("table tr[type=newitem] input[did=Code]").val().trim();
            if(codeNew == code) {
                alert("You can not add the code as the child of itself.");
                tableArea.find("table tr[type=newitem] input[did=Code]").focus().select();
                return;
            }
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

            var qty = parseFloat(tableArea.find("table tr[type=newitem] input[did=Qty]").val());
            if (isNaN(qty)) {
                alert("The 'Quantity' is not correct!");
                tableArea.find("table tr[type=newitem] input[did=Qty]").focus().select();
                return;
            }

            var ptype = "P";

            ECOList.push({
                sn: null,
                action: "addition",
                data: {
                    order: order,
                    code: codeNew,
                    qty: qty,
                    ptype: "P"
                }
            });
            ECOCheckChange();
            var tr = $("<tr type='ecoitem' bomsn='null'>");
            tr
                .append("<td did='Order'>" + order + "</td>")
                .append("<td><input did='Code' value='" + codeNew + "' readonly></td>")
                .append("<td><input did='Qty' value='" + qty + "' readonly></td>")
                .append("<td did='Unit'>" + codesInfo[codeNew].unit + "</td>")
                //.append("<td did='ptype'>" + ptype + "</td>")
                .append("<td><input did='Name' readonly value='" + codesInfo[codeNew].name + "'></td>")
                .append("<td><input did='Spec' readonly value='" + codesInfo[codeNew].spec + "'></td>")
                .append("<td bid='status'> Addition </td>")
                .append("<td bid='action'>   </td>");
            tr.find("td:last-child").append(button_delete.clone());
            tr.addClass("addition");
            if (trs.length > 0) trs.last().after(tr);
            else tbody.prepend(tr);

            tableArea.find("table tr[type=newitem] input[did=Order]").val("");
            tableArea.find("table tr[type=newitem] input[did=Code]").val("");
            tableArea.find("table tr[type=newitem] input[did=Qty]").val("");
            //tableArea.find("table tr[type=newitem] select[did=ptype]").val("B");
            tableArea.find("table tr[type=newitem] input[did=Name]").val("");
            tableArea.find("table tr[type=newitem] input[did=Spec]").val("");
            tableArea.find("table tr[type=newitem] td[did=Unit]").text("");
        });

        tableArea.on("click", "button[bid=submit]", function () {
            if (existedFlag) {
                alert(existedFlag);
                return;
            }
            var comments = $("input[name=comments]").val().trim();
            if (comments.length <= 2) {
                alert("Please write more comments to this ECO");
                return;
            }

            co(function* () {
                try {
                    var coConn = new cosql.Connection(config.serverconfig);
                    yield coConn.connect();
                    var request = new cosql.Request(coConn);

                    $("button[bid=submit]").prop("disabled", true);

                    var sqltext = "insert into st_bomeco (parentgid, comments, date, data, userid) values ('" + code + "','" + Base64.encode(comments) + "', GETDATE(), '" + Base64.encode(JSON.stringify(ECOList)) + "', " + user.id + " ); SELECT SCOPE_IDENTITY() as sn;";
                    recordset = yield request.query(sqltext);
                    console.log("insert into bomeco", recordset)
                    ecosn = recordset[0].sn;
                    loglog("CreatECO", "ECO-sn:" + ecosn);

                    for (var i in ECOList) {
                        if (ECOList[i].action == "deletion") { // delete bom item. 2 steps.
                            //1, insert the change into st_bomeco_children
                            sqltext = "insert into st_bomeco_children (ecosn, goodsid, elemgid,[type],itemno,quanlity,ptype,bomsn) values ( " + ecosn + ", '" + code + "', '" + ECOList[i].data.code + "', 0, " + ECOList[i].data.order + ", " + ECOList[i].data.qty + ", '" + ECOList[i].data.ptype + "', " + ECOList[i].sn + ");";
                            var log = sqltext;
                            yield request.query(sqltext);
                            //2, mark the item in st_goodsbom endDate as yesterday.
                            sqltext = "update st_goodsbom set endDate = dateadd(day,-1, cast(getdate() as date)) where sn = " + ECOList[i].sn;
                            log += "|" + sqltext;
                            yield request.query(sqltext);
                            loglog("CreatECO_subsql", "ECO-sn:" + ecosn + "|" + log);
                        }
                        if (ECOList[i].action == "addition") { // add bom item. 2 steps.
                            //1, insert the new bom item into st_goodsbom
                            sqltext = "insert into st_goodsbom (goodsid, elemgid, quantity, itemno, ptype, pfep, opid, startDate, endDate) values ('" + code + "', '" + ECOList[i].data.code + "', " + ECOList[i].data.qty + "," + ECOList[i].data.order + ", '" + ECOList[i].data.ptype + "', '', " + user.id + ", cast(getdate() as date), '2099-01-01'); SELECT SCOPE_IDENTITY() as sn;";
                            var log = sqltext;
                            var recordset = yield request.query(sqltext);
                            console.log("addtion child:", recordset)
                            //2, insert the change item into st_bomeco_children.
                            sqltext = "insert into st_bomeco_children (ecosn, goodsid, elemgid,[type],itemno,quanlity,ptype,bomsn) values ( " + ecosn + ", '" + code + "', '" + ECOList[i].data.code + "', 1, " + ECOList[i].data.order + ", " + ECOList[i].data.qty + ", '" + ECOList[i].data.ptype + "', " + recordset[0].sn + ");";
                            yield request.query(sqltext);
                            log += "|" + sqltext;
                            loglog("CreatECO_subsql", "ECO-sn:" + ecosn + "|" + log);

                        }
                    }

                    
                    popup("ECO has been applied to BOM", "success");
                    // setTimeout(function () {
                    //     checkPicklistUpdate(ecosn);
                    // }, 10);
                    setTimeout(function () {
                        sqltext = "update st_bomeco set status = 1 where sn = " + ecosn;
                        var coConn = new cosql.Connection(config.serverconfig);
                        yield coConn.connect();
                        var request = new cosql.Request(coConn);
                        yield request.query(sqltext);
                        coConn.close();
                        loadPanel("bomecosearch");
                    }, 100);

                } catch (ex) {
                    // ... error checks
                    console.error(ex)
                }
            })();
        });
    });
}

function ECOCheckChange() {
    if (ECOList.length > 0) {
        ECOchanged = true;
        $("button[bid=submit]").prop("disabled", false);
    } else {
        ECOchanged = false;
        $("button[bid=submit]").prop("disabled", true);
    }
}