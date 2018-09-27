var action = "bomup";

const config = {
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
  sql.connect(config, err => {
    if (err) alert("数据库连接失败！\n" + err);
    // console.log(err)
    // new sql.Request().query("select goodsid from dbo.l_goods where code = '1101001010';", (err, result) => {
    //   // ... error checks
    //   console.dir(result)
    // })
  });
});

$("div[bid=sidebar] a").on("click", (e) => {
  var ts = $(e.currentTarget)
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