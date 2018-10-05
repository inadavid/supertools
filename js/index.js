const sqlite = require('sqlite-sync');
var _ = require("underscore");
var appPath = require("electron").remote.getGlobal("appPath");
sqlite.connect(appPath + '/db/db.sqlite');
const sql = require('mssql');
var { BrowserWindow } = require("electron").remote;

var action = "dashboard";
var config = {};
var flash = new BrowserWindow({ width: 525, height: 370, show: false, frame: false });
flash.loadFile(appPath + "/html/flash.html");
flash.show();

$(() => {
  var sdata = sqlite.run("select * from system where key='serverlist' or key='serverconfig';");
  for (var i in sdata) config[sdata[i].key] = JSON.parse(sdata[i].value);
  config.fSQLserver = 0;
  console.log(config);
  var win = require("electron").remote.getCurrentWindow();
  win.show();
  win.maximize();
  flash.close();
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
  $("div[bid=main]").load(pname + ".html");
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
  console.log(top, left, $(window).height())
  dlg.css("top", top);
  dlg.css("left", left);
  dlg.show("slow");
  setTimeout(() => {
    dlg.hide("slow")
  }, timeout);
}
