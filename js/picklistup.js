var codes = {};
bomexcel_arr = [];
bom = [];

if (Base64 == null) var Base64 = require('js-base64').Base64;
$("button[type=submit][step=1]").on("click", (e) => {
    $(e.currentTarget).prop("disabled", true);
    if ($("input[meta=bomtop]").val().trim().length == 0) $("input[meta=bomtop]").val("3613000001");
    if ($("input[meta=bomtop]").val().trim().length == 0) {
        popup("必须输入成品物料号！", "danger");
        $(e.currentTarget).prop("disabled", false);
        return;
    }
    //only for test
    if ($("textarea[meta=bomexcel]").val().trim().length == 0) {
        popup("请检查粘帖的picklist！", "danger");
        $(e.currentTarget).prop("disabled", false);
        return;
    }
    //if ($("textarea[meta=bomexcel]").val().trim().length == 0) $("textarea[meta=bomexcel]").val(Base64.decode(""));
    bom_top = $("input[meta=bomtop]").val().trim();
    var bomexcel = $("textarea[meta=bomexcel]").val().trim();
    if (bomexcel.length < 10) {
        alert("粘贴的数据过少，请检查后再试。");
        return;
    }
    bomexcel_arr = SheetClip.parse(bomexcel);
    var header = bomexcel_arr[0];
    bomexcel_arr.splice(0, 1);
    var options = "";
    for (var i in header) {
        options += "<option value='" + i + "'>" + header[i] + "</option>";
    }
    options = "<option value='-1'> 无 </option>" + options;
    console.log(options)
    $("select[meta='bomexcel.code']").append(options);
    $("select[meta='bomexcel.quantity']").append(options);
    $("select[meta='bomexcel.procumenttype']").append(options);
    $("select[meta='bomexcel.materialtype']").append(options);

    selectKey($("select[meta='bomexcel.code']"), "material");
    selectKey($("select[meta='bomexcel.quantity']"), "qty");
    selectKey($("select[meta='bomexcel.procumenttype']"), "ptype");
    selectKey($("select[meta='bomexcel.materialtype']"), "M. type");

    $('div[meta="bomup"][step="2"]').css("display", "block");
});


$("button[type=submit][step=2]").on("click", (e) => {
    $(e.currentTarget).prop("disabled", true);
    if (config.fSQLserver != 4) {
        popup("数据读取出错！", "danger");
        return;
    }

    $('div[meta="bomup"][step="3"]').css("display", "block");

    var pos = {};
    var count_code = 0;
    var length_code = 0;
    pos.code = parseInt($("select[meta='bomexcel.code']").val());
    codes[bom_top] = 0;
    for (var i in bomexcel_arr) {
        if (codes[bomexcel_arr[i][pos.code]] == undefined) {
            codes[bomexcel_arr[i][pos.code]] = 0;
            length_code++;
        }
    }
    getCodesInfo(codes, (rtn) => {
        //console.log(rtn)
        if (!rtn.err) {
            codes = rtn.codes;
            formatPL(bom_top, codes);
            generateSQL(bom);
            // if (!id) popup("本地数据保存失败", "danger");
            // else savegoback(id);
        } else if (rtn.err == 1) {
            var text = "<h5 color='red'><strong>发生错误：以下物料号在系统中不存在！请检查 </strong></h5> <textarea class='alert alert-danger' role='alert' style='width:100%;height:100px'>";
            for (var i in rtn.data) text += rtn.data[i] + "\n";
            text += "</textarea>";
            addResultText(text);
            $("textarea.alert").on("focus", (e) => {
                $(e.currentTarget).select();
            })
        }
    });

});

function addResultText(text) {
    var p = $('div[bid="bomdatainfo"]');
    p.append(text);
}

