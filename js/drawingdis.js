$(function () {
    if (drawingCode == 0) {
        alert("No drawing specified");
        return;
    }

    var bCreateNewVersion = true;
    var bReleaseNewVersion = false;
    var beingApproved = false;
    var maxVersion = 0;
    var userlist = [];

    executeMsSql("select a.*,b.opname from st_drawings as a inner join m_operator as b on a.opid = b.opid where code = '" + drawingCode + "' order by a.version desc, a.filetype asc;", (err, result) => {
        if (err) {
            console.error(err);
            alert("An error occur when fetching drawing information.\n" + JSON.stringify(err));
            return;
        }
        //drawingCode = 0;

        // downloadDrawing(drawingCode, false, false, function (fillpath) {
        //     const path = require('path');
        //     var fp = path.normalize(filepath);
        //     console.log(fp);
        //     //$("div.card-body:first").append('<webview src="' + fp + '" style="width:400px;height:300px" plugins></webview>')
        // })

        var v = false;
        var cnt = result.recordset.length;
        var code = drawingCode;
        var div = $("<div>").addClass("card-body");
        var pdiv = $("div[bid=drawings]").html("");

        if (cnt === 0) {

        } else {
            var tables = [];
            var table = $("<table>").addClass("treetable").append($("<thead>").append($("<th>").text("Drawing Type").css("min-width", "300px")).append($("<th>").text("File Name").css("min-width", "300px").attr("tag", "filename")).append($("<th>").text("Update date").css("min-width", "150px")).append($("<th>").text("Owner")).append($("<th>").text("Action").css("min-width", "60px"))).append($("<tbody>"))
            var tmptable;
            for (var i in result.recordset) {
                if (result.recordset[i].stat == 0) {
                    bCreateNewVersion = false;
                    if (result.recordset[i].opid == user.id) bReleaseNewVersion = true;
                }
                if (!beingApproved && (result.recordset[i].stat == 2 || result.recordset[i].stat == 3)){
                    beingApproved = true;
                }
                if (v !== result.recordset[i].version) {
                    maxVersion = Math.max(maxVersion, result.recordset[i].version);
                    if (v !== false) {
                        var tmp_tr = tmptable.find("tbody tr:first");
                        if (parseInt(tmp_tr.attr("stat")) == 0 && parseInt(tmp_tr.attr("opid")) == user.id) {
                            tables.push(tmptable);
                        }
                        if (parseInt(tmp_tr.attr("stat")) == 1) tables.push(tmptable);
                    }
                    tmptable = table.clone();
                    v = result.recordset[i].version;
                    tmptable.attr("version", v);
                }
                var tr = $("<tr>").append($("<td>").text(drawingType[result.recordset[i].filetype].name)).append($("<td>").text(result.recordset[i].filename).attr("name", "filename").attr("tag", "filename")).append($("<td>").text(moment(result.recordset[i].date).utc().format("YYYY-MM-DD HH:mm:ss"))).append($("<td>").text(result.recordset[i].opname));
                tr.attr("sn", result.recordset[i].sn).attr("stat", result.recordset[i].stat).attr("opid", result.recordset[i].opid).attr("code", result.recordset[i].code).attr("filetype", result.recordset[i].filetype).attr("version", result.recordset[i].version).attr("filename", result.recordset[i].filename).attr("filesize", result.recordset[i].filesize).attr("trtype", "drawings");
                if (result.recordset[i].stat == 0) {
                    if (result.recordset[i].opid == user.id) {
                        if (result.recordset[i].filesize != 0 && result.recordset[i].filename != "null") {
                            tr.append($("<td>").html("<span class='iconfont icon-shanchu' bid='ddel' code='" + result.recordset[i].code + "' version='" + result.recordset[i].version + "'></span> <span class='iconfont icon-open' bid='dopen'></span>"))
                        }
                        if (result.recordset[i].filesize == 0 && result.recordset[i].filename == "null") {
                            tr.find("td[name=filename]").html("").append("<button class='btn btn-sm btn-warning' bid='uploadDrawing'>Upload Drawing</button>");
                            tr.append($("<td>").html("-"));
                        }
                    } else tr.append($("<td>").html("-"));
                } else if (result.recordset[i].stat == 1) {
                    tr.append($("<td>").html("<span class='iconfont icon-open' bid='dopen'></span> <span class='iconfont icon-Addtodownload' bid='ddl'></span>"))
                } else if (result.recordset[i].stat == 2) {
                    tr.append($("<td>").text("Being approved"))
                } else if (result.recordset[i].stat == 3) {
                    tr.append($("<td>").append("<font color=red><b>Rejected</b></font> ").append($("<button>").text("Restart").addClass("btn btn-success btn-sm").attr("tag","restart").on("click",function(){
                        if(!confirm("You will withdraw the approval and rework on your drawing. Confirm?")) return;
                        sqltxt = "update st_drawings set stat=0 where code = '"+result.recordset[i].code+"' and version = "+result.recordset[i].version+";";
                        executeMsSql(sqltxt, (e)=>{
                            loadPanel("drawingdis");
                        })
                    })));
                }
                tmptable.find("tbody").append(tr);
            }
            //tmptable.attr("app",Base64.encode(result.recordset[i].flowinfo))
            tables.push(tmptable);

            if (bCreateNewVersion) {
                maxVersion++;
            }
        }



        if (bCreateNewVersion && user.perm.indexOf(8) != -1 && !beingApproved) {
            pdiv.append(div.clone().append("<button class='btn btn-primary' version='" + maxVersion + "' code='" + drawingCode + "' bid='newVersion'>Create Version " + maxVersion + "</button>"));
            $("button[bid=newVersion]").click(function () {
                if (!confirm("Are you sure to create a new version?")) return;
                var btn = $(this);
                btn.prop("disabled", true);
                var nv = btn.attr("version");
                var code = btn.attr("code");
                sqltxt = "insert into st_drawings (code, version, filename, filetype, filesize, date, opid, size) values ";
                for (var i in drawingType) {
                    sqltxt += "('" + code + "', " + nv + ", 'null', " + i + ", 0, GETDATE(), " + user.id + ", '-')";
                    if (i < drawingType.length - 1) sqltxt += ",";
                }
                sqltxt += ";";
                executeMsSql(sqltxt, function () {
                    loadPanel("drawingdis");
                })
            })

        }
        if (!bCreateNewVersion && !bReleaseNewVersion) {
            pdiv.append(div.clone().append("<h5>New version is being modified!</h5>"));

        }
        if (!bCreateNewVersion && bReleaseNewVersion && user.perm.indexOf(8) != -1) {
            pdiv.append(div.clone().append("<button class='btn btn-success' version='" + maxVersion + "' code='" + drawingCode + "' bid='releaseVersion'>Release Version " + maxVersion + "</button> <button class='btn btn-danger' version='" + maxVersion + "' code='" + drawingCode + "' bid='cancelVersion'>Cancel Version " + maxVersion + "</button>"));

            $("button[bid=cancelVersion]").click(function () {
                if (!confirm("Your temp drawings will be DELETED!\nAre you sure to cancel drawing change?")) return;

                var btn = $(this);
                btn.prop("disabled", true);
                var nv = btn.attr("version");
                var code = btn.attr("code");
                sqltxt = "delete from st_drawings where code = '" + code + "' and version = " + nv + " and stat = 0 ;";
                var table = $("table[version=" + nv + "]");
                var dsn = [];
                table.find("tr[trtype=drawings]").each(function () {
                    if ($(this).attr("filesize") != "0" && $(this).attr("filename") != "null") dsn.push($(this).attr("sn"))
                })
                var mysqltxt = "delete from st_drawings where ";
                for (var g in dsn) {
                    mysqltxt += "dsn = " + dsn[g];
                    if (g < dsn.length - 1) mysqltxt += " or ";
                }
                mysqltxt += ";"
                executeMsSql(sqltxt, function () {
                    var mysql = require('mysql');
                    var connection = mysql.createConnection({
                        host: config.mysqlServer,
                        user: config.serverconfig.user,
                        password: config.serverconfig.password,
                        database: config.serverconfig.user
                    });
                    connection.connect();
                    if (dsn.length > 0) connection.query(mysqltxt);
                    loadPanel("drawingdis");
                })
            })

            $("button[bid=releaseVersion]").click(function () {
                var btn = $(this);
                var nv = btn.attr("version");
                var table = $("table[version=" + nv + "]");
                var dsn = [];
                var esn = [];
                var tr = [];
                table.find("tr[trtype=drawings]").each(function () {
                    var data = $(this).attr();
                    data.sn = parseInt(data.sn);
                    data.filesize = parseInt(data.filesize);
                    data.filetype = parseInt(data.filetype);
                    data.version = parseInt(data.version);
                    if ($(this).attr("filesize") != "0" && $(this).attr("filename") != "null") dsn.push($(this).attr("sn"))
                    if ($(this).attr("filesize") == "0" && $(this).attr("filename") == "null") esn.push($(this).attr("sn"))
                    tr.push(data);
                });
                if (dsn.length <= 0) {
                    alert("No drawing to release!\nPlease upload drawing or CANCEL version update.");
                    return false;
                }

                var checkmatch = [0, 1, 3];
                for (var a in checkmatch) {
                    var filematch = _.findWhere(tr, {
                        filetype: checkmatch[a],
                    })
                    console.log(a, filematch, tr)
                    if (filematch === undefined || filematch.filesize == 0) {
                        if (!confirm("There is no " + drawingType[checkmatch[a]].name + " in this version.\nAre you sure?")) {
                            return;
                        }
                    }
                }

                var dlg = $("div.approval.modal");
                console.log(dlg)
                dlg.modal({
                    escapeClose: true,
                    clickClose: true,
                    showClose: true
                });
                dlg.find("input[bid='checkedby']").focus();

                dlg.find("button[tag=submit]").off("click").on("click", function () {
                    if (!confirm("Last Chance!!!\nYour new version will be go through approval flow after you confirm this dialog!")) {
                        return;
                    }
                    var checked = dlg.find("input[bid=checkedby]").val().trim();
                    var approved = dlg.find("input[bid=approvedby]").val().trim();
                    var checkedid = checked,
                        approvedid = approved;
                    for (var i in userlist) {
                        if (userlist[i].value == checked) checkedid = userlist[i].optval;
                        if (userlist[i].value == approved) approvedid = userlist[i].optval;
                    }
                    if (checkedid == checked || approvedid == approved) {
                        alert("Please check if checked by or approved by user existed");
                        return;
                    }
                    if(checkedid == user.id || approvedid == user.id){
                        alert("You cannot set yourself as checker or approver!");
                        return;
                    }
                    if(checkedid == approvedid){
                        alert("You cannot set same person as checker or approver!");
                        return;
                    }
                    console.log(checkedid, approvedid)
                    $.modal.close();

                    sqltxt = "delete from st_approval where code='" + drawingCode + "' and version=" + maxVersion + " and stat=0; update st_drawings set stat=2 where sn = -1 ";
                    for (var i in dsn) {
                        sqltxt += "or sn = " + dsn[i];
                    }
                    sqltxt += "; delete from st_drawings where sn = -1  ";
                    for (var g in esn) {
                        sqltxt += "or sn = " + esn[g];
                    }
                    sqltxt += ";";
                    executeMsSql(sqltxt);
                    var history = [{
                        type: "check",
                        opid: checkedid,
                        date: false,
                        result: 0,
                        comment: ''
                    }, {
                        type: "approve",
                        opid: approvedid,
                        date: false,
                        result: 0,
                        comment: ''
                    }];
                    sqltxt = "insert into st_approval (code, version, date, flownext, flowinfo, data, stat) values ('" + drawingCode + "', " + maxVersion + ", GETDATE(), '" + checkedid + "', '" + JSON.stringify(history) + "', '{\"author\":" + user.id + "}', 0);";
                    executeMsSql(sqltxt, function (err) {
                        if (err) throw err;
                        loglog("ReleaseNewDrawingVersion", '{"DrawingNumber":"' + drawingCode + '", "NewVersion":' + maxVersion + ', "DrawingSN":' + JSON.stringify(dsn) + '}');
                        loadPanel("drawingdis");
                    });

                });

                return;
            });
        }

        executeMsSql("select * from st_approval where code = '" + drawingCode + "' order by version asc, [date] asc;", (err, r) => {
            //console.log(err,result)
            var approvals = {};
            for (var x in r.recordset) {
                if ("v" + r.recordset[x].version in approvals) approvals["v" + r.recordset[x].version].push(r.recordset[x]);
                else
                    approvals["v" + r.recordset[x].version] = [r.recordset[x]];
            }
            console.log(approvals)
            for (var m in tables) {
                pdiv.append(div.clone().append("<h5> Drawings of <b>" + code + "</b> Version <b>" + tables[m].attr("version") + "</b></h5>").append(tables[m]));

                var v = "v" + tables[m].attr("version")
                var ff = true; //flag of first;
                if (v in approvals) {
                    for (var i = approvals[v].length - 1; i >= 0; i--) {
                        var tabtmp = $("<table>").addClass("table").addClass("table-bordered").addClass("table-sm").css("width", "60%");
                        tabtmp.append($("<thead>").append($("<tr>").append($("<th>").text("Category")).append($("<th>").text("Name")).append($("<th>").text("Result")).append($("<th>").text("Date/Time")).append($("<th>").text("Comment"))))
                        var tbody = $("<tbody>")
                        var flowinfo = JSON.parse(approvals[v][i].flowinfo);
                        var fp = true; //processing flag
                        var fr = false; //reject flag
                        for (var n in flowinfo) {
                            var tr = $("<tr>").append($("<th>").css("width", "100px").text(flowinfo[n].type)).append($("<td>").css("width", "80px").text(userlistall[flowinfo[n].opid])).append($("<td>").css("width", "100px").html(flowinfo[n].result == 0 && fp ? "processing" : ((flowinfo[n].result == 0 && (!fp || fr)) ? "not started" : (flowinfo[n].result == 1 ? "<b><font color=green>Approved</font></b>" : "<b><font color=red>Rejected</font></b>")))).append($("<td>").text(!flowinfo[n].date ? "" : flowinfo[n].date).css("width", "150px")).append($("<td>").text(flowinfo[n].comment))
                            tbody.append(tr);
                            if (fp && flowinfo[n].result == 0) fp = false;
                            if (!fr && flowinfo[n].result == 2) {
                                fr = true;
                                fp = false
                            }
                        }
                        tabtmp.append(tbody);
                        var tdiv = $("<div>").css("margin-left", "20px").attr("v",v);
                        tdiv.append("<h6 style='display:inline-block; margin-right:20px;'>Approval history #" + (i + 1) + " for version " + tables[m].attr("version") + "</h6>");
                        if (ff) {
                            tdiv.attr("tag", "first");
                            ff = false;
                            if(approvals[v].length>1) tdiv.append($("<button>").addClass("btn btn-warning btn-sm").text("Approval History").on("click", function(){
                                pdiv.find("div[tag=nonfirst][v="+v+"]").toggle("slow");
                            }));
                        } else {
                            tdiv.attr("tag", "nonfirst").css("display","none");
                        }
                        tdiv.append(tabtmp);
                        pdiv.append(tdiv);
                    }
                }
            }

            pdiv.find("button[bid=uploadDrawing]").on("click", function () {
                var btn = $(this);
                var tr = $(this).parents("tr[trtype=drawings]");
                var data = tr.attr();
                data.filetype = parseInt(data.filetype);
                data.filesize = parseInt(data.filesize);
                data.sn = parseInt(data.sn);

                var fs = require("fs");
                var path = require('path');
                var toLocalPath = path.resolve(app.getPath("documents"));
                var filepath = dialog.showOpenDialog({
                    defaultPath: toLocalPath,
                    title: 'Open ' + drawingType[data.filetype].name + ' for ' + data.code,
                    filters: [{
                        name: drawingType[data.filetype].name,
                        extensions: drawingType[data.filetype].ext
                    }]
                });
                if (!filepath) return;
                if (!fs.existsSync(filepath[0])) return;
                var info = fs.statSync(filepath[0]);
                var filename = path.basename(filepath[0]);
                var filedata = fs.readFileSync(filepath[0]);
                query = "INSERT INTO st_drawings SET ? ";
                value = {
                    dsn: data.sn,
                    data: filedata
                }

                var mysql = require('mysql');
                var connection = mysql.createConnection({
                    host: config.mysqlServer,
                    user: config.serverconfig.user,
                    password: config.serverconfig.password,
                    database: config.serverconfig.user
                });
                connection.query(query, value, function (error, results, fields) {
                    if (error) throw error;
                    sqltxt = "update st_drawings set filename='" + filename + "', filesize=" + info.size;
                    if (/(.)*\_[SV][0-9]+\_[AB][0-9]\_(.)*\.[a-zA-Z]+/g.test(filename)) {
                        var sizepos = filename.search(/\_[AB][0-9]\_/g);
                        var sizelength = filename.indexOf("_", sizepos + 1) - sizepos - 1;
                        var size = filename.substr(sizepos + 1, sizelength)
                        sqltxt += ", size = '" + size + "'";
                    }
                    sqltxt += " where sn = " + data.sn;
                    executeMsSql(sqltxt, function (error) {
                        loadPanel("drawingdis");
                    })
                });
            })

            pdiv.find("span[bid=ddel]").click(function () {
                if (!confirm("Are you sure to remove the draft drawing?")) return;
                var btn = $(this);
                var tr = $(this).parents("tr[trtype=drawings]");
                var data = tr.attr();
                data.filetype = parseInt(data.filetype);
                data.filesize = parseInt(data.filesize);
                data.sn = parseInt(data.sn);
                var query = "delete from st_drawings where dsn=" + data.sn + ";";
                var mysql = require('mysql');
                var connection = mysql.createConnection({
                    host: config.mysqlServer,
                    user: config.serverconfig.user,
                    password: config.serverconfig.password,
                    database: config.serverconfig.user
                });
                connection.query(query, value, function (error, results, fields) {
                    sqltxt = "update st_drawings set filename='null', filesize=0, size='-' where sn = " + data.sn + ";";
                    executeMsSql(sqltxt, function (err) {
                        if (err) throw err;
                        loadPanel("drawingdis");
                    })
                });
            });

            pdiv.find("span[bid=ddl]").css("cursor", "pointer").click(function () {

                var tbody = $(this).parents("tbody");
                var code = $(this).parents("tr").attr("code");
                var version = $(this).parents("tr").attr("version");
                var filetype = $(this).parents("tr").attr("filetype");
                var filename = $(this).parents("tr").attr("filename");
                var stat = $(this).parents("tr").attr("stat");
                var sn = $(this).parents("tr").attr("sn");
                var btn = $(this);
                var path = require("path");

                var filepath = dialog.showSaveDialog({
                    title: 'Save as ' + code + ' drawing ',
                    filters: [{
                        name: drawingType[filetype].name,
                        extensions: [path.extname(filename).split(".").join("")]
                    }]
                });
                if (!filepath) return;

                btn.hide();
                downloadDrawing(code, version, filepath, function (fp) {
                    // const {
                    //     shell
                    // } = require('electron');
                    // // Open a local file in the default app
                    // shell.openItem(fp);
                    btn.show();
                }, filetype, true);
            });
            pdiv.find("span[bid=dopen]").css("cursor", "pointer").click(function () {
                var tbody = $(this).parents("tbody");
                var code = $(this).parents("tr").attr("code");
                var version = $(this).parents("tr").attr("version");
                var filetype = $(this).parents("tr").attr("filetype");
                var filename = $(this).parents("tr").attr("filename");
                var stat = $(this).parents("tr").attr("stat");
                var sn = $(this).parents("tr").attr("sn");
                var btn = $(this);
                btn.hide();
                if (parseInt(filetype) == 0 || parseInt(filetype) == 2 || parseInt(filetype) == 4 || parseInt(filetype) == 5 || parseInt(filetype) == 6) {
                    displayDrawing(code, version, function (rtn) {
                        if (!rtn.err) btn.show();
                        else alert(rtn.err)
                    }, filetype);
                } else if (parseInt(filetype) == 1) {
                    var ext = filename.split('.').pop().toLowerCase();
                    if (ext == "slddrw") { //incase of solidworks, 3D file needed.
                        var tr = tbody.find("tr[filetype=3]");
                        if (!tr) {
                            alert("Cannot find any 3D sldasm or sldprt file for this 2D drawing.");
                            return;
                        }
                        var dd = [{
                            code: code,
                            version: version,
                            path: false,
                            filetype: 1
                        }, {
                            code: code,
                            version: version,
                            path: false,
                            filetype: 3
                        }]
                        downloadDrawingList(dd, function (fp) {
                            console.log(fp)
                            const {
                                shell
                            } = require('electron');
                            // Open a local file in the default app
                            shell.openItem(fp.drw.pop());
                            btn.show();
                        })

                    } else {
                        downloadDrawing(code, version, false, function (fp) {
                            const {
                                shell
                            } = require('electron');
                            // Open a local file in the default app
                            shell.openItem(fp);
                            btn.show();
                        }, 1);
                    }
                }

            });

            if (bCreateNewVersion) {
                pdiv.find("th[tag=filename]").hide();
                pdiv.find("td[tag=filename]").hide();
                console.log(pdiv.find("th[tag=filename]"))
            }
        })


    });

    executeMsSql("select opname,opid from m_operator where isuse = 0 order by opname collate Chinese_PRC_CI_AS", (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        for (var m in result.recordset) {
            userlist.push({
                label: result.recordset[m].opname,
                value: result.recordset[m].opname,
                optval: result.recordset[m].opid
            })
        }
        new Awesomplete("input[bid=checkedby]", {
            list: userlist,
            minChars: 0,
            maxItems: 5,
        });
        new Awesomplete("input[bid=approvedby]", {
            list: userlist,
            minChars: 0,
            maxItems: 5,
        });
    });
})