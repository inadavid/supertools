const { app, Menu, BrowserWindow } = require('electron')

let win;
let flash;
<<<<<<< HEAD
global.version = "V0104a";
=======
global.version = "V0105";
>>>>>>> 062a01e2e73cac8b1f241627d4c71dff591e5ecd
global.appPath = app.getAppPath();

function createWindow() {

    win = new BrowserWindow({ width: 1024, height: 768, show: false, fullscreen: false, fullscreenable: false, resizable: true, maximizable: true, }); //

    win.loadFile('html/index.html')

    // 打开开发者工具
    win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })
    win.setMenu(null);
    win.once('ready-to-show', () => {
        // win.show();
        // win.maximize()
    })

    flash = new BrowserWindow({ width: 525, height: 370, show: false, frame: false });
    flash.loadFile("html/flash.html");
    global.flash = flash;
    flash.once('ready-to-show', () => {
        flash.show();
        global.flash = flash;
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