const sqlite = require('sqlite-sync');
var _ = require("underscore");
var appPath = require("electron").remote.getGlobal("appPath");
sqlite.connect(appPath + '/db/db.sqlite');
const sql = require('mssql');
var { BrowserWindow } = require("electron").remote;

var action = "dashboard";
var config = {};
var bomexcel_arr = [];
var bom = [];
var bom_top;


$(() => {
  var sdata = sqlite.run("select * from system where key='serverlist' or key='serverconfig';");
  for (var i in sdata) config[sdata[i].key] = JSON.parse(sdata[i].value);
  config.fSQLserver = 0;
  var win = require("electron").remote.getCurrentWindow();
  win.show();
  win.maximize();
  require("electron").remote.getGlobal("flash").close();
  document.title += " - " + require("electron").remote.getGlobal("version");
  loadPanel(action);
  tryHost(0);

});

$("div[bid=sidebar] a").on("click", (e) => {
  var ts = $(e.currentTarget)
  if (ts.attr("href") == "#") return false;
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
  }
  else {
    config.SQLserver = config.serverlist[c];
    updateSQLserver();
    ping.promise.probe(config.SQLserver).then(function (res) {
      if (res.alive) {
        config.fSQLserver = 1;
        updateSQLserver();
        config.serverconfig.server = config.SQLserver;
        connectSQLserver();
      }
      else {
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
      text += "数据库已连接";
      break;
    case 3:
      text += "数据库连接失败";
      break;
    default:
      text = "连接初始化";
  }
  a.text(text);
  if (config.fSQLserver == -1 || config.fSQLserver == 3) a.addClass("list-group-item-danger");
  if (config.fSQLserver == 2) a.addClass("list-group-item-success");
}

function connectSQLserver() {
  sql.connect(config.serverconfig, err => {
    if (err) {
      config.fSQLserver = 3;
      console.log(err)
    }
    else config.fSQLserver = 2;
    updateSQLserver();
    // console.log(err)
    // new sql.Request().query("select goodsid from dbo.l_goods where code = '1101001010';", (err, result) => {
    //   // ... error checks
    //   console.dir(result)
    // })
  });
}

function popup(html, cl = "primary", timeout = 3000) {
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

function gFormatBOM(bom_top, setup, level = 1) {
  //need to define "bomexcel_arr" and "bom" as global.
  var lq = 1;
  var sq = [bom_top]; //parent queue; will be push and pop.
  var sn = [1]; //order number queue; will be push and pop.
  var aq = [bom_top]; //assembly queue; will only be push. to skip the already existed assembly

  for (var i = 1; i < bomexcel_arr.length; i++) {
    bomexcel_arr[i][setup.level] = bomexcel_arr[i][setup.level].trim().split('…').join("");
    bomexcel_arr[i][setup.level] = parseInt(bomexcel_arr[i][setup.level].trim().split('.').join(""));
  }

  for (var i = 1; i < bomexcel_arr.length; i++) {
    if (bomexcel_arr[i][setup.level] > lq) {
      //check if this level existed already.
      if (aq.indexOf(bomexcel_arr[i - 1][setup.code]) == -1) { //add this new level when it's not existed.
        aq.push(bomexcel_arr[i - 1][setup.code]);

        lq++;
        sq.push(bomexcel_arr[i - 1][setup.code]);
        sn.push(1);
      }
      else {// skip this level and all below when already existed.
        while (bomexcel_arr[i][setup.level] > lq) i++;
      }
    }
    if (bomexcel_arr[i][setup.level] < lq) {
      lq--;
      sq.pop();
      sn.pop();
    }
    if (bomexcel_arr[i][setup.level] == lq) {
      bomexcel_arr[i][100] = sq[sq.length - 1];
      bomexcel_arr[i][101] = sn[sn.length - 1]++;
      bom.push({
        "code": codes[bomexcel_arr[i][setup.code]],
        "parent": codes[bomexcel_arr[i][100]],
        "qty": bomexcel_arr[i][setup.qty],
        "item": bomexcel_arr[i][101],
        "order": bomexcel_arr[i][101] < 10 ? "0" + (bomexcel_arr[i][101] * 10) : "" + (bomexcel_arr[i][101] * 10),
        "procumenttype": setup.pt == -1 ? "" : bomexcel_arr[i][setup.pt],
        "pfep": setup.pfep == -1 ? "" : bomexcel_arr[i][setup.pfep]
      });
    }
  }
}

function getCodesInfo(codes, cb) {
  var rtn = {
    err: false
  }
  var sqltxt = "select code,goodsid from dbo.l_goods where code='0' ";
  for (var m in codes) {
    sqltxt += " or code = '" + m + "' ";
  }
  sqltxt += ";";
  (async () => {
    try {
      var rst = await sql.query(sqltxt);
      for (var n in rst.recordset) {
        codes[rst.recordset[n].code] = rst.recordset[n].goodsid;
      }
      var filter = [];
      for (var i in codes) {
        if (codes[i] == 0) filter.push(i);
      }
      if (filter.length != 0) {
        rtn.err = 1;
        rtn.errMsg = "物料号在ERP里不存在。";
        rtn.data = filter;
      }
      rtn.codes = codes;
      cb(rtn);
    } catch (err) {
      rtn.err = 2
      rtn.errMsg = err;
      console.log(err)
      cb(rtn);
    }
  })()

}
