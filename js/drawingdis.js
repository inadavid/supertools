(function (old) {
    $.fn.attr = function () {
        if (arguments.length === 0) {
            if (this.length === 0) {
                return null;
            }

            var obj = {};
            $.each(this[0].attributes, function () {
                if (this.specified) {
                    obj[this.name] = this.value;
                }
            });
            return obj;
        }

        return old.apply(this, arguments);
    };
})($.fn.attr);

$(function () {
    if (drawingCode == 0) {
        alert("No drawing specified");
    }

    var bCreateNewVersion = true;
    var maxVersion = 0;

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
        var code = result.recordset[0].code;
        var div = $("<div>").addClass("card-body");
        var tables = [];
        var table = $("<table>").addClass("treetable").append($("<thead>").append($("<th>").text("Drawing Type").css("min-width", "300px")).append($("<th>").text("File Name").css("min-width", "300px")).append($("<th>").text("Update date").css("min-width", "150px")).append($("<th>").text("Owner")).append($("<th>").text("Action").css("min-width", "60px"))).append($("<tbody>"));
        var tmptable;
        for (var i in result.recordset) {
            if (result.recordset[i].stat == 0) bCreateNewVersion = false;
            if (v !== result.recordset[i].version) {
                maxVersion = Math.max(maxVersion, result.recordset[i].version);
                if (v !== false) {
                    var tmp_tr = tmptable.find("tbody tr:first");
                    if (parseInt(tmp_tr.attr("stat")) == 0 && parseInt(tmp_tr.attr("opid")) == user.id) tables.push(tmptable);
                    if (parseInt(tmp_tr.attr("stat")) == 1) tables.push(tmptable);
                }
                tmptable = table.clone();
                v = result.recordset[i].version;
                tmptable.attr("version", v);
            }
            var tr = $("<tr>").append($("<td>").text(drawingType[result.recordset[i].filetype].name)).append($("<td>").text(result.recordset[i].filename).attr("name", "filename")).append($("<td>").text(moment(result.recordset[i].date).utc().format("YYYY-MM-DD HH:mm:ss"))).append($("<td>").text(result.recordset[i].opname));
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
                tr.append($("<td>").html("<span class='iconfont icon-open' bid='dopen'></span>"))
            }
            tmptable.find("tbody").append(tr);
        }
        tables.push(tmptable);

        var pdiv = $("div[bid=drawings]").html("");

        if (bCreateNewVersion && user.perm.indexOf(7) != -1) {
            maxVersion++;
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
        if (!bCreateNewVersion && user.perm.indexOf(7) != -1) {
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
                btn.prop("disabled", true);
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
                    btn.prop("disabled", false);
                    return false;
                }

                var checkmatch = [0, 1, 3];
                for (var a in checkmatch) {
                    var filematch = _.findWhere(tr, {
                        filetype: checkmatch[a],
                    })
                    if (filematch.filesize == 0) {
                        if (!confirm("There is no " + drawingType[checkmatch[a]].name + " in this version.\nAre you sure?")) {
                            btn.prop("disabled", false);
                            return;
                        }
                    }
                }

                sqltxt = "update st_drawings set stat=1 where ";
                for (var i in dsn) {
                    sqltxt += "sn = " + dsn[i];
                    if (i < dsn.length - 1) sqltxt += " or ";
                }
                sqltxt += "; delete from st_drawings where ";
                for (var g in esn) {
                    sqltxt += "sn = " + esn[g];
                    if (g < esn.length - 1) sqltxt += " or ";
                }
                sqltxt += ";";
                if (!confirm("Last Chance!!!\nYour new version will be released to EVERYBODY after you confirm this!")) {
                    btn.prop("disabled", false);
                    console.log(sqltxt)
                    return;
                }
                executeMsSql(sqltxt, function (err) {
                    if (err) throw err;
                    loglog("ReleaseNewDrawingVersion", '{"DrawingNumber":"' + drawingCode + '", "NewVersion":' + maxVersion + ', "DrawingSN":' + JSON.stringify(dsn) + '}');
                    loadPanel("drawingdis");
                })
            });
        }

        for (var m in tables) {
            pdiv.append(div.clone().append("<h5> Drawings of <b>" + code + "</b> Version <b>" + tables[m].attr("version") + "</b></h5>").append(tables[m]));
        }

        pdiv.find("button[bid=uploadDrawing]").click(function () {
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
            if (parseInt(filetype) == 0) {
                displayDrawing(code, version, function (rtn) {
                    if (!rtn.err) btn.show();
                    else alert(rtn.err)
                }, 0);
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
    });
})