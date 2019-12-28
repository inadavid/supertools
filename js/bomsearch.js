var displayBOM = [];
var appliedDate = '2019-02-01';
var searchHistory = [];
var historyLength = 5;
var completeBomTop;
var firstTr = [];
var currentIndex = 0;
var f3bind;

$(function () {
    var moment = require('moment');
    appliedDate = moment(new Date()).format("YYYY-MM-DD");
    $('input[name="appliedDate"]').val(appliedDate);
    config = ini.parse(fs.readFileSync(configFile, 'utf-8'));
    searchHistory = JSON.parse(Base64.decode(config.bomsearchhistory));
    if (searchHistory.length > 0) {
        searchHistories();
        $("button[bid='searchHistory']:first").click();
    } else {
        config.bomsearchhistory = 'W10=';
        fs.writeFileSync(configFile, ini.stringify(config));
        $('div[bid="searchHistory"]').hide();
    }

    var sqltext = "select goodsid from st_bomtop;";
    executeMsSql(sqltext, (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        allcodesHint = [];
        for (var m in result.recordset) {
            allcodesHint.push({
                label: result.recordset[m].goodsid + " | " + codesInfo[result.recordset[m].goodsid].name + " | " + codesInfo[result.recordset[m].goodsid].spec,
                value: result.recordset[m].goodsid
            })
        }
        completeBomTop = new Awesomplete("input[bid=bomtop]", {
            list: allcodesHint,
            minChars: 4,
            maxItems: 15,
        });
    });

    $(document).on("mousedown", "table.treetable tbody tr", function (e) {
        if (e.button == 2) {
            var codetr = $(this);
            var codeinput = codetr.find("input[did=Code]");
            clipboard.writeText(codeinput.val().trim());
            codetr.addClass("bgcolor_highlight");
            setTimeout(function () {
                codetr.removeClass("bgcolor_highlight");
            }, 500)
            return false;
        }
        return true;
    });

    if (f3bind != true) {
        $(document).on("keydown", function (e) {
            if (firstTr.length == 0) return;
            if (e.which == 114) {
                if (firstTr.length > 0 && currentIndex < firstTr.length - 1) {
                    currentIndex++;
                } else if (firstTr.length > 0) {
                    currentIndex = 0
                } else return;
            }
            if (e.which == 115) {
                if (currentIndex > 0) {
                    currentIndex--;
                } else if (firstTr.length > 0) {
                    currentIndex = firstTr.length - 1;
                }
            }
            if ([114, 115].indexOf(e.which) != -1) {
                $([document.documentElement, document.body]).animate({
                    scrollTop: firstTr[currentIndex].offset().top
                }, 500);
            }
        });
        f3bind = true;
    }

})

$("input[bid=bomtop]").on("keyup", function (event) {
    if (event.which == 13) $("button[bid=bomSearch]").trigger("click");
    var val = $("input[bid=bomtop]").val().trim();
    var spec = $("span[bid=codespec]");
    spec.css("margin-left", "50px").css("margin-right", "50px")
    if (codesList.indexOf(val) == -1) {
        spec.text("");
        return;
    } else {
        spec.text(codesInfo[val].name + " | " + codesInfo[val].spec);
        //$("button[bid=bomSearch]").trigger("click");
    }
})

$("button[bid=bomSearch]").on("click", function () {
    var val = $("input[bid=bomtop]").val().trim();
    var spec = $("span[bid=codespec]");

    if (codesList.indexOf(val) == -1) {
        //alert("wrong code")
        spec.text("");
        return;
    } else {
        spec.text(codesInfo[val].spec);
        if (completeBomTop) completeBomTop.close();
        $("button[bid=bomSearch]").prop("disabled", true);
        var d = $('input[name="appliedDate"]').val().trim();
        if (d.length < 10) {
            popup("AppliedDate not valid.", "danger");
            return;
        }
        appliedDate = d;
        searchBOM(val);
        searchParent(val);
        searchFG(val);

        //history of the button:

        if (searchHistory.indexOf(val) == -1) {
            searchHistory.push(val);
            if (searchHistory.length > historyLength) searchHistory.splice(0, 1);
        } else {
            searchHistory.splice(searchHistory.indexOf(val), 1);
            searchHistory.push(val);
        }
        config.bomsearchhistory = Base64.encode(JSON.stringify(searchHistory));
        fs.writeFileSync(configFile, ini.stringify(config));
        searchHistories();
    }
})

