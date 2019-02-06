var codes = {};
bomexcel_arr = [];
bom = [];
var parents = [];
var countNode = 1;

if (Base64 == null) var Base64 = require('js-base64').Base64;
$("button[type=submit][step=1]").on("click", (e) => {
    $(e.currentTarget).prop("disabled", true);
    if ($("input[meta=bomtop]").val().trim().length == 0) $("input[meta=bomtop]").val("2532000228");
    //only for test
    //if ($("textarea[meta=bomexcel]").val().trim().length == 0) $("textarea[meta=bomexcel]").val();
    bom_top = $("input[meta=bomtop]").val();
    var bomexcel = $("textarea[meta=bomexcel]").val();
    if (bomexcel.length < 100) {
        alert("粘贴的数据过少，请检查后再试。");
        return;
    }
    bomexcel_arr = SheetClip.parse(bomexcel);
    var header = bomexcel_arr[0];
    var options = "";
    for (var i in header) {
        options += "<option value='" + i + "'>" + header[i] + "</option>";
    }
    options = "<option value='-1'> 无 </option>" + options;
    if (argv[2] == "dev") console.log(options)
    $("select[meta='bomexcel.level']").append(options);
    $("select[meta='bomexcel.code']").append(options);
    $("select[meta='bomexcel.quantity']").append(options);
    $("select[meta='bomexcel.procumenttype']").append(options);
    $("select[meta='bomexcel.pfep']").append(options);

    selectKey($("select[meta='bomexcel.level']"), "level");
    selectKey($("select[meta='bomexcel.code']"), "material");
    selectKey($("select[meta='bomexcel.quantity']"), "qty");
    selectKey($("select[meta='bomexcel.procumenttype']"), "Purchasing Type ID");
    selectKey($("select[meta='bomexcel.pfep']"), "pfep");

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
    for (var i = 1; i < bomexcel_arr.length; i++) {
        if (codes[bomexcel_arr[i][pos.code]] == undefined) {
            codes[bomexcel_arr[i][pos.code]] = 0;
            length_code++;
        }
    }
    getCodesInfo(codes, (rtn) => {
        //console.log(rtn)
        if (!rtn.err) {
            codes = rtn.codes;
            parents = [];
            new sql.Request().query("select goodsid from st_goodsbom group by goodsid;", (err, result) => {
                for (var i in result.recordset) {
                    parents.push(result.recordset[i].goodsid);
                }
                bom = formatBOM(bom_top);
                var id = generateSQL(bom);
                if (!id) popup("本地数据保存失败", "danger");
                else savegoback(id);
            });
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

function formatBOM(bom_top, level = 1) {
    var setup = {};
    setup.level = parseInt($("select[meta='bomexcel.level']").val());
    setup.code = parseInt($("select[meta='bomexcel.code']").val());
    setup.qty = parseFloat($("select[meta='bomexcel.quantity']").val());
    setup.pt = parseInt($("select[meta='bomexcel.procumenttype']").val());
    setup.pfep = parseInt($("select[meta='bomexcel.pfep']").val());

    addResultText("<div class='alert alert-primary' role='alert'>取得相关列信息</div>");

    for (var i = 1; i < bomexcel_arr.length; i++) {
        bomexcel_arr[i][setup.level] = bomexcel_arr[i][setup.level].trim().split('…').join("");
        bomexcel_arr[i][setup.level] = parseInt(bomexcel_arr[i][setup.level].trim().split('.').join(""));
    }
    bomexcel_arr.splice(0, 1);
    if (argv[2] == "dev") console.log("this bom has " + bomexcel_arr.length + " lines.")
    countNode = 1;
    var bom = _.sortBy(gFormatBOM(bom_top, setup, level), "item");
    if (argv[2] == "dev") console.log("bom after generation: ", bom)
    addResultText("<div class='alert alert-primary' role='alert'>整理BOM上级件</div>");
    return bom;
}


function gFormatBOM(bom_top, setup, level = 1, i = 0) {
    var rtnArr = [];
    while (true) {
        if (bomexcel_arr[i][setup.level] == level) {
            rtnArr.push({
                "code": bomexcel_arr[i][setup.code],
                "parent": bom_top,
                "qty": bomexcel_arr[i][setup.qty],
                "item": countNode++,
                "procumenttype": setup.pt == -1 ? "" : bomexcel_arr[i][setup.pt],
                "pfep": setup.pfep == -1 ? "" : bomexcel_arr[i][setup.pfep]
            });
        } else if (bomexcel_arr[i][setup.level] > level) {
            var curParent = bomexcel_arr[i - 1][setup.code];
            var subArr = gFormatBOM(curParent, setup, level + 1, i);
            if (subArr.length > 0) {
                i += subArr.length;
                if (parents.indexOf(curParent) == -1) {
                    rtnArr = rtnArr.concat(subArr);
                    parents.push(curParent);
                }
                continue;
            }
        } else {
            break;
        }

        i++;
        if (i >= bomexcel_arr.length) break;

    }
    return rtnArr;
}

function generateSQL(bom) {
    var sql_insert = "insert into dbo.st_goodsbom (goodsid, elemgid, quantity, mnfqty, masterqty, usetime, wasterate, memo,  state, pretime, itemno, ptype,pfep, opid, checkorid) values ";
    var sql_delete = "delete from dbo.st_goodsbom where "
    for (var i = 0; i < bom.length; i++) {
        sql_insert += "('" + bom[i].parent + "','" + bom[i].code + "'," + bom[i].qty + "," + bom[i].qty + ", 1, 1, 0, NULL,  1, 0, " + bom[i].item + ",'" + bom[i].procumenttype + "','" + bom[i].pfep + "', " + user.id + ", " + user.id + ")";
        sql_delete += "(goodsid = '" + bom[i].parent + "' and elemgid='" + bom[i].code + "')";
        if (i != bom.length - 1) {
            sql_insert += ", ";
            sql_delete += " or ";
        }
    }
    sql_insert += "; insert into st_bomtop (goodsid) values ( '" + bom_top + "');";
    sql_delete += "; delete from st_bomtop where goodsid='" + bom_top + "';";
    addResultText("<div class='alert alert-success' role='alert'>数据库语句已经生成。</div>");
    var moment = require('moment');
    var id = sqlite.insert('bom', {
        time: moment().format("YYYY-MM-DD HH:mm:ss"),
        bom_top: bom_top,
        sql_insert: sql_insert,
        sql_delete: sql_delete,
        stat: 0,
        remark: "new bom @" + moment().format("YYMMDD_HHmmss"),
        json_bom: JSON.stringify(bom),
        json_excel: JSON.stringify(bomexcel_arr),
        rows: bom.length
    });
    addResultText("<div class='alert alert-success' role='alert'>数据库语句已经存储。</div>");
    return id;
}

function savegoback(id) {
    addResultText('<input class="form-control" meta="bom_name" placeholder="命名本次导入内容" value="">');
    addResultText('<button type="submit" class="btn btn-form btn-primary btn-sm" meta="next" step="3">更名并返回控制台</button>');
    $("button[meta=next][step=3]").on("click", () => {
        var name = $("input[meta=bom_name]").val().trim();
        if (name.length == 0) {
            popup("命名错误，请检查后重试", "danger");
            return;
        }
        sqlite.update("bom", {
            remark: name
        }, {
            sn: id
        });
        loadPanel("dashboard");
    });
}