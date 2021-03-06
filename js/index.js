var _ = require("underscore");
var appPath = require("electron").remote.getGlobal("appPath");
var argv = require("electron").remote.getGlobal("argv");
const dialog = require('electron').remote.dialog;
const app = require('electron').remote.app;
const clipboard = require('electron').remote.clipboard;
const moment = require('moment');
const sql = require('mssql');
var mysql = require('mysql');
var mysqlpool = false;
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
if(config.inboxDisplayApproved == undefined) {
    config.inboxDisplayApproved = true;
}
else{
    config.inboxDisplayApproved = config.inboxDisplayApproved?true:false;
}
if(config.serverconfig.user !== undefined){
    delete config.serverconfig.user;
    delete config.serverconfig.password;
}
fs.writeFileSync(configFile, ini.stringify(config));

var action = "dashboard";
var bomexcel_arr = [];
var bom = [];
var bom_top;
var codesInfo = {};
var codesList = [];
var bomtopList = [];
var historyLength = 5;
var searchHistory = [];
var userlistall = {};
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

const commodityType = {
    'MMI': 'Mechanical-Machining',
    'MWN': 'Mechanical-Sheetmatel non-welded',
    'MWA': 'Mechanical-Sheetmatel welding Assy',
    'MWS': 'Mechanical-Sheetmatel welding Subs',
    'MIN': 'Mechanical-Injection',
    'ECS': 'Electrical-Customized',
    'ASM': 'Assembly-Misc',
    'SME': 'Standard-Mechanical',
    'SEL': 'Standard-Electrical',
    'SPN': 'Standard-Pnewmatic',
    'SFS': 'Standard-Fasteners',
    'OPR': 'Others-Printed',
    'OLB': 'Others-Label',
    'OPD': 'Others-Program or Design',
    'ONC': 'Others-Non-categorized',
    '---': 'No Commodity Type yet'
}

var ptypeKeys = _.keys(ptypeList);
var user = {};
var ecosn = 0;
const rejectTimeDiff = 30; //30min time difference allowed.
var allcodesHint = [];
var shifted = false;
var drawingCode = 0;
var lastbom = false;
var drawingType = [{
        name: "2D Portable drawing(.pdf)",
        ext: ["pdf"]
    },
    {
        name: "2D Source drawing(.slddrw, .dwg, .exb)",
        ext: ["slddrw", "dwg", "exb"]
    },
    {
        name: "3D Portable drawing(.easm, .eprt)",
        ext: ["easm", "eprt"]
    },
    {
        name: "3D Source drawing(.sldasm, .sldprt)",
        ext: ["sldasm", "sldprt"]
    },
    {
        name: "2D Vector drawing(.dxf)",
        ext: ["dxf"]
    },
    {
        name: "3D Vector drawing(.stp, .step, .igs)",
        ext: ["stp", "step", "igs"]
    },
    {
        name: "Other document(Program, Scanned doc...) (.zip)",
        ext: ["zip", "jpg", "jpeg", "png"]
    },
];
var sqlConfig={
    user:"SuperTools",
    password:"be5ad9d0b797040743f4bd5fe0b9f26a"
};

if (!fs.existsSync(app.getPath("temp") + "/SuperTools")) fs.mkdirSync(app.getPath("temp") + "/SuperTools");

function updateUserinfo() {
    $("a[bid=userinfo]").text("User:" + user.name + "; UID:" + user.id)
    console.log("database", config.mysqlDatabase.substring(0, 5))
    if (config.mysqlDatabase.substring(0, 4) == "TEST_") {
        if (user.perm.indexOf(32) == -1) {
            alert("You do not have permission to use test system.");
            ipcRenderer.send("quit");
        } else {
            setInterval(function () {
                $("div[bid=sidebar] a[perm=32]").toggleClass("highlightTest")
            }, 500)
        }
    }
}

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
        user.id = 28;
        user.name = "魏亮";
        user.perm = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23, 25, 30, 31, 32, 33, 40, 41, 42];
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

$("#quickNumberCheck input[bid='minfo']").keyup(function (e) {
    if (e.which == 13) $("#quickNumberCheck button.btn-success").trigger("click");
});
$("#quickNumberCheck input[bid='minfo']").focus(function () {
    $(this).select();
})