function searchHistories() {
    var historyHTML = $('div[bid="searchHistory"]');
    historyHTML.hide();
    if (searchHistory.length == 0) return;
    historyHTML.html("<label style='margin-right:20px'>Search history:</label>");
    for (var n = searchHistory.length - 1; n >= 0; n--) {
        var span = $("<button bid='searchHistory' class='btn btn-form btn-secondary btn-sm'>").text(searchHistory[n] + " | " + codesInfo[searchHistory[n]].name).attr("code", searchHistory[n]).css("margin", "5px");
        historyHTML.append(span);
    }
    historyHTML.show();

    $("button[bid='searchHistory']").click(function () {
        var code = $(this).attr("code").trim();
        $("input[bid=bomtop]").val(code);
        $("button[bid=bomSearch]").trigger("click");
    })
}

function reOrderBOM(dbom, top) { // rearrange order of BOM for display
    var tmpArr = [];
    for (var i in dbom) {
        if (dbom[i].pid == top) tmpArr.push(dbom[i]);
    }
    if (tmpArr.length == 0) return false;
    tmpArr = _.sortBy(tmpArr, "Order");
    var rtnArr = [];
    for (var m in tmpArr) {
        rtnArr.push(tmpArr[m]);
        var subArr = reOrderBOM(dbom, tmpArr[m].pid + "." + tmpArr[m].Code);
        if (subArr) {
            for (var n in subArr) rtnArr.push(subArr[n]);
        }
    }
    return rtnArr;
}

