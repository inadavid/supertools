var drawingfilepath;
drawingfilepath = "";
$(function () {
    $('select[bid="dtype"]').html("");
    for (var i in drawingType) {
        var option = $("<option>").val(i).attr("ext", JSON.stringify(drawingType[i].ext)).text(drawingType[i].name);
        $('select[bid="dtype"]').append(option);
    }
})
$("button[bid=dfolder]").click(function () {
    var dfp = dialog.showOpenDialog(win, {
        properties: ['openDirectory']
    })
    if (dfp[0]) drawingfilepath = dfp[0];
    $("span[bid=dfolder]").text(drawingfilepath);
    return;
})

$("input[name=importType]").next("span").click(function () {
    $(this).prev("input").click();
})

$("input[name=importType]").click(function () {
    var radio = $(this)
    $('textarea[bid="dinfo"]').prop("disabled", radio.val() == 1 ? false : true);
    $('select[bid="dtype"]').prop("disabled", radio.val() == 0 ? false : true);
})

$('button[bid="submit"]').click(function () {
    if (drawingfilepath.length < 10) {
        alert("Please select folder path!");
        return;
    }
    $(this).prop("disabled", true);
    var importType = $("input[name=importType]:checked").val();
    var uplist = [];
    var fileType = $('select[bid="dtype"]').val();
    var fileExt = JSON.parse($('select[bid="dtype"] option:selected').attr("ext"));
    if (importType == 0) {
        var pa = fs.readdirSync(drawingfilepath);
        pa.forEach(function (ele, index) {
            var info = fs.statSync(drawingfilepath + "/" + ele)
            if (info.isDirectory()) {
                return;
            } else {
                var lastd = ele.lastIndexOf(".");
                var ext = ele.substr(lastd + 1, ele.length - lastd - 1).toLowerCase();
                if (fileExt.indexOf(ext) == -1) return false;
                var code = ele.substr(0, ele.indexOf("_"));
                var ver = 0
                if (ele.indexOf("_V") != -1) ver = ele.substr(ele.indexOf("_V") + 2, ele.indexOf("_", ele.indexOf("_V") + 1) - ele.indexOf("_V") - 2);
                else if (ele.indexOf("_S_") != -1) ver = 0;
                else if (ele.indexOf("_S") != -1) ver = ele.substr(ele.indexOf("_S") + 2, ele.indexOf("_", ele.indexOf("_S") + 1) - ele.indexOf("_S") - 2);

                var size = ele.indexOf("_V") == -1 ? ele.substr(ele.indexOf("_", ele.indexOf("_S") + 2) + 1, 2) : ele.substr(ele.indexOf("_", ele.indexOf("_V") + 2) + 1, 2);

                if (ver >= 0 && ver <= 100 && size.length < 3)
                    uplist.push({
                        code: code,
                        version: ver,
                        size: size,
                        filename: ele,
                        filesize: info.size,
                        filetype: importType
                    })
            }
        })
        $('div[step="3"]').show().find("div[bid=filelist]").html("").append(selectDrawingList(uplist)).append("<br><button bid='sall' class='btn btn-form btn-secondary'>(De)Select All</button> &nbsp; <button bid='ddup' class='btn btn-form btn-warning'>(De)Select Error</button><br><br>");

        $("div[bid=filelist] button[bid=sall]").click(function () {
            var btn = $(this);
            if (btn.attr("clicked") == "true") {
                $("div[bid=filelist] table tbody tr input[bid='upload']").prop("checked", true);
                btn.removeAttr("clicked");
            } else {
                $("div[bid=filelist] table tbody tr input[bid='upload']").prop("checked", false);
                btn.attr("clicked", "true");
            }
        })
        $("div[bid=filelist] button[bid=ddup]").click(function () {
            var btn = $(this);
            if (btn.attr("clicked") == "true") {
                $("div[bid=filelist] table tbody tr.deletion input[bid='upload']").prop("checked", true);
                $("div[bid=filelist] table tbody tr.nonexisted input[bid='upload']").prop("checked", true);
                btn.removeAttr("clicked");
            } else {
                $("div[bid=filelist] table tbody tr.deletion input[bid='upload']").prop("checked", false);
                $("div[bid=filelist] table tbody tr.nonexisted input[bid='upload']").prop("checked", false);
                btn.attr("clicked", "true");
            }
        })
        $([document.documentElement, document.body]).animate({
            scrollTop: $('div[step="3"]').offset().top
        }, 500);
    } else {
        var drawingArr = SheetClip.parse($('textarea[bid="dinfo"]').val().trim());
        if (drawingArr.length < 2) {
            alert("Drawing excel format wrong!\nNot enough drawing information.");
            return;
        }
        var options = "<option value='-1'>Null</option>";
        for (var i in drawingArr[0]) {
            var option = $("<option>").val(i).text(drawingArr[0][i]);
            options += $('<div>').append(option.clone()).html();
        }
        $("select[bid='drawing.code']").append(options);
        $("select[bid='drawing.version']").append(options);
        $("select[bid='drawing.size']").append(options);
        $("select[bid='drawing.filename']").append(options);
        $('div[step="2"]').show();
    }
});