$("#quickNumberCheck button.btn-success").on("click", function () {
    var kw = $("#quickNumberCheck input[bid='minfo']").val().trim();
    if (kw.length == 0) return false;
    var btn = $(this);
    btn.prop("disabled", true);
    $("#quickNumberCheck select").html("");
    var result = [];
    var kwa = []
    if (kw.indexOf(" ") != -1) kwa = kw.split(" ");
    else kwa = [kw];

    for (var i in codesInfo) {
        if (codesInfo[i].code.indexOf(kwa[0]) != -1) result.push(i);
        else if (codesInfo[i].name && codesInfo[i].name.indexOf(kwa[0]) != -1) result.push(i);
        else if (codesInfo[i].spec && codesInfo[i].spec.indexOf(kwa[0]) != -1) result.push(i);
        else if (codesInfo[i].warehouse && codesInfo[i].warehouse.indexOf(kwa[0]) != -1) result.push(i);
    }

    if (kwa.length > 1) {
        for (var n = 1; n < kwa.length; n++) {
            var newRlt = [];
            for (var g in result) {
                console.log("processing ", result[g])
                if (codesInfo[result[g]].code.indexOf(kwa[n]) != -1) newRlt.push(result[g]);
                else if (codesInfo[result[g]].name && codesInfo[result[g]].name.indexOf(kwa[n]) != -1) newRlt.push(result[g]);
                else if (codesInfo[result[g]].spec && codesInfo[result[g]].spec.indexOf(kwa[n]) != -1) newRlt.push(result[g]);
                else if (codesInfo[result[g]].warehouse && codesInfo[result[g]].warehouse.indexOf(kwa[n]) != -1) newRlt.push(result[g]);
            }
            result = newRlt;
        }
    }

    for (var m in result) {
        var tv = ""
        //if (tv.length > 0) tv += "\n============================\n";
        // tv += "Code: " + codesInfo[result[m]].code + "\t";
        // tv += "Name: " + codesInfo[result[m]].name + "\t";
        // tv += "Unit: " + codesInfo[result[m]].unit + "\t";
        // tv += "Spec: " + codesInfo[result[m]].spec + "\t";
        // tv += "Warehouse Pos: " + codesInfo[result[m]].warehouse + "\n";
        tv += codesInfo[result[m]].code + " | ";
        tv += codesInfo[result[m]].name + "\t|";
        tv += codesInfo[result[m]].unit + "\t|";
        tv += codesInfo[result[m]].spec + "\t|";
        tv += codesInfo[result[m]].warehouse;
        $("#quickNumberCheck select").append($("<option>").val(result[m]).text(tv));
    }
    btn.prop("disabled", false);
    $("#quickNumberCheck select option").on("dblclick", function () {
        opt = $(this);
        pushHistory(opt.val());
        $.modal.close();
        $("div[bid=sidebar] a[href='bomsearch']").click();
    })
})
//connect with menu ========================================
ipcRenderer.on('win-menu-toggle-sidebar', (event, arg) => {
    $('div[bid="sidebar"]').toggle(500);
})

ipcRenderer.on('win-menu-quick-search', (event, arg) => {
    $("#quickNumberCheck").modal({
        escapeClose: true,
        clickClose: true,
        showClose: true
    });
    $("#quickNumberCheck input[bid='minfo']").focus();
})
//below are functions ======================================
function pushHistory(val) {
    searchHistory = JSON.parse(Base64.decode(config.bomsearchhistory));
    if (searchHistory.indexOf(val) == -1) {
        searchHistory.push(val);
        if (searchHistory.length > historyLength) searchHistory.splice(0, 1);
    } else {
        searchHistory.splice(searchHistory.indexOf(val), 1);
        searchHistory.push(val);
    }
    config.bomsearchhistory = Base64.encode(JSON.stringify(searchHistory));
    fs.writeFileSync(configFile, ini.stringify(config));
}

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
    var text = "";
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
            text += "账套" + config.database + " <br>连接准备完毕！<br>包含物料号" + codesList.length + "个";
            break;
        default:
            text = "连接初始化";
    }
    a.html(text);
    if (config.fSQLserver == -1 || config.fSQLserver == 3) a.addClass("list-group-item-danger");
    if (config.fSQLserver == 4) {
        if (config.testmode == 1) {
            config.testmode = 0;
            config.serverconfig.database = config.dbbak;
            delete config.dbbak;
            //config.serverconfig.options.database = config.serverconfig.database
            $("div[bid=sidebar] a[perm=32]").prop("disabled", true).off("click").on("click", () => {
                return false;
            });
            setInterval(function () {
                $("div[bid=sidebar] a[perm=32]").toggleClass("highlightTest")
            }, 500)
        }
        a.addClass("list-group-item-success");
    }
    fs.writeFileSync(configFile, ini.stringify(config));
}

