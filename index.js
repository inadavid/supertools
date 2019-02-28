const {
    app,
    Menu,
    BrowserWindow,
    MenuItem,
    ipcMain,
    dialog
} = require('electron')

const EAU = require('electron-asar-hot-updater');
let win;
let flash;
global.version = "V0165";
global.appPath = app.getAppPath();
global.argv = process.argv;
global.flashClosed = false;

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
        label: 'Toggle Sidebar',
        accelerator: 'CmdOrCtrl+t',
        click: () => {
            win.webContents.send('win-menu-toggle-sidebar', 'nothing');
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
        host: '192.168.16.12',
        port: '8082',
        path: '/update',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': 2
        }
    };
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
                    buttons: ["Yes", "Later"],
                    title: 'Update ' + r.last + ' available',
                    message: "There is an update " + r.last + " available!\n Do you want to update now? \n 有可用系统更新" + r.last + "，是否现在更新？"
                }, function (fb) {
                    const fs = require("fs");
                    var updatefile = app.getAppPath() + '/update.7z';
                    if (fb == 1) createWindow();
                    else {
                        http.get(r.file, function (response) {
                            var body = '';
                            response.on('data', function (chunk) { body += chunk; });
                            response.on('end', function () {
                                fs.writeFileSync(updatefile, body);
                                console.log("file downloaded")
                            });
                        }).on('error', function (err) { // Handle errors
                            fs.unlink(updatefile); // Delete the file async. (But we don't check the result)
                            console.log(err)
                        });;
                    }
                });
            }
        });
    }).on('error', function (e) {
        console.log("Got an error: ", e);
        dialog.showErrorBox('info', "Error connecting update server!");
        createWindow();
    });
    req.write("[]")
    req.end()
})
// app.commandLine.appendSwitch('remote-debugging-port', '8315')
// app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1')
//app.on('ready', createWindow);

app.on('window-all-closed', () => {
    //if (process.platform !== 'darwin') {
    app.quit()
    //}
})

// app.on('activate', () => {
//   // 在macOS上，当单击dock图标并且没有其他窗口打开时，
//   // 通常在应用程序中重新创建一个窗口。
//   if (win === null) {
//     createWindow()
//   }
// })