const {
    app,
    Menu,
    BrowserWindow,
    MenuItem,
    ipcMain,
    dialog
} = require('electron')

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
    EAU.init({
        'api': '', // The API EAU will talk to
        'server': false // Where to check. true: server side, false: client side, default: true.
    });

    EAU.check(function (error, last, body) {
        if (error) {
            if (error === 'no_update_available') { return false; }
            dialog.showErrorBox('info', error)
            return false
        }

        EAU.progress(function (state) {
            // The state is an object that looks like this:
            // {
            //     percent: 0.5,               
            //     speed: 554732,              
            //     size: {
            //         total: 90044871,        
            //         transferred: 27610959   
            //     },
            //     time: {
            //         elapsed: 36.235,        
            //         remaining: 81.403       
            //     }
            // }
        })

        // EAU.download(function (error) {
        //     if (error) {
        //         dialog.showErrorBox('info', error)
        //         return false
        //     }
        //     dialog.showErrorBox('info', 'App updated successfully! Restart it please.')
        // })

    })
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