$("button[step=2]").click(function () {
    var uplist = [];
    var drawingArr = SheetClip.parse($('textarea[bid="dinfo"]').val().trim());
    var setup = {
        code: parseInt($("select[bid='drawing.code']").val()),
        version: parseInt($("select[bid='drawing.version']").val()),
        size: parseInt($("select[bid='drawing.size']").val()),
        filename: parseInt($("select[bid='drawing.filename']").val())
    };
    var drawingList = []
    for (var i in drawingArr) {
        if (drawingArr[i][setup.code].length < 5 || drawingArr[i][setup.code].length > 12) continue;
        if (drawingArr[i][setup.filename] && drawingArr[i][setup.filename].length > 3) {
            drawingList.push({
                code: drawingArr[i][setup.code],
                version: setup.version == -1 ? 0 : ((drawingArr[i][setup.version].indexOf("V") == -1 && drawingArr[i][setup.version].indexOf("S") == -1) ? 0 : parseInt(drawingArr[i][setup.version].substr(1, drawingArr[i][setup.version].length - 1))),
                size: setup.size == -1 ? '' : drawingArr[i][setup.size],
                filename: drawingArr[i][setup.filename]
            })
        }
    }
    var pa = fs.readdirSync(drawingfilepath);
    pa.forEach(function (ele, index) {
        var info = fs.statSync(drawingfilepath + "/" + ele)
        if (info.isDirectory()) {
            return;
        } else {
            // var lastd = ele.lastIndexOf(".");
            // var ext = ele.substr(lastd + 1, ele.length - lastd - 1).toLowerCase();
            // if (fileExt.indexOf(ext) == -1) return false;
            // var code = ele.substr(0, ele.indexOf("_"));
            // var ver = ele.substr(ele.indexOf("_V") + 2, ele.indexOf("_", ele.indexOf("_V") + 1) - ele.indexOf("_V") - 2)
            // var size = ele.substr(ele.indexOf("_", ele.indexOf("_V" + ver) + 2) + 1, 2)
            var filename_noext = ele.substr(0, ele.lastIndexOf("."));
            console.log(filename_noext)
            var codeInfo = _.find(drawingList, function (obj) {
                return obj.filename.trim() == filename_noext.trim()
            });
            if (codeInfo == undefined) return;
            var filetype = -1;
            var ext = ele.split('.').pop().toLowerCase();
            for (var m in drawingType) {
                if (drawingType[m].ext.indexOf(ext) != -1) {
                    filetype = m;
                    break;
                }
            }
            if (filetype == -1) return;
            if (codeInfo.version >= 0 && codeInfo.version <= 100 && info.size.length < 10)
                uplist.push({
                    code: codeInfo.code,
                    version: codeInfo.version,
                    size: codeInfo.size,
                    filename: ele,
                    filesize: info.size,
                    filetype: filetype
                })
        }
    })
    $('div[step="3"]').show().find("div[bid=filelist]").html("").append(selectDrawingList(uplist));
    $([document.documentElement, document.body]).animate({
        scrollTop: $('div[step="3"]').offset().top
    }, 500);
});


