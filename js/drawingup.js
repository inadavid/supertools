var drawingfilepath;
drawingfilepath = "";
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
    console.log(fileExt)
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
                var ver = ele.substr(ele.indexOf("_V") + 2, ele.indexOf("_", ele.indexOf("_V") + 1) - ele.indexOf("_V") - 2)
                var size = ele.substr(ele.indexOf("_", ele.indexOf("_V" + ver) + 2) + 1, 2)
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
        $('div[step="3"]').show().find("div[bid=filelist]").html("").append(selectDrawingList(uplist));
        $([document.documentElement, document.body]).animate({
            scrollTop: $('div[step="3"]').offset().top
        }, 500);
    }
})


$('button[step=3]').click(function () {
    var uplist = [];
    $('div[step="3"] div[bid=filelist] input[type=checkbox]:checked').each(function () {
        uplist.push(JSON.parse($(this).attr("data")))
    });
    var sqlinsert = "insert into st_drawings (code, version, filename, filetype, filesize, date, opid, size) OUTPUT inserted.sn,inserted.filename   values ";
    var sqlcheck = "select a.code, a.version, a.[date], b.opname from st_drawings as a inner join m_operator as b on a.opid=b.opid where ";
    var values = "";
    var condition = "";
    for (var i in uplist) {
        if (values != "") values += ", ";
        if (condition != "") condition += " or ";
        values += "('" + uplist[i].code + "', " + uplist[i].version + ", '" + uplist[i].filename + "', " + uplist[i].filetype + ", " + uplist[i].filesize + ", GETDATE() , " + user.id + ", '" + uplist[i].size + "')";
        condition += " (a.code = '" + uplist[i].code + "' and a.version=" + uplist[i].version + ") ";
    }
    sqlinsert += values;
    sqlcheck += condition;

    new sql.Request().query(sqlcheck, (err, result) => {
        if (err) {
            console.error(err);
            alert("An error occur when inserting into DB.\n" + JSON.stringify(err));
            return;
        }
        $('div[step="3"] table tr').removeClass("deletion");
        for (var i in result.recordset) {
            $('div[step="3"] table').find("tr[code_version=" + result.recordset[i].code + "_" + result.recordset[i].version + "]").addClass("deletion");
        }
        if (result.recordset.length > 0) {
            alert("Above red drawing/version already existed in system.\nPlease check again.");
            return;
        } else {
            new sql.Request().query(sqlinsert, (err, result) => {
                if (err) {
                    console.error(err);
                    alert("An error occur when inserting into DB.\n" + JSON.stringify(err));
                    return;
                }
                var drawingQty = result.recordset.length;
                var uploadedQty = 0;
                var progressDiv = $("<div class='alert alert-primary' role='alert'>Uploading " + drawingQty + " drawings:<br>");
                progressDiv.append('<div class="progress"> <div class="progress-bar" bid="upload" role="progressbar" style="width: 25%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"> 0% </div> </div>')
                for (var m in result.recordset) {

                }
            });
        }
    })
})

///////////////////functions///////////////////////
function selectDrawingList(uplist) {
    table = $("<table>").addClass("treetable").addClass("selectable");
    thead = $("<thead>").append($("<tr>").append($("<th>").text("Upload")).append($("<th>").text("Code#")).append($("<th>").text("V")).append($("<th>").text("Size")).append($("<th>").text("File")).append($("<th>").text("FSize")));
    table.append(thead);

    tbody = $("<tbody>");
    for (var i in uplist) {
        var tr = $("<tr>").attr("code_version", uplist[i].code + "_" + uplist[i].version);
        tr.append($("<td>").append($("<input bid='upload' type='checkbox' checked>").attr("data", JSON.stringify(uplist[i]))));
        tr.append($("<td>").text(uplist[i].code));
        tr.append($("<td>").text("V" + uplist[i].version));
        tr.append($("<td>").text(uplist[i].size));
        tr.append($("<td>").text(uplist[i].filename));
        tr.append($("<td>").text((uplist[i].filesize / 1024 / 1024).toFixed(2) + "Mb"));
        tbody.append(tr);
        tr.click(function () {
            $(this).find("input[type=checkbox]").click();
        })
    }
    table.append(tbody);
    return table;
}