function showBOM(dbom) {
    if (dbom.length == 0) return;
    var plist = [];
    for (var i in dbom) {
        if (plist.indexOf(dbom[i].Parent) == -1) plist.push(dbom[i].Parent);
    }
    var table = $("<table>");
    table.addClass("treetable")
    var thead = $("<thead>");
    thead
        .append("<th width='20%'>Level</th>")
        .append("<th style='width:10px'>SN</th>")
        .append("<th style='width:10px'>Order</th>")
        .append("<th style='width:30px'>Code#</th>")
        .append("<th style='width:10px'>Qty</th>")
        .append("<th style='width:20px'>Unit</th>")
        .append("<th style='width:10px'>PType</th>")
        .append("<th style='width:150px'>Name</th>")
        .append("<th style='width:150px'>Desc</th>")
        .append("<th style='width:150px'>Warehouse</th>")
        .append("<th style='width:100px'>Drawing</th>")
    table.append(thead);
    var tbody = $("<tbody>");
    var count = 1;
    for (var i in dbom) {
        var tr = $("<tr type='bomitem' data-tt-id='" + (dbom[i].pid ? dbom[i].pid + "." : "") + dbom[i].Code + "' data-tt-parent-id='" + dbom[i].pid + "' class='" + (plist.indexOf(dbom[i].Code) == -1 ? "" : "branch") + "'>")
        tr
            .append("<td>" + dbom[i].Level + "</td>")
            .append("<td did='SN'>" + (count++) + "</td>")
            .append("<td did='Order'>" + dbom[i].Order + "</td>")
            .append("<td><input did='Code' value='" + dbom[i].Code + "' readonly></td>")
            .append("<td><input did='Qty' value='" + dbom[i].Qty + "' readonly></td>")
            .append("<td>" + dbom[i].Unit + "</td>")
            .append("<td bid='ptype'>" + dbom[i].ProchasingType + "</td>")
            .append("<td><input did='Name' value='" + dbom[i].Name + "' readonly></td>")
            .append("<td><input did='Spec' value='" + dbom[i].Spec + "' readonly></td>")
            .append("<td><input did='whpos' value='" + dbom[i].Warehouse + "' readonly></td>")
            .append("<td>" + (user.perm.indexOf(6) != -1 ? "<span class='iconfont icon-drawing' bid='drawing' code='" + dbom[i].Code + "'>" + (dbom[i].dversion !== null ? "</span> <span class='iconfont icon-open' bid='dopen' code='" + dbom[i].Code + "' version='" + dbom[i].dversion + "'></span> <span>V" + dbom[i].dversion + "</span>" : "") : "-") + "</td>");
        tbody.append(tr);
    }
    table.append(tbody);

    table.find("span[bid=drawing]").css("cursor", "pointer").click(function () {
        var code = $(this).attr("code");
        drawingCode = code;
        loadPanel("drawingdis");
    });

    table.find("span[bid=dopen]").css("cursor", "pointer").click(function () {
        var btn = $(this);
        btn.hide();

        var code = btn.attr("code");
        var version = parseInt(btn.attr("version"))
        displayDrawing(code, version, function (rtn) {
            if (!rtn.err) btn.show();
            else alert(rtn.err)
        });
    });
    $("div[bid=bomcard]").html("<h5><strong>" + $("input[bid=bomtop]").val() + "</strong> BOM Tree View &nbsp; &nbsp; &nbsp; <input type='input' bid='keyword' class='form-control' style='width:200px; display: inline-block;' placeholder='Keyword' title='Press Enter to search\n按回车键搜索'> &nbsp; &nbsp; &nbsp; <button class='btn btn-form btn-warning btn-sm' bid='exportBOM'>Export BOM</button> <button class='btn btn-form btn-primary btn-sm' bid='exportPL'>Export Picklist</button> " + (user.perm.indexOf(6) != -1 ? "<button class='btn btn-form btn-success btn-sm' bid='dlAllDrawings'>Download drawings(pdf)</button><div bid='downProgress'></div> " : "") + "</h5>").append(table);

    var jstt = com_github_culmat_jsTreeTable;
    // $("div[bid=bomcard] table").treetable({
    //     expandable: true,
    //     indent: 5,
    //     clickableNodeNames: false,
    //     expanderTemplate: '<span></span>',
    //     initialState: "collapsed" //Possible values: "expanded" or "collapsed".
    // });

    jstt.treeTable($('div[bid=bomcard] table'))
    $("div[bid=bomcard] table tbody tr td input").each(function () {
        $(this).attr("title", $(this).val());
    });

    $("td[did=Order],td[did=SN]").on("dblclick", function () {
        var code = $(this).parent("tr").find("input[did='Code']").val();
        $("input[bid=bomtop]").val(code);
        $("button[bid=bomSearch]").trigger("click");
    });

    $("button[bid=exportBOM]").click(function () {
        var btn = $(this);
        btn.prop("disabled", true);
        var top = $("input[bid=bomtop]").val().trim();
        var cloneArr = JSON.parse(JSON.stringify(dbom));
        var rdata = [{
            SN: "-",
            Level: "-",
            Order: "-",
            Code: top,
            "PDF.Ver": "-",
            Qty: "-",
            Unit: "-",
            PT: "-",
            Name: codesInfo[top].name,
            Spec: codesInfo[top].spec,
            PFEP: ""
        }];
        var count = 1;
        for (var i in cloneArr) {
            var obj = {};
            obj.SN = count++;
            obj.Level = cloneArr[i].Level;
            obj.Order = cloneArr[i].Order;
            obj.Code = cloneArr[i].Code;
            obj["PDF.Ver"] = cloneArr[i].dversion != null ? "V" + cloneArr[i].dversion : "";
            obj.Qty = cloneArr[i].Qty;
            obj.Unit = cloneArr[i].Unit;
            obj.PT = cloneArr[i].ProchasingType;
            obj.Name = cloneArr[i].Name;
            obj.Spec = cloneArr[i].Spec;
            obj.PFEP = cloneArr[i].PFEP;
            rdata.push(obj);
        }
        var path = require('path');
        var tmppath = app.getPath("temp") + "/SuperTools";
        if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath);

        var toLocalPath = path.resolve(app.getPath("documents"));
        var filepath = path.resolve(tmppath + "/Export-" + moment().format("YYYYMMDD-HHmmss") + ".temp.csv");
        savedata(filepath, rdata, true, function (fp) {
            btn.prop("disabled", false);
        });

    });

    $("button[bid=exportPL]").click(function () {
        var btn = $(this);
        btn.prop("disabled", true);
        var top = $("input[bid=bomtop]").val().trim();
        if (argv[2] == "dev") console.log(shifted)
        var cb = function () {
            btn.prop("disabled", false);
        }
        if (shifted) getPicklist(top, 1, cb);
        else getPicklist(top, 0, cb);
    });

    $("button[bid='dlAllDrawings']").click(function () {
        var alldrawing = confirm("Do you want to include the Assembly Drawing?\n您是否需要一同下载装配图？");
        var dfp = dialog.showOpenDialog(win, {
            properties: ['openDirectory']
        })
        if (!dfp) return;

        var fpath = dfp[0];

        var downArray = [];
        $('div[bid=bomcard] table').find("tr span[bid='dopen']").each(function () {
            var btype = $(this).parents("tr").find("td[bid='ptype']").text();
            if (!alldrawing && btype.trim() == "A") return;
            var code = $(this).attr("code");
            var version = $(this).attr("version");
            var tObj0 = {
                code: code,
                version: version,
                filetype: 0
            }
            var tObj4 = {
                code: code,
                version: version,
                filetype: 4
            }
            var tObj5 = {
                code: code,
                version: version,
                filetype: 5
            }
            if (_.find(downArray, function (obj) {
                    return obj.code == code
                }) == undefined) {
                downArray.push(tObj0);
                downArray.push(tObj4);
                downArray.push(tObj5);
            }
        });
        var downCount = downArray.length;
        if (downCount == 0) {
            popup("No drawing to download.", "danger");
            return;
        }
        var downQty = 0;
        var progressDiv = $("<div class='alert alert-primary' role='alert' style='margin-top:10px;'>Downloading " + (downCount / 3) + " drawings:<br>");
        progressDiv.append('<div class="progress"> <div class="progress-bar" bid="download" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"> 0% </div> </div>');
        $('div[bid=bomcard] div[bid=downProgress]').html("").append(progressDiv);

        function tmpDown(downArray) {
            var data = downArray.splice(0, 1)[0];
            if (!data) return false;
            downloadDrawing(data.code, data.version, fpath, function (rtn) {
                if (argv[2] == "dev") console.log(rtn + " downloaded.")
                var rate = (++downQty / downCount * 100).toFixed(2);
                $('div[bid=bomcard] div[bid=downProgress] div[bid=download]').css("width", rate + "%").attr("aria-valuenow", rate).text(parseInt(downQty / 3) + " Drawings, " + rate + "%");
                if (downQty == downCount) {
                    popup("All drawings have been downloaded!", "success");
                    $('div[bid=bomcard] div[bid=downProgress]').html("");
                } else {
                    tmpDown(downArray);
                }
            }, data.filetype);
        }
        tmpDown(downArray);
    })
    if (completeBomTop) completeBomTop.close();

    $("input[bid='keyword']").on("keydown", function (e) {
        if (e.which == 13) {
            var keyword = $("input[bid='keyword']").val().trim();
            searchKW(keyword);
        }

        function searchKW(keyword) {
            firstTr = [];
            currentIndex = 0;
            table.find("tr[type='bomitem']").each(function () {
                var tr = $(this);
                var code = tr.find("input[did='Code']").val().trim();
                var name = tr.find("input[did='Name']").val().trim();
                var spec = tr.find("input[did='Spec']").val().trim();
                tr.removeClass("selected");
                if (keyword.trim().length == 0) return;
                if (code.indexOf(keyword) != -1 || name.indexOf(keyword) != -1 || spec.indexOf(keyword) != -1) {
                    tr.addClass("selected");
                    firstTr.push(tr);
                }
            });
            if (keyword.trim().length != 0) alert(firstTr.length + " match found.\n F3 for next, F4 for prev.");
            else return;
            if (firstTr.length > 0) {
                $([document.documentElement, document.body]).animate({
                    scrollTop: firstTr[currentIndex].offset().top
                }, 500);
                firstTr[currentIndex].trigger("mouseover");
            }
        }
    })

}