$('button[step=3]').click(function () {
    var uplist = [];
    $('button[step=3]').prop("disabled", true);
    $('div[step="3"] div[bid=filelist] input[type=checkbox]:checked').each(function () {
        uplist.push(JSON.parse($(this).attr("data")))
    });
    var sqlinsert = "insert into st_drawings (code, version, filename, filetype, filesize, date, opid, size, stat) OUTPUT inserted.sn,inserted.filename   values ";
    var sqlcheck = "select a.code, a.version, a.[date], b.opname,a.filetype from st_drawings as a inner join m_operator as b on a.opid=b.opid where ";
    var values = "";
    var condition = "";
    var flag_proceeed = true;
    $('div[step="3"] table tr').removeClass("nonexisted").removeClass("wrongver")
    for (var i in uplist) {
        if (values != "") values += ", ";
        if (condition != "") condition += " or ";
        values += "('" + uplist[i].code + "', " + uplist[i].version + ", '" + uplist[i].filename + "', " + uplist[i].filetype + ", " + uplist[i].filesize + ", GETDATE() , " + user.id + ", '" + uplist[i].size + "',1)";
        condition += " (a.code = '" + uplist[i].code + "' and a.version=" + uplist[i].version + " and a.filetype=" + uplist[i].filetype + ") ";

        var tr = $('div[step="3"] table').find("tr[code_version=" + uplist[i].code + "_" + uplist[i].version + "_" + uplist[i].filetype + "]");
        if (codesList.indexOf(uplist[i].code) == -1) {
            tr.addClass("nonexisted");
            flag_proceeed = false;
        }
        if (isNaN(uplist[i].version)) {
            tr.addClass("wrongver");
            flag_proceeed = false;
        }
    }
    sqlinsert += values;
    sqlcheck += condition;
    if (!flag_proceeed) {
        alert("Above yellow drawing/version/drawing has problem in file information.\nPlease check again.");
        $('button[step=3]').prop("disabled", false);
        return;
    }
    executeMsSql(sqlcheck, (err, result) => {
        var flag_proceeed = true;
        if (err) {
            console.error(err);
            alert("An error occur when inserting into DB.\n" + JSON.stringify(err));
            $('button[step=3]').prop("disabled", false);
            return;
        }
        $('div[step="3"] table tr').removeClass("deletion");
        for (var i in result.recordset) {
            $('div[step="3"] table').find("tr[code_version=" + result.recordset[i].code + "_" + result.recordset[i].version + "_" + result.recordset[i].filetype + "]").addClass("deletion");
        }
        if (result.recordset.length > 0) flag_proceeed = false;

        if (!flag_proceeed) {
            alert("Above red drawing/version/drawing type already existed in system.\nPlease check again.");
            $('button[step=3]').prop("disabled", false);
            return;
        } else {
            executeMsSql(sqlinsert, (err, result) => {
                if (err) {
                    console.error(err);
                    alert("An error occur when inserting into DB.\n" + JSON.stringify(err));
                    $('button[step=3]').prop("disabled", false);
                    return;
                }
                var drawingQty = result.recordset.length;
                var uploadedQty = 0;
                var progressDiv = $("<div class='alert alert-primary' role='alert'>Uploading " + drawingQty + " drawings:<br>");
                progressDiv.append('<div class="progress"> <div class="progress-bar" bid="upload" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"> 0% </div> </div>');
                $('div[step="4"]').show().append(progressDiv);

                var mysql = require('mysql');
                var connection = mysql.createConnection({
                    host: config.mysqlServer,
                    user: config.serverconfig.user,
                    password: config.serverconfig.password,
                    database: config.serverconfig.user
                });
                connection.connect();
                $([document.documentElement, document.body]).animate({
                    scrollTop: $('div[step="4"]').offset().top
                }, 500);
                for (var m in result.recordset) {
                    query = "INSERT INTO st_drawings SET ?";
                    value = {
                        dsn: result.recordset[m].sn,
                        data: fs.readFileSync(drawingfilepath + "/" + result.recordset[m].filename)
                    }
                    connection.query(query, value, function (error, results, fields) {
                        if (error) throw error;
                        var rate = (++uploadedQty / drawingQty * 100).toFixed(2);
                        $('div[step="4"] div[bid=upload]').css("width", rate + "%").attr("aria-valuenow", rate).text(rate + "%");
                        if (uploadedQty == drawingQty) popup("All drawings are uploaded!", "success");
                    });
                }

                connection.end();
            });
        }
    })
})

///////////////////functions///////////////////////
function selectDrawingList(uplist) {
    table = $("<table>").addClass("treetable").addClass("selectable");
    thead = $("<thead>").append($("<tr>").append($("<th>").text("Upload")).append($("<th>").text("Code#")).append($("<th>").text("V")).append($("<th>").text("Size")).append($("<th>").text("Type")).append($("<th>").text("File")).append($("<th>").text("FSize")));
    table.append(thead);

    tbody = $("<tbody>");
    for (var i in uplist) {
        var tr = $("<tr>").attr("code_version", uplist[i].code + "_" + uplist[i].version + "_" + uplist[i].filetype);
        tr.append($("<td>").append($("<input bid='upload' type='checkbox' checked>").attr("data", JSON.stringify(uplist[i]))));
        tr.append($("<td>").text(uplist[i].code));
        tr.append($("<td>").text("V" + uplist[i].version));
        tr.append($("<td>").text(uplist[i].size));
        tr.append($("<td>").text(drawingType[uplist[i].filetype].name));
        tr.append($("<td>").text(uplist[i].filename));
        tr.append($("<td>").text((uplist[i].filesize / 1024 / 1024).toFixed(2) + "Mb"));
        tbody.append(tr);
        tr.click(function () {
            var cbox = $(this).find("input[type=checkbox]");
            cbox.prop("checked", !cbox.prop("checked"));
        })
        tr.find("input[type=checkbox]").click(function () {
            tr.trigger("click");
            return false;
        })
    }
    table.append(tbody);
    return table;
}