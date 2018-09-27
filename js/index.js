var action = "bomup";
var fSQLserver = 0;
var SQLserver = "";
var SQLservers = ['192.168.18.3', '10.11.50.50'];
var SQLconfig = {
  user: 'SuperTools',
  password: 'be5ad9d0b797040743f4bd5fe0b9f26a',
  server: '10.11.50.50',
  database: 'SD30602_STJ',

  options: {
    encrypt: false // Set to true if you're on Windows Azure
  }
}

const sql = require('mssql');

$(() => {
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
  if (c >= SQLservers.length) {
    fSQLserver = -1;
    updateSQLserver();
  }
  else {
    SQLserver = SQLservers[c];
    updateSQLserver();
    ping.promise.probe(SQLserver).then(function (res) {
      if (res.alive) {
        fSQLserver = 1;
        updateSQLserver();
        SQLconfig.server = SQLserver;
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
  var text = SQLserver + " ";
  switch (fSQLserver) {
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
  if (fSQLserver == -1 || fSQLserver == 3) a.addClass("list-group-item-danger");
  if (fSQLserver == 2) a.addClass("list-group-item-success");
}

function connectSQLserver() {
  sql.connect(SQLconfig, err => {
    if (err) {
      fSQLserver = 3;
      console.log(err)
    }
    else fSQLserver = 2;
    updateSQLserver();
    // console.log(err)
    // new sql.Request().query("select goodsid from dbo.l_goods where code = '1101001010';", (err, result) => {
    //   // ... error checks
    //   console.dir(result)
    // })
  });
}
