var opid = 0;
$(function () {
    var pem = {};
    pem["0"] = "Userinfo display | Database Status, Codes info update | Dev version history *";
    pem["1"] = "BOM search *";
    pem["2"] = "BOM Creation";
    pem["3"] = "BOM ECO";
    pem["4"] = "BOM ECO Search *";
    pem["5"] = "Picklist management";
    pem["6"] = "Read drawing data;*";
    pem["7"] = "Drawing new";
    pem["8"] = "Drawing ECO / New Version / Drawing approval";
    pem["11"] = "BOM Import / Import history";
    pem["12"] = "Picklist Import to ERP";
    pem["13"] = "Drawing Import(Portable and Victor)";
    pem["14"] = "Picklist mass export";
    pem["20"] = "Bill DR export";
    pem["21"] = "Synchronization of codes in ERP";
    pem["25"] = "Revert BOM ECO";
    pem["30"] = "Migration database";
    pem["31"] = "Permission management";
    pem["32"] = "Switch to test system/database";

    var permDiv = $("div[bid=perms]");
    var sel = $("select[bid=opt]");

    for (var i in pem) {
        var perm = $("<input>").attr("type", "checkbox").attr("btype", "perm").attr("pid", i);
        permDiv.append($("<div>").addClass("form-control").append($("<label>").append(perm).append(pem[i])));
    }
    $("button[bid=all]").click(() => {
        $("input[btype=perm]").prop("checked", true);
    })
    $("button[bid=deall]").click(() => {
        $("input[btype=perm]").prop("checked", false);
    })
    $("button[bid=submit]").click(() => {
        var btn = $(this);
        btn.prop("disabled", true);
        var perms = [];
        $("input[btype=perm]:checked").each(function () {
            var perm = parseInt($(this).attr("pid"));
            perms.push(perm);
        });
        perms = JSON.stringify(perms);
        var sqltext = "update m_operator set win8='" + perms + "' where opid=" + opid + ";";
        executeMsSql(sqltext, (err, result) => {
            btn.prop("disabled", false);
            if (err) {
                console.error(err);
                return;
            }
            sel.find("option:selected").attr("perm", perms);
            popup("Permission updated successfully!");
        });
    })

    sel.change(function () {
        var opt = sel.find("option:selected");
        opid = opt.attr("opid");
        var perm = opt.attr("perm");
        var perms;
        try {
            perms = JSON.parse(perm);
        } catch (error) {
            perms = [];
        }
        console.log(opid, perms)
        $("input[btype=perm]").prop("checked", false);
        for (var i in perms) {
            $("input[btype=perm][pid=" + perms[i] + "]").prop("checked", true);
        }
    });

    var sqltext = "select opid, opname, win8 from m_operator order by opid asc;";
    executeMsSql(sqltext, (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        sel.html("");
        var rs = result.recordset;
        for (var i in rs) {
            var opt = $("<option>");
            opt.text(rs[i].opname);
            opt.attr("opid", rs[i].opid);
            opt.attr("perm", rs[i].win8);
            sel.append(opt);
        }
        sel.change();
    });
});