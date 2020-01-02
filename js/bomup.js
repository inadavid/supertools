var codes = {};
bomexcel_arr = [];
bom = [];
var parents = [];
var countNode = 1;
var veryTop = 0;
var bomtopArr = [];
if (Base64 == null) var Base64 = require('js-base64').Base64;
$("button[type=submit][step=1]").on("click", (e) => {
    $(e.currentTarget).prop("disabled", true);

    bom_top = $("input[meta=bomtop]").val();
    veryTop = $('input[type="checkbox"][meta="verytop"]').prop("checked") ? 1 : 0;
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
                if (parents.indexOf(bom_top) != -1) {
                    addResultText("<div class='alert alert-danger' role='alert'>This bom has been uploaded before!</div>");
                    return;
                }
                bomtopArr = [bom_top];
                bom = formatBOM(bom_top);
                // if (argv[2] == "dev") { //export a temp file for check
                //     var savebom = JSON.parse(JSON.stringify(bom));
                //     for (var i in savebom) {
                //         savebom[i].Name = codesInfo[savebom[i].code].name;
                //         savebom[i].Spec = codesInfo[savebom[i].code].spec
                //     }
                //     savedata(appPath + '/db/' + bom_top + '.csv', savebom);
                //     //return;
                // }
                // var id = 
                if (bom === false) return false;
                generateSQL(bom);
                // if (!id) popup("本地数据保存失败", "danger");
                // else savegoback(id);
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

function formatBOM(bom_top) {
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
    bomtopArr = [];
    var tmpData = gFormatBOM(bom_top, setup);
    if (tmpData === false) {
        popup("Upload BOM Failed.", "danger");
        addResultText("<div class='alert alert-primary' role='alert'>整理层级时发现致命错误。</div>");
        return false;
    }
    var bom = tmpData.data;
    //var bom = _.sortBy(gFormatBOM(bom_top, setup, level), "item");
    if (argv[2] == "dev") console.log("bom after generation: ", bom)
    addResultText("<div class='alert alert-primary' role='alert'>整理BOM上级件</div>");
    return bom;
}


function gFormatBOM(bom_top, setup, index = 0, top = false) {
    var i = index
    var rtnArr = [];
    var rtnCount = 0;
    var levelnode = 1;
    var level = bomexcel_arr[i][setup.level];
    if (top === false) top = {
        "code": bom_top,
        "parent": false,
        "qty": 0,
        "item": false,
        "procumenttype": false,
        "pfep": false,
        "level": 0,
        "pid": false
    }
    while (true) {
        if (i >= bomexcel_arr.length) break;
        if (bomexcel_arr[i][setup.level] == level) {
            //console.log("parsing " + bomexcel_arr[i][setup.code] + " in same level, ready to add to return array;")

            var ptype = bomexcel_arr[i][setup.pt].toUpperCase().trim();
            //check if ptype is in target list
            if (ptype != "A" && ptype != "B" && ptype != "P" && ptype != "N" && ptype != "F" && ptype != "V" && ptype != "C" && ptype != "M") {
                alert("BOM PType error: line[" + (i + 1) + "], code " + bomexcel_arr[i][setup.code] + " have wrong PTYPE " + ptype);
                return false;
            }

            //check if code try to add itself into a loop;
            if (top.pid !== false && (top.pid.indexOf(bomexcel_arr[i][setup.code]) != -1 || bomexcel_arr[i][setup.code] == bom_top)) {
                alert("BOM Data error: code " + bomexcel_arr[i][setup.code] + " tried to add into a loop.\nLevel chain is:" + top.pid + "." + bom_top);
                return false;
            }
            //check the logic of procumenttype
            if (top.procumenttype !== false && (top.procumenttype.toUpperCase() == "A" || top.procumenttype.toUpperCase() == "M") && ptype != "B" && ptype != "A" && ptype != "V" && ptype != "M" && ptype != "C") {
                alert("BOM PType error: line[" + (i + 1) + "], code " + bomexcel_arr[i][setup.code] + " have wrong ptype " + ptype + " as sub-material for \"" + top.procumenttype.toUpperCase() + "\".\nLevel chain is:" + top.pid + "." + bom_top);
                return false;
            }
            if (top.procumenttype !== false && top.procumenttype.toUpperCase() == "B" && ptype != "P" && ptype != "N" && ptype != "F" && ptype != "V") {
                alert("BOM PType error: line[" + (i + 1) + "], code" + bomexcel_arr[i][setup.code] + " have wrong ptype " + bomexcel_arr[i][setup.pt] + " as sub-material for \"B\".\nLevel chain is:" + top.pid + "." + bom_top);
                return false;
            }
            if (top.procumenttype !== false && top.procumenttype.toUpperCase() == "P" && ptype != "N" && ptype != "F" && ptype != "V") {
                alert("BOM PType error: line[" + (i + 1) + "], code " + bomexcel_arr[i][setup.code] + " have wrong ptype " + bomexcel_arr[i][setup.pt] + " as sub-material for \"P\".\nLevel chain is:" + top.pid + "." + bom_top);
                return false;
            }
            //check if quantity if reasonable
            var qty = parseFloat(bomexcel_arr[i][setup.qty]);
            if (isNaN(qty) || qty < 0) {
                alert("BOM PType error: line[" + (i + 1) + "], code " + bomexcel_arr[i][setup.code] + " have wrong QUANTITY " + bomexcel_arr[i][setup.qty]);
                return false;
            }
            rtnArr.push({
                "code": bomexcel_arr[i][setup.code],
                "parent": bom_top,
                "qty": qty,
                "item": levelnode++,
                "procumenttype": setup.pt == -1 ? "" : ptype,
                "pfep": setup.pfep == -1 ? "" : bomexcel_arr[i][setup.pfep],
                "level": level,
                "pid": top.pid === false ? bom_top : top.pid + "." + bom_top
            });
            countNode++;
            rtnCount++;
        } else if (bomexcel_arr[i][setup.level] > level) {
            //console.log("parsing " + bomexcel_arr[i][setup.code] + " in lower level, ready to make a recursion;")
            var curParent = rtnArr[rtnArr.length - 1];
            bomtopArr.push(curParent.code);
            var subArr = gFormatBOM(curParent.code, setup, i, curParent);
            if (subArr === false) {
                return false;
            }
            i += subArr.count;
            rtnCount += subArr.count;
            if (parents.indexOf(curParent.code) == -1) {
                rtnArr = rtnArr.concat(JSON.parse(JSON.stringify(subArr.data)));
                parents.push(curParent.code);
            } else {
                if (argv[2] == "dev") console.log("found an existed bom level for top:" + curParent.code)
            }
            bomtopArr.pop();
            continue;
        } else {
            //console.log("parsing " + bomexcel_arr[i][setup.code] + " back in upper level, ready to return;")
            return {
                data: JSON.parse(JSON.stringify(rtnArr)),
                count: rtnCount
            }
        }

        i++;

    }
    //if (argv[2] == "dev") console.log("return array for " + bom_top, rtnArr);
    return {
        data: JSON.parse(JSON.stringify(rtnArr)),
        count: rtnCount
    };
}

function generateSQL(bom) {
    var st = "insert into st_goodsbom_stat (bomtop, date, opid) values ('" + bom_top + "', GETDATE(), " + user.id + "); SELECT SCOPE_IDENTITY() as sn;";
    executeMsSql(st, (err, result) => {
        if (err) {
            alert("Error happened: \n" + JSON.stringify(err));
            return;
        }
        var statsn = result.recordset[0].sn;

        var sql_insert = [];
        var sql_temp = "insert into dbo.st_goodsbom (goodsid, elemgid, quantity, itemno, ptype, pfep, opid, startDate, endDate, mark) values ";
        var sql_i = sql_temp;
        for (var i = 0; i < bom.length; i++) {
            sql_i += "('" + bom[i].parent + "','" + bom[i].code + "'," + bom[i].qty + "," + bom[i].item + ",'" + bom[i].procumenttype + "','" + bom[i].pfep + "', " + user.id + ", dateadd(day,-1, cast(getdate() as date)), '2099-01-01', " + statsn + ")";
            if (i != bom.length - 1 && (i + 1) % 200 != 0) {
                sql_i += ", ";
            } else {
                sql_i += "; ";
                sql_insert.push(sql_i);
                sql_i = "";
                if (i != bom.length - 1) sql_i = sql_temp;
            }
        }
        if (veryTop) {
            sql_i += "insert into st_bomtop (goodsid) values ( '" + bom_top + "'); ";
        }
        sql_i += "insert into st_picklists (code, date, opid,type) values ('" + bom_top + "', GETDATE(), " + user.id + ", 0); insert into st_bomeco (parentgid, comments, date, data, userid, status) values ( '" + bom_top + "', '" + Base64.encode("New BOM upload") + "', GETDATE(), '" + Base64.encode(JSON.stringify([])) + "', " + user.id + " ,1 );";
        sql_insert.push(sql_i);
        addResultText("<div class='alert alert-success' role='alert'>数据库语句已经生成。执行数据导入中……</div>");
        //console.log(sql_insert)
        executeMsSql(sql_insert, (err, result) => {
            addResultText("<div class='alert alert-success' role='alert'>数据库语句已经导入！</div>");
            loglog("UploadBOMsql", JSON.stringify({
                bomMark: statsn
            }));
        });
    });

}