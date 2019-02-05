const sqlite = require('sqlite-sync');
var appPath = require("electron").remote.getGlobal("appPath");
sqlite.connect(appPath + '/db/db.sqlite');

$(() => {
    var win = require("electron").remote.getCurrentWindow();
    //win.show();
    win.maximize();
    win.webContents.openDevTools()
    var sdata = sqlite.run("select * from system where key='lastuser';");
    //require("electron").remote.getGlobal("flash").close();
    //document.title += " - " + require("electron").remote.getGlobal("version");
    console.log(sdata)
});