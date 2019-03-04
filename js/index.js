var _ = require("underscore");
var appPath = require("electron").remote.getGlobal("appPath");
var argv = require("electron").remote.getGlobal("argv");
const dialog = require('electron').remote.dialog;
const app = require('electron').remote.app;
const clipboard = require('electron').remote.clipboard;
const moment = require('moment');
const sql = require('mssql');
var co = require('co');
var cosql = require('co-mssql');
const {
    ipcRenderer
} = require('electron')
if (Base64 == null) var Base64 = require('js-base64').Base64;
var win = require("electron").remote.getCurrentWindow();
const fs = require('fs');
const ini = require('ini');
var configFile = appPath + '/config.ini';
if (argv[2] != "dev") configFile = appPath + '/../config.ini';
var config = ini.parse(fs.readFileSync(configFile, 'utf-8'));


var action = "dashboard";
var bomexcel_arr = [];
var bom = [];
var bom_top;
var codesInfo = {};
var codesList = [];
var bomtopList = [];
const ptypeList = {
    "B": "Buy from supplier",
    "A": "Assemble in house",
    "P": "Buy and PUSH to other supplier",
    "N": "Supplier by from appointed sub-supplier",
    "F": "Supplier by from any sub-supplier",
    "C": "Created temp material during manufacturing",
    "V": "Virtual material physically",
    "M": "Manufactured in hourse"
};
var ptypeKeys = _.keys(ptypeList);
var user = {};
var ecosn = 0;
const rejectTimeDiff = 30; //30min time difference allowed.
var allcodesHint = [];
var shifted = false;
var drawingCode = 0;

function updateUserinfo() {
    $("a[bid=userinfo]").text("User:" + user.name + "; UID:" + user.id)
}

$(() => {
    document.getElementById('passwd').focus();
    $("div[bid=sidebar] a[perm!=0]").hide();
    $("div.login_form input[tag=userid]").val(config.userid);
    if (argv[2] != "dev") {
        $("#login_form").modal({
            escapeClose: false,
            clickClose: false,
            showClose: false
        });
    } else {
        user.id = 54;
        user.name = "魏亮";
        user.perm = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        updateUserinfo();
    }

    config.fSQLserver = 0;
    win.show();
    if (argv[2] == "dev") win.maximize();
    document.title += " - " + require("electron").remote.getGlobal("version");
    tryHost(0);

    if (!require("electron").remote.getGlobal("flashClosed")) require("electron").remote.getGlobal("flash").close();
});

$(document).on("keydown", function (e) {
    if (e.which == 16) shifted = true;
})
$(document).on("keyup", function (e) {
    shifted = false;
})

$("div[bid=sidebar] a").on("click", (e) => {
    var ts = $(e.currentTarget)
    if (ts.attr("href") == "#") {
        popup("Under construction...", "warning");
        return false;
    }
    if (ts.attr("href") == "debug") {
        require("electron").remote.getCurrentWebContents().openDevTools();
        return false;
    }
    $("div[bid=sidebar] a").removeClass("active");
    ts.addClass("active");
    action = ts.attr("href");
    loadPanel(action);
    return false;
});

$("div.login_form input[tag=passwd]").on("keydown", function (event) {
    if (event.which == 13) $("div.login_form button.btn-success").trigger("click");
})