function disconnectSQLserver() {
    sql.close();
}

function connectSQLserver(cb) {
    sql.connect(Object.assign(sqlConfig,config.serverconfig), err => {
        if (err) {
            config.fSQLserver = 3;
        } else {
            config.fSQLserver = 2;
            fetchAllCodes();
            //get userlist 
            executeMsSql("select opid,opname from m_operator;", (err, result) => {
                if (err) {
                    console.error(err);
                    return;
                }
                for (var i in result.recordset) {
                    userlistall[result.recordset[i].opid + ""] = result.recordset[i].opname;
                }
            })
            //connect to mysql server
            mysqlpool = mysql.createPool({
                host: config.mysqlServer,
                user: sqlConfig.user,
                password: sqlConfig.password,
                database: sqlConfig.user
            });
            if (typeof (cb) == "function") cb();
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
        //sqltxt = "select dbo.l_goods.goodsid,dbo.l_goods.code,dbo.l_goods.name,dbo.l_goods.specs,dbo.l_goodsunit.unitname, dbo.l_goods.guserdef1 as whpos from dbo.l_goods inner join l_goodsunit on l_goods.goodsid=l_goodsunit.goodsid and l_goods.unitid=l_goodsunit.unitid ;";
        //changed to another way to read unit from 20190801
        sqltxt = "select dbo.l_goods.goodsid,dbo.l_goods.code,dbo.l_goods.name,dbo.l_goods.specs,dbo.l_goodsunit.unitname, dbo.l_goods.guserdef1 as whpos, dbo.l_goods.guserdef5 as ctype from dbo.l_goods inner join l_goodsunit on l_goods.goodsid=l_goodsunit.goodsid and l_goodsunit.unittype=0;";
        codesList = [];
        codesInfo = {};
        executeMsSql(sqltxt, function (err, recordset) {
            // ... error checks
            var rs = recordset.recordset;
            for (var i in rs) {
                codesList.push(rs[i].code);
                codesInfo[rs[i].code] = {
                    code: rs[i].code,
                    goodsid: rs[i].goodsid,
                    name: rs[i].name,
                    spec: rs[i].specs,
                    unit: rs[i].unitname,
                    ctype: (rs[i].ctype in commodityType ? rs[i].ctype : "---"),
                    warehouse: (typeof (rs[i].whpos) == "string" && rs[i].whpos.length > 6 ? rs[i].whpos : "")
                    ///[a-zA-Z]+[0-9]+\-[a-zA-Z]+[0-9]+\-[a-zA-Z]+[0-9]+\-[0-9]+/g.test(rs[i].whpos) ? .whpos : "",
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

            result += `"${item[key]}"`
            ctr++
        })
        result += lineDelimiter
    })
    console.log("data 2 length:" + data.length)

    return result
}

function savedata(filepath, data, open = false, cb = false) {
    console.log("data 1 length:" + data.length)
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
        if (cb && typeof (cb) == "function") cb(filepath);
    });

}


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
    var picklistUpdate = [];
    var sqltxt = "select * from st_picklists; ";

    executeMsSql(sqltxt, function (err, result) {
        if (err) throw err;
        var picklists = result.recordset;
        console.log("picklists", picklists, sqltxt);
        sqltxt = " select * from st_bomeco where ";
        if (eco && typeof (eco) === "number") sqltxt += " sn = " + eco + " and ";
        sqltxt += " status = 1;"
        executeMsSql(sqltxt, function (err, result) {
            if (err) throw err;
            var ecolists = result.recordset;
            //console.log("ecolist", ecolists, sqltxt)
            var finalSQL = "update st_bomeco set status = 2 where sn = 0"
            var cnt = ecolists.length;
            for (var k in ecolists) {
                //select all relevant parents that connected to relevant picklist codes.
                sqltxt = "WITH CTE AS (SELECT b.*,cast('" + ecolists[k].parentgid + "' as varchar(2000)) as pid , lvl=1 FROM dbo.st_goodsbom as b WHERE goodsid='" + ecolists[k].parentgid + "' UNION ALL SELECT b.*, cast(c.pid+'.'+b.goodsid as varchar(2000)) as pid, lvl+1 FROM dbo.st_goodsbom as b INNER JOIN CTE as c ON c.goodsid=b.elemgid) select c.goodsid from CTE as c where ";
                for (var j in picklists) {
                    sqltxt += " c.goodsid='" + picklists[j].code + "' or ";
                }
                sqltxt += " c.goodsid='' group by c.goodsid;";

                executeMsSql(sqltxt, function (err, result) {
                    if (err) throw err;
                    var tmprs = result.recordset;
                    for (var l in tmprs)
                        if (picklistUpdate.indexOf(tmprs[l].goodsid) == -1) picklistUpdate.push(tmprs[l].goodsid);
                    finalSQL += " or sn = " + ecolists[k].sn;
                    cnt--;
                    if (cnt == 0) {
                        finalSQL += "; update st_picklists set reflag =1 where code = '' ";
                        for (var m in picklistUpdate) finalSQL += " or code = '" + picklistUpdate[m] + "' ";
                        finalSQL += ";";
                        executeMsSql(finalSQL, function (err, result) {
                            if (err) throw err;
                        });
                    }
                });
            }
        });
    });



}