function searchBOM(code) {
    if (code.length <6) return false;

    displayBOM = [];
    if (lastbom && lastbom[0].Code == code) {
        console.log("using cache BOM data;")
        setTimeout(function () {
            displayBOM = lastbom;
            showBOM(displayBOM);
            $("button[bid=bomSearch]").prop("disabled", false);
        }, 500);
        return;
    }
    $("div[bid=bomcard]").html("<h5>Searching BOM, please wait...</h5>");
    sqltext = "WITH CTE AS (SELECT b.*,cast('" + code + "' as varchar(2000)) as pid , lvl=1, convert(FLOAT, b.quantity) as rQty FROM dbo.st_goodsbom as b WHERE goodsid='" + code + "' and startDate<='" + appliedDate + "' and endDate>='" + appliedDate + "' UNION ALL SELECT b.*, cast(c.pid+'.'+b.goodsid as varchar(2000)) as pid, lvl+1, CONVERT(FLOAT, c.quantity*b.quantity) as rQty FROM dbo.st_goodsbom as b INNER JOIN CTE as c ON b.goodsid=c.elemgid where b.startDate<='" + appliedDate + "' and b.endDate>='" + appliedDate + "') SELECT a.*, (select max(b.version) from st_drawings as b where b.code = a.elemgid and b.filetype=0 and b.stat=1) as dversion  FROM CTE as a order by pid asc,itemno asc;";
    executeMsSql(sqltext, (err, result) => {
        console.log("using new BOM data;")
        // ... error checks
        if (result.recordset.length > 0) {
            for (var i in result.recordset) {
                displayBOM.push({
                    Level: result.recordset[i].lvl,
                    Order: result.recordset[i].itemno,
                    Code: result.recordset[i].elemgid,
                    Parent: result.recordset[i].goodsid,
                    Name: codesInfo[result.recordset[i].elemgid].name,
                    Qty: result.recordset[i].quantity,
                    Unit: codesInfo[result.recordset[i].elemgid].unit,
                    Spec: codesInfo[result.recordset[i].elemgid].spec,
                    Warehouse: codesInfo[result.recordset[i].elemgid].warehouse && codesInfo[result.recordset[i].elemgid].warehouse.length > 0 ? codesInfo[result.recordset[i].elemgid].warehouse : "",
                    ProchasingType: result.recordset[i].ptype,
                    PFEP: result.recordset[i].pfep,
                    pid: result.recordset[i].pid,
                    rQty: result.recordset[i].rQty,
                    dversion: result.recordset[i].dversion,
                });
            }
            displayBOM = reOrderBOM(displayBOM, code);
        }
        executeMsSql("select top 1 b.version from st_drawings as b where b.code = '" + code + "' order by b.version desc;", (err, result) => {
            displayBOM.splice(0, 0, {
                Level: 0,
                Order: 1,
                Code: code,
                Parent: "",
                Name: codesInfo[code].name,
                Qty: 0,
                Unit: "",
                Spec: codesInfo[code].spec,
                Warehouse: codesInfo[code].warehouse && codesInfo[code].warehouse.length > 0 ? codesInfo[code].warehouse : "",
                ProchasingType: "",
                PFEP: "",
                pid: "",
                rQty: 0,
                dversion: result.recordset.length == 1 ? result.recordset[0].version : null,

            })
            lastbom = displayBOM;
            showBOM(displayBOM);
            $("button[bid=bomSearch]").prop("disabled", false);
        })

    })
}