function formatPL(bom_top, codes) {
    var setup = {};
    setup.code = parseInt($("select[meta='bomexcel.code']").val());
    setup.qty = parseInt($("select[meta='bomexcel.quantity']").val());
    setup.pt = parseInt($("select[meta='bomexcel.procumenttype']").val());
    setup.mt = parseInt($("select[meta='bomexcel.materialtype']").val());
    setup.count = 1;
    addResultText("<div class='alert alert-primary' role='alert'>取得相关列信息</div>");
    for (var i in bomexcel_arr) {
        var el = bom.indexOf(_.findWhere(bom, {
            code: codes[bomexcel_arr[i][setup.code]]
        }));
        if (el == -1) {
            bom.push({
                "code": codes[bomexcel_arr[i][setup.code]],
                "parent": codes[bom_top],
                "qty": parseFloat(bomexcel_arr[i][setup.qty]),
                "item": setup.count,
                "order": setup.count < 10 ? "00" + (setup.count * 10) : (setup.count < 100 ? "0" + (setup.count * 10) : "" + (setup.count * 10)),
                "procumenttype": setup.pt == -1 ? "" : bomexcel_arr[i][setup.pt],
                "materialtype": setup.mt == -1 ? "" : bomexcel_arr[i][setup.mt],
                "pfep": "",
                "debug": {
                    code: bomexcel_arr[i][setup.code],
                    parent: bom_top
                }
            });
            setup.count++;
        } else {
            bom[el].qty += parseFloat(bomexcel_arr[i][setup.qty]);
        }
    }
    addResultText("<div class='alert alert-primary' role='alert'>整理BOM上级件</div>");

}

function generateSQL(bom) {
    var sql_insert = "insert into dbo.l_goodsbom (goodsid, elemgid, quantity, mnfqty, masterqty, usetime, wasterate, memo, orderno, state, pretime, itemno, userdef1,userdef2, opid, checkorid) values ";
    var sql_delete = "delete from dbo.l_goodsbom where ";
    var sql_update = "";
    for (var i = 0; i < bom.length; i++) {
        sql_insert += "('" + bom[i].parent + "','" + bom[i].code + "'," + bom[i].qty + "," + bom[i].qty + ", 1, 1, 0, NULL, '" + bom[i].order + "', 1, 0, " + bom[i].item + ",'" + bom[i].procumenttype + "','" + bom[i].pfep + "', " + user.id + ",  " + user.id + ")";
        sql_delete += "(goodsid = '" + bom[i].parent + "' and elemgid='" + bom[i].code + "')";
        if (i != bom.length - 1) {
            sql_insert += ", ";
            sql_delete += " or ";
        }
        sql_update += "update l_goods set guserdef3='" + bom[i].materialtype + "' where goodsid=" + bom[i].code + "; "
    }
    sql_insert += "; " + sql_update;
    sql_delete += ";";
    addResultText("<div class='alert alert-success' role='alert'>数据库语句已经生成。执行数据导入中……</div>");
    // var moment = require('moment');
    // var id = sqlite.insert('bom', {
    //     time: moment().format("YYYY-MM-DD HH:mm:ss"),
    //     bom_top: bom_top,
    //     sql_insert: sql_insert,
    //     sql_delete: sql_delete,
    //     stat: 0,
    //     remark: "new picklist @" + moment().format("YYMMDD_HHmmss"),
    //     json_bom: JSON.stringify(bom),
    //     json_excel: JSON.stringify(bomexcel_arr),
    //     rows: bom.length
    // });
    new sql.Request().query(sql_insert, (err, result) => {
        addResultText("<div class='alert alert-success' role='alert'>数据库语句已经导入！</div>");
        loglog("GenerateBOMsql", sql_insert + " | " + sql_delete);
    });
    // return id;
}

// function savegoback(id) {
//     addResultText('<input class="form-control" meta="bom_name" placeholder="命名本次导入内容" value="">');
//     addResultText('<button type="submit" class="btn btn-form btn-primary btn-sm" meta="next" step="3">更名并返回控制台</button>');
//     $("button[meta=next][step=3]").on("click", () => {
//         var name = $("input[meta=bom_name]").val().trim();
//         if (name.length == 0) {
//             popup("命名错误，请检查后重试", "danger");
//             return;
//         }
//         sqlite.update("bom", {
//             remark: name
//         }, {
//             sn: id
//         });
//         loadPanel("dashboard");
//     });
// }