function getPicklistData(code, type = 0, cb) {
    var appliedDate = moment().format("YYYY-MM-DD");
    var rdata = [];
    var sqltxt = "WITH CTE AS (SELECT b.*,cast('" + code + "' as varchar(2000)) as pid , lvl=1, convert(FLOAT, b.quantity) as rQty FROM dbo.st_goodsbom as b WHERE goodsid='" + code + "' and startDate<='" + appliedDate + "' and endDate>='" + appliedDate + "' UNION ALL SELECT b.*, cast(c.pid+'.'+b.goodsid as varchar(2000)) as pid, lvl+1, CONVERT(FLOAT, c.rQty*b.quantity) as rQty FROM dbo.st_goodsbom as b INNER JOIN CTE as c ON b.goodsid=c.elemgid where b.startDate<='" + appliedDate + "' and b.endDate>='" + appliedDate + "') SELECT ptype as ProchasingType, elemgid as Code, rQty as Qty  FROM CTE order by pid asc,itemno asc;";
    executeMsSql(sqltxt, (err, result) => {
        if (err) {
            console.error(err);
            alert("An error occur try to fetch the BOM.\n" + JSON.stringify(err));
            return;
        }
        var dbom = JSON.parse(JSON.stringify(result.recordset));
        dbom = _.sortBy(dbom, 'Code')
        var count = 1;
        for (var i in dbom) {
            if (type == 0 && dbom[i].ProchasingType != "B" && dbom[i].ProchasingType != "b" && dbom[i].ProchasingType != "C" && dbom[i].ProchasingType != "c") continue;
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
                nobj.Warehouse = codesInfo[dbom[i].Code].warehouse;
                rdata.push(nobj);
            } else {
                oobj.Qty += dbom[i].Qty;
            }
        }
        if (typeof (cb) === "function") cb(rdata);
    });

}

function getPicklist(code, type = 0, cb = false) {
    getPicklistData(code, type, function (rdata) {
        rdata.push({
            SN: "===============END OF PICKLIST " + code + "(" + (type == 0 ? "MAKE" : "BUY") + ")===============",
            Code: "",
            Qty: "",
            Unit: "",
            Name: "",
            Spec: "",
            Warehouse: ""
        });
        var path = require('path');
        const fs = require("fs");
        var tmppath = app.getPath("temp") + "/SuperTools";
        if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath);

        var toLocalPath = path.resolve(app.getPath("documents"));
        var filepath = path.resolve(tmppath + "/Picklist-" + moment().format("YYYYMMDD-HHmmss") + ".temp.csv");
        savedata(filepath, rdata, true, cb);
    });

}

