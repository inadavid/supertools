const sqlite = require('sqlite-sync');

var action = "bomup";
var _ = require("underscore");
sqlite.connect('./db/db.sqlite');
var config = {};

const sql = require('mssql');

$(() => {
  var sdata = sqlite.run("select * from system where key='serverlist' or key='serverconfig';");
  for (var i in sdata) config[sdata[i].key] = JSON.parse(sdata[i].value);
  config.fSQLserver = 0;
  console.log(config); 
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
