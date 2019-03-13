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

$("button[bid=dlpl]").click(function () {
    var code = $('select[name="picklists"]').find("option:selected").attr("code");
    var type = parseInt($('select[name="picklists"]').find("option:selected").attr("type"));
    getPicklist(code, type);
});

$("button[bid=rebuildpl]").click(function () {
    alert("Under construction.")
});
//////////////////////old ///////////////////