function displayDrawing(code, version = false, cb = false, filetype = 0) {
    downloadDrawing(code, version, false, function (filepath) {
        if (filepath.err) {
            if (typeof (cb) == "function") return cb(filepath);
        } else {
            const {
                shell
            } = require('electron');
            // Open a local file in the default app
            shell.openItem(filepath);
            if (typeof (cb) == "function") cb(filepath);
        }
    }, filetype)
}

function downloadDrawing(code, version = false, path = false, cb = false, filetype = 0, dfile = false) {
    executeMsSql("select top 1 * from st_drawings where code = '" + code + "' " + (version === false ? "" : " and version =" + version) + " and filetype = " + filetype + " order by version desc, filetype asc;", (err, result) => {
        if (err) {
            console.error(err);
            alert("An error occur when open drawing.\n" + JSON.stringify(err));
            return;
        }
        if (result.rowsAffected != 1) {
            if (typeof (cb) == "function") cb({
                err: "drawing does not exist"
            });
            return false;
        }
        var p = require("path");
        var sanitize = require("sanitize-filename");
        if (path === false) {
            var tmppath = app.getPath("temp") + "/SuperTools";
            if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath);
            //change file name to a standard type for 0 type file
            if (filetype == 0 || filetype == 4 || filetype == 5) {
                filepath = tmppath + "/" + sanitize(result.recordset[0].code + "_V" + result.recordset[0].version + "_" + result.recordset[0].size + "_" + codesInfo[result.recordset[0].code].name + "_" + codesInfo[result.recordset[0].code].spec + p.extname(result.recordset[0].filename).toLowerCase());
            } else filepath = tmppath + "/" + result.recordset[0].filename.toLowerCase();
            filepath = p.normalize(filepath);
        } else if (!dfile && fs.lstatSync(path).isDirectory()) {
            //change file name to a standard type for 0 type file
            if (filetype == 0 || filetype == 4 || filetype == 5) {
                filepath = path + "/" + sanitize(result.recordset[0].code + "_V" + result.recordset[0].version + "_" + result.recordset[0].size + "_" + codesInfo[result.recordset[0].code].name + "_" + codesInfo[result.recordset[0].code].spec + p.extname(result.recordset[0].filename).toLowerCase());
            } else filepath = path + "/" + result.recordset[0].filename.toLowerCase();
            filepath = p.normalize(filepath);
        } else {
            var fn = p.basename(path);
            var nfn = fn.split('.').slice(0, -1).join('.')
            filepath = p.dirname(path) + "/" + nfn + p.extname(result.recordset[0].filename).toLowerCase();
        }

        query = "select data from st_drawings where dsn=" + result.recordset[0].sn;
        executeMySql(query, function (error, results) {
            console.log(error, results)
            //if (filetype == 5) console.log(results, query, filepath)
            fs.writeFileSync(filepath, results[0].data);
            if (typeof (cb) == "function") cb(filepath);
        });
    });

}

function downloadDrawingList(lod, cb = false, mc = false, rtn = false) {
    if (!Array.isArray(lod)) {
        if (typeof (cb) == "function") {
            cb({
                msg: "lod is not an Array",
                err: 1,
                drw: rtn
            });
        }
        return false;
    }
    var drawing = lod.pop();
    if (!drawing) {
        if (typeof (cb) == "function") {
            cb({
                msg: "lod is not an Array",
                err: 1,
                drw: rtn
            });
        }
        return false;
    }

    downloadDrawing(drawing.code, drawing.version, drawing.path, function (data) {
        if (data.err) {
            if (typeof (cb) == "function") {
                cb(data);
                return;
            }
        } else {
            downloadDrawingList(lod, cb, mc, Array.isArray(rtn) ? rtn.concat([data]) : [data]);
            if (mc && typeof (cb) == "function") {
                cb(Array.isArray(rtn) ? rtn.concat([data]) : [data]);
            }
        }
    }, drawing.filetype);
}