$("div.login_form button.btn-success").on("click", function () {
    var userid = $("div.login_form input[tag=userid]").val().trim();
    var passwd = $("div.login_form input[tag=passwd]").val().trim();
    if (userid.length == 0 || passwd.length == 0) {
        popup("请正确输入与用户或密码", "danger");
        return;
    }
    if (config.fSQLserver <= 1) {
        popup("数据库连接中，请等待！");
        return;
    }
    if (config.fSQLserver == 3) {
        popup("数据库连接失败！请重启程序再试");
        return;
    }
    $("div.login_form button.btn-success").prop("disabled", true);
    var now = moment().format("YYYY-MM-DD HH:mm:ss");
    sqlt = "select win8,opid,(SELECT cast(getdate() - cast('" + now + "' as datetime) as float)*60*24) as timediff from m_operator where opname='" + userid + "' and oppassword='" + passwd + "'";
    config.userid = userid;
    fs.writeFileSync(configFile, ini.stringify(config));
    new sql.Request().query(sqlt, (err, result) => {
        // ... error checks
        console.dir(result)
        if (result.rowsAffected == 0) {
            popup("用户名或密码错误，请检查后再试。", "danger");
            $("div.login_form button.btn-success").prop("disabled", false);
        } else {
            if (Math.abs(result.recordset[0].timediff) > rejectTimeDiff) {
                popup("请检查本地电脑的时间!!", "danger");
                return;
            }
            $.modal.close();
            user.id = result.recordset[0].opid;
            user.perm = eval('(' + result.recordset[0].win8 + ')');
            user.name = userid;
            updateUserinfo();
            updatePerminfo();
        }
    })
});

$("a[bid='SQLServerStatus']").on("dblclick", function () {
    if (config.fSQLserver == 4) {
        const filepath = appPath + "/db/codes.txt";
        fs.unlink(filepath, function (err) {
            if (err) console.error(err)
        });
        config.fSQLserver = 2;
        codesInfo = {};
        codesList = [];
        updateSQLserver();
        fetchAllCodes();
        popup("Refreshing code database!");
    }
})

if (argv[2] == "dev") $("a[bid='userinfo']").on("dblclick", function () {
    win.reload();
})

function loadPanel(pname) {
    action = pname;
    $("div[bid=main]").load(pname + ".html");
    $("div[bid=sidebar] a").removeClass("active");
    $("div[bid=sidebar] a[href=" + pname + "]").addClass("active");
}

function selectKey(sel, key) {
    var options = sel.find("option");
    for (var i in options) {
        options[i] = $(options[i]);
        if (options[i].text().toLowerCase().indexOf(key.toLowerCase()) != -1) {
            options[i].prop('selected', true);
            return;
        }
    }
}

function tryHost(c) {
    var ping = require('ping');
    if (c >= config.serverlist.length) {
        config.fSQLserver = -1;
        updateSQLserver();
    } else {
        config.SQLserver = config.serverlist[c];
        updateSQLserver();
        ping.promise.probe(config.SQLserver).then(function (res) {
            if (res.alive) {
                config.fSQLserver = 1;
                config.serverconfig.server = config.SQLserver;
                updateSQLserver();
                connectSQLserver();
            } else {
                return tryHost(c + 1)
            }
        });
    }
}

function updateSQLserver() {
    var a = $("a[bid=SQLServerStatus]");
    var text = config.SQLserver + " ";
    switch (config.fSQLserver) {
        case -1:
            text = "所有服务器连接失败！";
            break;
        case 0:
            text += "连接中……";
            break;
        case 1:
            text += "服务器在线";
            break;
        case 2:
            text += "数据库已连接,获取物料号信息";
            break;
        case 3:
            text += "数据库连接失败";
            break;
        case 4:
            text += "系统准备完毕！";
            break;
        default:
            text = "连接初始化";
    }
    a.text(text);
    if (config.fSQLserver == -1 || config.fSQLserver == 3) a.addClass("list-group-item-danger");
    if (config.fSQLserver == 4) a.addClass("list-group-item-success");
    fs.writeFileSync(configFile, ini.stringify(config));
}

function connectSQLserver() {
    sql.connect(config.serverconfig, err => {
        if (err) {
            config.fSQLserver = 3;
        } else {
            config.fSQLserver = 2;
            fetchAllCodes();
        }
        updateSQLserver();
        if (argv[2] == "dev") updatePerminfo();
        $("div.login_form input[tag=passwd]").prop("disabled", false).focus();
        // console.log(err)
        // new sql.Request().query("select goodsid from dbo.l_goods where code = '1101001010';", (err, result) => {
        //   // ... error checks
        //   console.dir(result)
        // })
    });
}

