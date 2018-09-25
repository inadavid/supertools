const {app, Menu, BrowserWindow} = require('electron')

let win;

function createWindow () {

  win = new BrowserWindow({width: 800, height: 600, show: false, fullscreen: false, fullscreenable: false, resizable: false, maximizable: true,});//
  
  win.loadFile('html/index.html')

  // 打开开发者工具
  win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
  })
  win.setMenu(null);
  win.once('ready-to-show', () => {
    win.show();
    win.maximize()
  })
}

app.commandLine.appendSwitch('remote-debugging-port', '8315')
app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1')
app.on('ready', createWindow);

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// app.on('activate', () => {
//   // 在macOS上，当单击dock图标并且没有其他窗口打开时，
//   // 通常在应用程序中重新创建一个窗口。
//   if (win === null) {
//     createWindow()
//   }
// })