function executeMsSql(sqlArr, cb = false, rlt = false) {
    if (!Array.isArray(sqlArr) && typeof (sqlArr) == "string") {
        new sql.Request().query(sqlArr, (err, result) => {
            if (cb && typeof (cb) == "function") cb(err, result);
        });
    } else if (Array.isArray(sqlArr)) {
        //var sqltext = sqlArr.splice(sqlArr.length - 1, 1);
        var sqltext = sqlArr.pop();
        if (typeof (sqltext) == "string") {
            console.log("current sql:", sqltext)
            new sql.Request().query(sqltext, (err, result) => {
                console.log("returned result", result)
                if (err) {
                    if (cb && typeof (cb) == "function") cb(err, rlt);
                } else {
                    if (rlt === false) rlt = {
                        recordset: result.recordset,
                        rowsAffected: parseInt(result.rowsAffected)
                    }
                    else {
                        rlt.rowsAffected += parseInt(result.rowsAffected);
                        if (result.recordsets.length > 0) {
                            if (Array.isArray(rlt.recordset)) rlt.recordset.concat(result.recordset);
                            else rlt.recordset = result.recordset;
                        }
                    }
                    if (sqlArr.length == 0) return cb(err, rlt);
                    else return executeMsSql(sqlArr, cb, rlt);
                }
            });
        } else {
            return cb(false, rlt);
        }
    }
}

function executeMySql(sqlArr, ...args) {
    console.log("mysql:", sqlArr);
    var cb = false;
    if (!Array.isArray(sqlArr) && typeof (sqlArr) == "string") {
        if (typeof (args[0]) == "object") {
            cb = args[1];
            mysqlpool.getConnection(function (err, mysqlconn) {
                mysqlconn.query(sqlArr, args[0], function (err, result, fields) {
                    if (cb && typeof (cb) == "function") cb(err, result, fields);
                    mysqlconn.end();
                });

            });
        } else {
            cb = args[0];

            mysqlpool.getConnection(function (err, mysqlconn) {
                mysqlconn.query(sqlArr, function (err, result, fields) {
                    if (cb && typeof (cb) == "function") cb(err, result, fields);
                    mysqlconn.end();
                });
            });
        }
    } else if (Array.isArray(sqlArr)) {
        //var sqltext = sqlArr.splice(sqlArr.length - 1, 1);
        var sqltext = sqlArr.pop();
        cb = args[0];
        var rlt = args[1] ? args[1] : false;
        if (typeof (sqltext) == "string") {
            console.log("current my sql:", sqltext)
            mysqlpool.getConnection(function (err, mysqlconn) {
                mysqlconn.query(sqltext, function (err, result, fields) {
                    console.log("returned result", result)
                    if (err) {
                        if (cb && typeof (cb) == "function") cb(err, rlt);
                    } else {
                        if (rlt === false) rlt = {
                            recordset: result
                        }
                        else {
                            if (result.length > 0) {
                                if (Array.isArray(rlt.recordset)) rlt.recordset.concat(result);
                                else rlt.recordset = result;
                            }
                        }
                        if (sqlArr.length == 0) return cb(err, rlt);
                        else return executeMySql(sqlArr, cb, rlt);
                    }
                    mysqlconn.end();
                });
            });

        } else {
            return cb(false, rlt);
        }
    }
}

function HTMLTable(data, cls = false) {
    //data need to be array of object (recorderset of mysql/mssql query result)
    if (!Array.isArray(data)) return false;
    if (data.length < 1) return false;
    var title = _.keys(data[0]);
    var table = $("<table>").addClass("table selectable").attr("data", JSON.stringify(data));
    if (cls !== false) table.addClass(cls);
    th_tr = $("<tr>");
    for (var i in title) th_tr.append($("<td>").append(title[i]));
    var th = $("<thead>").append(th_tr);
    var tb = $("<tbody>");
    for (var j in data) {
        var tb_tr = $("<tr>").attr("data", JSON.stringify(data[j]));
        for (var h in title) tb_tr.append($("<td>").append(data[j][title[h]]));
        tb.append(tb_tr);
    }
    table.append(th).append(tb);
    return table;
}