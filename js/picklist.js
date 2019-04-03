var picklists = [];
today = moment().format("YYYY-MM-DD")
$(function () {
    executeMsSql("select * from st_picklists order by code asc;", (err, result) => {

        if (result.rowsAffected != 0) {
            for (var i in result.recordset) {
                picklists.push(result.recordset[i]);
            }
        }
        updatePicklists();
    })
})

function updatePicklists() {
    var picklistSelect = $('select[name="picklists"]').html("");
    for (var i in picklists) {
        var option = $("<option>").clone().val(picklists[i].sn).attr("type", picklists[i].type).attr("code", picklists[i].code).text(picklists[i].code + " | " + codesInfo[picklists[i].code].name + "(" + codesInfo[picklists[i].code].spec + ") | " + (picklists[i].type == 0 ? "Make" : "Buy") + (picklists[i].reflag == 1 ? " | rebuilt needed" : "")).attr("rebuilt", picklists[i].reflag);
        picklistSelect.append(option);
    };
}
$('select[name="picklists"]').on("change", function () {
    $("button[bid=delpl]").prop("disabled", false);
    $("button[bid=dlpl]").prop("disabled", false);
    if ($(this).find("option:selected").attr("rebuilt") == "1") $("button[bid=rebuildpl]").prop("disabled", false);
    else $("button[bid=rebuildpl]").prop("disabled", true);
});

$('input[name="newpl"]').on("keyup", function () {
    var val = $('input[name="newpl"]').val().trim();
    $("span[bid=spec]").text("");
    if (codesList.indexOf(val) != -1) {
        $("span[bid=spec]").text(codesInfo[val].name + " | " + codesInfo[val].spec);
        $("button[bid=newpl]").prop("disabled", false);
    } else
        $("button[bid=newpl]").prop("disabled", true);
})
$('input[name="newpl"]').on("keypress", function (e) {
    if (e.which == 13) $("button[bid=newpl]").trigger("click");
});

$("button[bid=newpl]").click(function () {
    var plcode = $('input[name="newpl"]').prop("disabled", true);
    var type = $('input[bid="type"]').prop("checked") ? 1 : 0;
    //search if already existed.
    if (codesList.indexOf(plcode.val().trim()) == -1) {
        alert("Code# " + plcode.val() + " does not exist in ERP MasterData.");
        plcode.prop("disabled", false);
        return;
    }
    if (_.find(picklists, function (obj) {
            return obj.code == plcode.val().trim();
        }) != undefined) {
        alert("Code# " + plcode.val() + " already existed in picklist code list.");
        plcode.prop("disabled", false);
        return;
    }
    executeMsSql("select count(*) as [count] from st_goodsbom where goodsid='" + plcode.val().trim() + "' and startDate <= getdate() and endDate >= getdate();", (err, result) => {
        var count = result.recordset[0].count;
        if (count > 0) {
            //add to list
            executeMsSql("insert into st_picklists (code, date, opid,type) values ('" + plcode.val().trim() + "', GETDATE(), " + user.id + ", " + type + "); SELECT SCOPE_IDENTITY() as sn;", (err, result) => {
                picklists.push({
                    sn: result.recordset[0].sn,
                    code: plcode.val().trim(),
                    date: moment().format("YYYY-MM-DD HH:mm:ss"),
                    opid: user.id,
                    type: type,
                    reflag: 1
                });
                plcode.prop("disabled", false).val("");
                updatePicklists();
                $("span[bid=spec]").text("");
                $("button[bid=newpl]").prop("disabled", true);
                loglog("PicklistAdd", "sn:" + result.recordset[0].sn + "; code:" + plcode.val().trim());
            });

        } else {
            alert("Code# " + plcode.val() + " has no sub-BOM.");
            plcode.prop("disabled", false);
            return;
        }
    })
});