function popup(html, cl = "primary", timeout = 5000) {
    var dlg = $("div[bid=popUp]");
    dlg.html(html);
    dlg.removeClass().addClass("alert alert-" + cl);
    dlg.css("position", "absolute");
    var top = Math.max(0, (($(window).height() - dlg.outerHeight()) / 2) +
        $(window).scrollTop()) + "px";
    var left = Math.max(0, (($(window).width() - dlg.outerWidth()) / 2) +
        $(window).scrollLeft()) + "px"
    dlg.css("top", top);
    dlg.css("left", left);
    dlg.show("slow");
    setTimeout(() => {
        dlg.hide("slow")
    }, timeout);
}


function getCodesInfo(codes, cb) {
    var rtn = {
        err: false
    }
    var filter = [];
    for (var m in codes) {
        codes[m] = 0;
        if (codesList.indexOf(m) == -1) filter.push(m);
        else codes[m] = codesInfo[m].goodsid;
    }
    if (filter.length != 0) {
        rtn.err = 1;
        rtn.errMsg = "物料号在ERP里不存在。";
        rtn.data = filter;
    }
    rtn.codes = codes;
    cb(rtn);

}


function fetchAllCodes() {
    var flag = false;
    const filepath = appPath + "/db/codes.txt";
    if (!fs.existsSync(filepath)) {
        if (argv[2] == "dev") fs.writeFileSync(filepath, "eyJjb2Rlc0luZm8iOnt9LCJjb2Rlc0xpc3QiOltdfQ==");
        flag = true;
    } else {
        var data = JSON.parse(Base64.decode(fs.readFileSync(filepath)));
        if (data.codesInfo) codesInfo = data.codesInfo;
        if (data.codesList) codesList = data.codesList;
        if (codesList.length < 100) flag = true;
        else {
            config.fSQLserver = 4;
            updateSQLserver();
        }
    }

    if (argv[2] != "dev" || flag) {
        sqltxt = "select dbo.l_goods.goodsid,dbo.l_goods.code,dbo.l_goods.name,dbo.l_goods.specs,dbo.l_goodsunit.unitname from dbo.l_goods inner join l_goodsunit on l_goods.goodsid=l_goodsunit.goodsid and l_goods.unitid=l_goodsunit.unitid ;";
        var request = new sql.Request();
        request.query(sqltxt, function (err, recordset) {
            // ... error checks
            var rs = recordset.recordset;
            for (var i in rs) {
                codesList.push(rs[i].code);
                codesInfo[rs[i].code] = {
                    goodsid: rs[i].goodsid,
                    name: rs[i].name,
                    spec: rs[i].specs,
                    unit: rs[i].unitname,
                }
            }
            console.log(codesList.length)

            if (argv[2] == "dev") fs.writeFileSync(filepath, Base64.encode(JSON.stringify({
                codesInfo: codesInfo,
                codesList: codesList
            })));
            config.fSQLserver = 4;
            updateSQLserver();
        });

    }
}


function data2csv(data = null, columnDelimiter = ",", lineDelimiter = "\n") { // convert an array of objects to csv string.
    let result, ctr, keys

    if (data === null || !data.length) {
        return false;
    }

    keys = Object.keys(data[0])

    result = ""
    result += keys.join(columnDelimiter)
    result += lineDelimiter

    data.forEach(item => {
        ctr = 0
        keys.forEach(key => {
            if (ctr > 0) {
                result += columnDelimiter
            }

            result += typeof item[key] === "string" && item[key].includes(columnDelimiter) ? `"${item[key]}"` : item[key]
            ctr++
        })
        result += lineDelimiter
    })

    return result
}

function savedata(filepath, data, open = false) {
    var msExcelBuffer = Buffer.concat([
        new Buffer.from('\xEF\xBB\xBF', 'binary'),
        new Buffer.from(data2csv(data))
    ]);
    var fs = require("fs");
    fs.writeFile(filepath, msExcelBuffer, function (err) {
        if (!err) {
            if (open) {
                const {
                    shell
                } = require('electron');
                // Open a local file in the default app
                shell.openItem(filepath);
            } else {
                popup("CVS file exported successfully!", "success");
            }
        } else popup(err, "danger");
    });

}

