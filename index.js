const {
    app,
    argv,
    Menu,
    BrowserWindow,
    MenuItem,
    ipcMain,
    dialog
} = require('electron')
const {
    exec
} = require('child_process');
const fs = require('fs');
const request = require('request');

let win;
let flash;
global.version = "V02160";
global.appPath = app.getAppPath();
global.argv = process.argv;
global.flashClosed = false;

////////////////////////////Config ini////////////////////////////
const ini = require('ini');
var configFile = app.getAppPath() + '/config.ini';
if (global.argv[2] != "dev") configFile = app.getAppPath() + '/../config.ini';
var config = ini.parse(fs.readFileSync(configFile, 'utf-8'));

config.updateServer = "10.11.50.168";
config.mysqlServer = "10.11.50.168";
if(config.mysqlDatabase !="SuperTools" && config.mysqlDatabase!="TEST_SuperTools") config.mysqlDatabase = "SuperTools";
if(config.database !="SD30602_STJ201907" && config.database!="TEST_SD30602_STJ201907") config.database = "SD30602_STJ201907";
if(config.serverconfig.database !="SD30602_STJ201907" && config.serverconfig.database!="TEST_SD30602_STJ201907") config.serverconfig.database = "SD30602_STJ201907";
config.updatePort = 8082;
fs.writeFileSync(configFile, ini.stringify(config));
////////////////////////////Config ini////////////////////////////

function createWindow() {
    win = new BrowserWindow({
        width: 1500,
        height: 768,
        show: false,
        fullscreen: false,
        fullscreenable: false,
        resizable: true,
        maximizable: true,
        webPreferences: {
            plugins: true
        }
    }); //

    win.loadFile('html/index.html')

    //打开开发者工具
    if (process.argv[2] == "dev") win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })
    var menu = new Menu()
    menu.append(new MenuItem({
        label: 'ToggleSidebar',
        accelerator: 'CmdOrCtrl+t',
        click: () => {
            win.webContents.send('win-menu-toggle-sidebar', 'nothing');
        }
    }))
    menu.append(new MenuItem({
        label: 'QuickSearch',
        accelerator: 'CmdOrCtrl+f',
        click: () => {
            win.webContents.send('win-menu-quick-search', 'nothing');
        }
    }))
    win.setMenu(menu);
    win.once('ready-to-show', () => {
        global.win = win;
        // win.show();
        // win.maximize()
    })


    flash = new BrowserWindow({
        width: 525,
        height: 370,
        show: false,
        frame: false
    });
    flash.loadFile("html/flash.html");
    flash.once('ready-to-show', () => {
        flash.show();
        global.flash = flash;
    })
    flash.on('closed', () => {
        flash = null;
        global.flashClosed = true;
    })
}

app.on('ready', function () {
    // Initiate the module
    // EAU.init({
    //     'api': 'http://192.168.16.12:8082', // The API EAU will talk to
    //     'server': false // Where to check. true: server side, false: client side, default: true.
    // });
    const http = require("http");
    var post_options = {
        host: config.updateServer,
        port: config.updatePort,
        path: '/update',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': 2
        }
    };
    //if (process.argv[1] == "dev") post_options.host = '127.0.0.1';
    var req = http.request(post_options, function (res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var r = JSON.parse(body);
            if (r.last != global.version) {
                dialog.showMessageBox({
                    type: "question",
                    buttons: ["Yes 是", "Later 稍后"],
                    defaultId: 0,
                    title: 'Update ' + r.last + ' available',
                    message: "There is an update version:" + r.last + " available!\nCurrent version:" + global.version + "\nDo you want to update now? \n有可用系统更新" + r.last + "\n当前版本" + global.version + "\n是否现在更新？"
                }, function (fb) {
                    if (fb === 0) {
                        var path = require("path");
                        var updatefile = path.normalize(app.getAppPath() + '/../update.7z');
                        var updateBatch = path.normalize(app.getAppPath() + '/../update.bat');
                        if (fs.existsSync(updatefile)) fs.unlinkSync(updatefile);
                        download(r.file, updatefile, function (any) {
                            var cmd = "@echo off\necho Upgrading " + r.last + ", please wait....\nping -n 5 127.0.0.1 >nul\n";
                            cmd += path.normalize(app.getAppPath() + "/../7z.exe") + " x \"" + updatefile + "\" -aoa -o\"" + path.normalize(app.getAppPath() + '/../') + "\" -y";
                            cmd += "\ndel " + updatefile + " /F"
                            cmd += "\nset /p temp=\"Upgrade complete. Hit ENTER to continue.\"";
                            cmd += "\nstart " + path.normalize(app.getAppPath() + "/../../SuperTools.exe");
                            cmd += "\nexit"
                            fs.writeFileSync(updateBatch, cmd);
                            setTimeout(function () {
                                exec("start " + updateBatch, function (err) {});
                            }, 10);
                            setTimeout(function () {
                                app.exit();
                            }, 1000);
                            // exec(cmd, function (err) {
                            //     if (err) {
                            //         console.log(err)
                            //         dialog.showMessageBox({
                            //             type: "error",
                            //             title: "Error",
                            //             message: JSON.stringify(err)
                            //         });
                            //     } else {
                            //         fs.unlinkSync(updatefile);
                            //         dialog.showMessageBox({
                            //             type: "info",
                            //             title: "Complete",
                            //             message: "Upgrade complete! Restart SuperTools please."
                            //         });
                            //     }
                            // })
                        })
                    } else {
                        createWindow();
                    }
                });
            } else {
                createWindow();
            }
        });
    }).on('error', function (e) {
        console.log("Got an error: ", e);
        dialog.showErrorBox('info', "Error connecting update server!");
        createWindow();
    });
    req.write("[]");
    req.end();
})
// app.commandLine.appendSwitch('remote-debugging-port', '8315')
// app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1')
//app.on('ready', createWindow);

app.on('window-all-closed', () => {
    //if (process.platform !== 'darwin') {
    var tmppath = app.getPath("temp") + "/SuperTools";
    var rimraf = require("rimraf");
    rimraf(tmppath, function () {
        app.quit()
    });
    //}
})

// app.on('activate', () => {
//   // 在macOS上，当单击dock图标并且没有其他窗口打开时，
//   // 通常在应用程序中重新创建一个窗口。
//   if (win === null) {
//     createWindow()
//   }
// })

ipcMain.on("quit", function(){
    app.quit();
})

const download = (url, dest, cb) => {
    const file = fs.createWriteStream(dest);
    const sendReq = request.get(url);

    // verify response code
    sendReq.on('response', (response) => {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }

        sendReq.pipe(file);
    });

    // close() is async, call cb after close completes
    file.on('finish', () => file.close(cb));

    // check for request errors
    sendReq.on('error', (err) => {
        fs.unlink(dest);
        return cb(err.message);
    });

    file.on('error', (err) => { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        return cb(err.message);
    });
};
