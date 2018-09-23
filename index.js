const {app, BrowserWindow} = require('electron')

let win = null;

function createWindow () {
<<<<<<< HEAD
  // 创建浏览器窗口。
  win = new BrowserWindow({width: 800, height: 500})
=======
  win = new BrowserWindow({width: 800, height: 600})
>>>>>>> 09ae0e3644dcff45adef32f0e6c5bdcffa63d0f2

  win.loadFile('file://${__dirname}/html/index.html')

  // 打开开发者工具
  //win.webContents.openDevTools()

  win.on('closed', () => {
    console.log("main window closed")
    win = null
  })
}

app.commandLine.appendSwitch('remote-debugging-port', '8315')
app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1')
app.on('ready', createWindow);

<<<<<<< HEAD
// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})
  
// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。
=======

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
>>>>>>> 09ae0e3644dcff45adef32f0e6c5bdcffa63d0f2