$("button[bid=delpl]").click(function () {
    var sn = $('select[name="picklists"]').val()[0];
    var item = _.find(picklists, function (obj) {
        return obj.sn == sn;
    });
    if (!confirm("Are you sure you want to delete code " + item.code + " from plicklist generation list?")) return;

    executeMsSql("delete from st_picklists where sn = " + sn + "; ", (err) => {
        loglog("PicklistDelete", "sn:" + sn + "; code:" + item.code);
        picklists.splice(picklists.indexOf(item), 1);
        $("button[bid=delpl]").prop("disabled", true);
        $("button[bid=dlpl]").prop("disabled", true);
        $("button[bid=rebuildpl]").prop("disabled", true);
        updatePicklists();
    });
});

$('select[name="picklists"]').change(function () {
    var sel = $('select[name="picklists"]').find("option:selected:last");
    $('select[name="picklists"] option').prop("selected", false);
    sel.prop("selected", true);
})

$("button[bid=dlpl]").click(function () {
    var code = $('select[name="picklists"]').find("option:selected").attr("code");
    var type = parseInt($('select[name="picklists"]').find("option:selected").attr("type"));
    getPicklist(code, type);
});

$("button[bid=rebuildpl]").click(function () {
    if (!confirm("You are about to replace the PICKLIST in ERP\nwith a new one generated from BOM! Are you sure?\n您即将用BOM导出的PICKLIST替换ERP系统中的数据！\n此操作不可逆，原PICKLIST将被彻底删除！您确定么？")) return false;
    var code = $('select[name="picklists"]').find("option:selected").attr("code");
    var type = parseInt($('select[name="picklists"]').find("option:selected").attr("type"));
    getPicklistData(code, type, function (bom) {
        /* structure of rdata from parent function
        nobj.SN = count++;
        nobj.Code = dbom[i].Code;
        nobj.Qty = dbom[i].Qty;
        nobj.Unit = codesInfo[dbom[i].Code].unit;
        nobj.Name = codesInfo[dbom[i].Code].name;
        nobj.Spec = codesInfo[dbom[i].Code].spec;
        nobj.Warehouse = codesInfo[dbom[i].Code].warehouse;
        */
        var sql_insert = [];
        var sql_temp = "insert into dbo.l_goodsbom (goodsid, elemgid, quantity, mnfqty, masterqty, usetime, wasterate, memo, orderno, state, pretime, itemno, userdef1,userdef2, opid, checkorid) values ";
        var sql_i = sql_temp;
        var sql_delete = "delete from dbo.l_goodsbom where goodsid = " + codesInfo[code].goodsid + ";";
        var sql_update = "update st_picklists set reflag = 0 where code = '" + code + "';";
        for (var i = 0; i < bom.length; i++) {
            sql_i += "('" + codesInfo[code].goodsid + "','" + codesInfo[bom[i].Code].goodsid + "'," + bom[i].Qty + "," + bom[i].Qty + ", 1, 1, 0, NULL, '" + (bom[i].SN < 10 ? "00" + (bom[i].SN * 10) : (bom[i].SN < 100 ? "0" + (bom[i].SN * 10) : "" + (bom[i].SN * 10))) + "', 1, 0, " + bom[i].SN + ",'" + bom[i].Warehouse + "','', " + user.id + ",  " + user.id + ")";
            if (i != bom.length - 1 && (i + 1) % 200 != 0) {
                sql_i += ", ";
            } else {
                sql_i += "; ";
                sql_insert.push(sql_i);
                sql_i = "";
                if (i != bom.length - 1) sql_i = sql_temp;
            }
        }
        loglog("UpdatePicklist", )
        sql_insert.splice(0, 0, sql_update);
        sql_insert.push(sql_delete);
        executeMsSql(sql_insert, (err, result) => {
            if (err) {
                alert(JSON.stringify(err));
                executeMsSql(sql_delete);
                return;
            }
            popup("Picklist updated!", "success");
            loadPanel("picklist");
        })
    })
});
//////////////////////old ///////////////////