function searchParent(code) {
    var sqltxt = "select goodsid from st_goodsbom where elemgid='" + code + "' and startDate<='" + appliedDate + "' and endDate>='" + appliedDate + "' group by goodsid";
    var parentsList = [];
    $("div[bid=parentcard]").html("<h5>Searching parents, please wait...</h5>")
    executeMsSql(sqltxt, (err, result) => {
        // ... error checks

        if (result.rowsAffected == 0) {
            $("div[bid=parentcard]").html("<h5><strong>" + $("input[bid=bomtop]").val() + "</strong> has no parents</h5>");
        } else {
            var count = 1;
            for (var i in result.recordset) {
                parentsList.push({
                    SN: count++,
                    Parent: result.recordset[i].goodsid,
                    Name: codesInfo[result.recordset[i].goodsid].name,
                    Unit: codesInfo[result.recordset[i].goodsid].unit,
                    Spec: codesInfo[result.recordset[i].goodsid].spec
                })
            }

            //data ready, now do table
            var table = $("<table>");
            table.addClass("treetable")
            var thead = $("<thead>");
            thead
                .append("<th style='width:10px'>SN</th>")
                .append("<th style='width:30px'>Code#</th>")
                .append("<th style='width:150px'>Name</th>")
                .append("<th style='width:150px'>Desc</th>")
                .append("<th style='width:20px'>Unit</th>")
            table.append(thead);
            var tbody = $("<tbody>");
            for (var i in parentsList) {
                var tr = $("<tr type='parentitem'>")
                tr
                    .append("<td did='SN'>" + parentsList[i].SN + "</td>")
                    .append("<td><input did='Code' value='" + parentsList[i].Parent + "' readonly></td>")
                    .append("<td><input did='Name' value='" + parentsList[i].Name + "' readonly></td>")
                    .append("<td><input did='Spec' value='" + parentsList[i].Spec + "' readonly></td>")
                    .append("<td>" + parentsList[i].Unit + "</td>");
                tbody.append(tr);
            }
            table.append(tbody);

            $("div[bid=parentcard]").html("<h5><strong>" + $("input[bid=bomtop]").val() + "</strong> Parent(s) list</h5>").append(table);
        }

    })
}

