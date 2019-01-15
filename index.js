const { app, Menu, BrowserWindow } = require('electron')

let win;
let flash;
global.version = "V0106";
global.appPath = app.getAppPath();

function createWindow() {

    win = new BrowserWindow({ width: 1024, height: 768, show: false, fullscreen: false, fullscreenable: false, resizable: true, maximizable: true, }); //

    win.loadFile('html/index.html')

    //打开开发者工具
    win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })
    win.setMenu(null);
    win.once('ready-to-show', () => {
        global.win = win;
        // win.show();
        // win.maximize()
    })

    flash = new BrowserWindow({ width: 525, height: 370, show: false, frame: false });
    flash.loadFile("html/flash.html");
    flash.once('ready-to-show', () => {
        flash.show();
        global.flash = flash;
    })
    flash.on('closed', () => {
        flash = null
    })
}

// app.commandLine.appendSwitch('remote-debugging-port', '8315')
// app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1')
app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// app.on('activate', () => {
//   // 在macOS上，当单击dock图标并且没有其他窗口打开时，
//   // 通常在应用程序中重新创建一个窗口。
//   if (win === null) {
//     createWindow()
//   }
// })