ipcRenderer.on('win-menu-toggle-sidebar', (event, arg) => {
    $('div[bid="sidebar"]').toggle(500);
})

function ecoID(sn) {
    return sn < 10 ? "ECO-000" + sn : (sn < 100 ? "ECO-00" + sn : (sn < 1000 ? "ECO-0" + sn : "ECO-" + sn));
}

function IDeco(id, n = 4) {
    if (id.length == 8 && id.substr(0, 4) == "ECO-") {
        return parseInt(id.substr(4, n));

    } else return false;
}

function updatePerminfo() {
    $("div[bid=sidebar] a[perm]").each(function () {
        if (user.perm.indexOf(parseInt($(this).attr("perm"))) == -1) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
    $("div[bid=sidebar] div.list-group").each(function () {
        if ($(this).find("a[perm]:visible").length == 0) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
    loadPanel($("div[bid=sidebar] a[perm]:visible:first-child").attr("href"));
}

function loglog(action, remark) {
    opid = user.id;
    var sqlt = "insert into st_log (opid, action, remark, [date]) values (" + opid + ", '" + action + "', '" + Base64.encode(remark) + "', getdate());";
    new sql.Request().query(sqlt, (err, result) => {
        console.log("sql executed:", sqlt);
    });
}

function checkPicklistUpdate(eco = false) {
    co(function* () {
        try {
            var picklistUpdate = [];
            var coConn = new cosql.Connection(config.serverconfig);
            yield coConn.connect();
            var request = new cosql.Request(coConn);
            var sqltxt = "select * from st_picklists; ";

            var picklists = yield request.query(sqltxt);


            sqltxt = " select * from st_bomeco where ";
            if (eco && typeof (eco) === "number") sqltxt += " sn = " + eco + " and ";
            sqltxt += " status = 1;"
            var ecolists = yield request.query(sqltxt);
            var finalSQL = "update st_bomeco set status = 2 where sn = 0"
            for (var k in ecolists) {
                //select all relevant parents that connected to relevant picklist codes.
                sqltxt = "WITH CTE AS (SELECT b.*,cast('" + ecolists[k].parentgid + "' as varchar(2000)) as pid , lvl=1 FROM dbo.st_goodsbom as b WHERE goodsid='" + ecolists[k].parentgid + "' UNION ALL SELECT b.*, cast(c.pid+'.'+b.goodsid as varchar(2000)) as pid, lvl+1 FROM dbo.st_goodsbom as b INNER JOIN CTE as c ON b.goodsid=c.elemgid) select c.goodsid from CTE as c where ";
                for (var j in picklists) {
                    sqltxt += " c.goodsid='" + picklists[j].code + "' or ";
                }
                sqltxt += " c.goodsid='' group by c.goodsid;";
                var tmprs = yield request.query(sqltxt);
                for (var l in tmprs)
                    if (picklistUpdate.indexOf(tmprs[l].goodsid) == -1) picklistUpdate.push(tmprs[l].goodsid);
                finalSQL += " or sn = " + ecolists[k].sn;
            }
            finalSQL += "; update st_picklists set reflag =1 where code = '' ";
            for (var m in picklistUpdate) finalSQL += " or code = '" + picklistUpdate[m] + "' ";
            finalSQL += ";";
            yield request.query(finalSQL);
        } catch (ex) {
            // ... error checks
            console.error(ex)
        }
    })();
}

function getPicklist(code, type = 0) {
    var data = co(function* () {
        try {
            var coConn = new cosql.Connection(config.serverconfig);
            yield coConn.connect();
            var appliedDate = moment().format("YYYY-MM-DD");
            var request = new cosql.Request(coConn);

            var rdata = [];
            var sqltxt = "WITH CTE AS (SELECT b.*,cast('" + code + "' as varchar(2000)) as pid , lvl=1, convert(FLOAT, b.quantity) as rQty FROM dbo.st_goodsbom as b WHERE goodsid='" + code + "' and startDate<='" + appliedDate + "' and endDate>='" + appliedDate + "' UNION ALL SELECT b.*, cast(c.pid+'.'+b.goodsid as varchar(2000)) as pid, lvl+1, CONVERT(FLOAT, c.rQty*b.quantity) as rQty FROM dbo.st_goodsbom as b INNER JOIN CTE as c ON b.goodsid=c.elemgid where b.startDate<='" + appliedDate + "' and b.endDate>='" + appliedDate + "') SELECT ptype as ProchasingType, elemgid as Code, rQty as Qty  FROM CTE order by pid asc,itemno asc;";
            console.log(sqltxt)
            var dbom = yield request.query(sqltxt);
            dbom = _.sortBy(dbom, 'Code')
            var count = 1;
            for (var i in dbom) {
                if (type == 0 && dbom[i].ProchasingType != "B" && dbom[i].ProchasingType != "b") continue;
                if (type == 1 && dbom[i].ProchasingType != "P" && dbom[i].ProchasingType != "p") continue;
                if (dbom[i].Qty == 0) continue;
                var oobj = _.find(rdata, function (obj) {
                    return obj.Code == dbom[i].Code;
                })
                if (oobj == undefined) {
                    var nobj = {};
                    nobj.SN = count++;
                    nobj.Code = dbom[i].Code;
                    nobj.Qty = dbom[i].Qty;
                    nobj.Unit = codesInfo[dbom[i].Code].unit;
                    nobj.Name = codesInfo[dbom[i].Code].name;
                    nobj.Spec = codesInfo[dbom[i].Code].spec;
                    rdata.push(nobj);
                } else {
                    oobj.Qty += dbom[i].Qty;
                }
            }
            rdata.push({
                SN: "===============END OF PICKLIST " + code + "(" + (type == 0 ? "MAKE" : "BUY") + ")===============",
                Code: "",
                Qty: "",
                Unit: "",
                Name: "",
                Spec: "",
            });
            var path = require('path');
            var toLocalPath = path.resolve(app.getPath("documents"));
            var filepath = dialog.showSaveDialog({
                defaultPath: toLocalPath,
                title: 'Save exported Picklist for ' + code,
                filters: [{
                    name: 'CSV (Comma-Separated Values) for Excel',
                    extensions: ['csv']
                }]
            });
            if (filepath !== undefined) {
                savedata(filepath, rdata, true);
            }
        } catch (ex) {
            // ... error checks
            console.error(ex)
        }
    })();

    console.log("about to return:", data)
    return data;
}

function displayDrawing(code, version = false, cb = false) {
    downloadDrawing(code, version, false, function (filepath) {
        const {
            shell
        } = require('electron');
        // Open a local file in the default app
        shell.openItem(filepath);
        if (typeof (cb) == "function") cb(filepath);
    })
}

function downloadDrawing(code, version = false, path = false, cb = false) {
    new sql.Request().query("select top 1 * from st_drawings where code = '" + code + "' " + (version === false ? "" : " and version =" + version) + " order by version desc;", (err, result) => {
        if (err) {
            console.error(err);
            alert("An error occur when open drawing.\n" + JSON.stringify(err));
            return;
        }
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host: config.mysqlServer,
            user: config.serverconfig.user,
            password: config.serverconfig.password,
            database: config.serverconfig.user
        });
        connection.connect();
        query = "select data from st_drawings where dsn=" + result.recordset[0].sn;
        if (path === false) {
            var tmppath = app.getPath("temp") + "/SuperTools";
            if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath);
            filepath = tmppath + "/" + result.recordset[0].filename;
        } else {
            filepath = path;
        }
        connection.query(query, function (error, results, fields) {
            fs.writeFileSync(filepath, results[0].data);
            if (typeof (cb) == "function") cb(filepath);
        });
        connection.end();
    });
}