function searchFG(code) {
    $("div[bid=fgcard]").html("<h5>Searching applied Finish Goods, please wait...</h5>");
    var fglist = [];
    var sqltxt = "WITH CTE AS (SELECT b.*,cast('" + code + "' as varchar(2000)) as pid , lvl=1 FROM dbo.st_goodsbom as b WHERE elemgid='" + code + "' and startDate<='" + appliedDate + "' and endDate>='" + appliedDate + "' UNION ALL SELECT b.*, cast(c.pid+'.'+b.goodsid as varchar(2000)) as pid, lvl+1 FROM dbo.st_goodsbom as b INNER JOIN CTE as c ON c.goodsid=b.elemgid where  b.startDate<='" + appliedDate + "' and b.endDate>='" + appliedDate + "') SELECT e.goodsid FROM CTE as e inner join st_bomtop as d on d.goodsid=e.goodsid group by e.goodsid;";
    executeMsSql(sqltxt, (err, result) => {
        // ... error checks

        if (result.rowsAffected == 0) {
            $("div[bid=fgcard]").html("<h5><strong>" + $("input[bid=bomtop]").val() + "</strong> has no applied Finish Good</h5>");
        } else {
            var count = 1;
            for (var i in result.recordset) {
                fglist.push({
                    SN: count++,
                    Parent: result.recordset[i].goodsid,
                    Name: codesInfo[result.recordset[i].goodsid].name,
                    Spec: codesInfo[result.recordset[i].goodsid].spec
                })
            }

            //data ready, now do table
            var table = $("<table>");
            table.addClass("treetable")
            var thead = $("<thead>");
            thead
                .append("<th style='width:10px'>SN</th>")
                .append("<th style='width:30px'>Code#</th>")
                .append("<th style='width:150px'>Name</th>")
                .append("<th style='width:150px'>Desc</th>")
            table.append(thead);
            var tbody = $("<tbody>");
            for (var i in fglist) {
                var tr = $("<tr type='parentitem'>")
                tr
                    .append("<td did='SN'>" + fglist[i].SN + "</td>")
                    .append("<td><input did='Code' value='" + fglist[i].Parent + "' readonly></td>")
                    .append("<td><input did='Name' value='" + fglist[i].Name + "' readonly></td>")
                    .append("<td><input did='Spec' value='" + fglist[i].Spec + "' readonly></td>")
                tbody.append(tr);
            }
            table.append(tbody);

            $("div[bid=fgcard]").html("<h5><strong>" + $("input[bid=bomtop]").val() + "</strong> applied Finish Goods list</h5>").append(table);
        }

    })
}