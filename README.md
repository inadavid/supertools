# SuperTools

#### 项目介绍
Electron练笔项目，为SuperData 5000生成批量SQL语句。

欢迎Jane的加入。

#### 软件架构


#### 使用说明
运行SuperTools:
```bash
    git clone https://gitee.com/schleuniger_tj/SuperTools.git
    npm i
    npm start
```
编译SuperTools:
```bash
    npm install electron-packager -g
    electron-packager ./ SuperTools --platform=win32 --arch=x64
```
按照编译系统的类型更改platform和arch。上文中的命令会生成 SuperTools-win32-x64 目录。

#### 关于Git和协作开发
对于Git协同开发的操作简单介绍如下（与本软件无关）：
 - 在VSCode里启用Git或在NodeJS_Portable里使用Git。
 - 进行相关的个人设置和初始化：
```bash
    git config --global user.name "David Wei"
    git config --global user.email "david.wei@schleuniger.com"
```
 - 找到你的工作目录，clone项目：
```bash
    git clone https://gitee.com/schleuniger_tj/SuperTools.git
```
 - 进行本地更改、测试后，进行变更确认：
```bash
    cd SuperTools
    git commit -a -m "change notes"
```
 - 如果遇到提示说文件变更不在监视范围内，可以先添加文件：
```bash
    git add *
```
 - 当前的模块或者任务编程调试完成后，把相关commit的文件push到gitee上。
```bash
    git push
```
 - 另外，在每次开始工作之前，要先fetch一下gitee上最新的代码，保持本地仓库最新。
```bash
    git fetch
```

#### 软件授权
| Library    | License      | npm page  |
|------------|--------------|-----------|
| electron   | MIT          | [Link](https://www.npmjs.com/package/electron) |
| js-base64  | BSD-3-Clause | [Link](https://www.npmjs.com/package/js-base64) |
| mssql      | MIT          | [Link](https://www.npmjs.com/package/mssql) |
| ping       | MIT          | [Link](https://www.npmjs.com/package/ping) |
| sqlite-sync| MIT          | [Link](https://www.npmjs.com/package/sqlite-sync) |
| underscore | MIT          | [Link](https://www.npmjs.com/package/underscore) |
| Moment.js  | MIT          | [Link](https://www.npmjs.com/package/moment) |
| modbus-tcp | MIT          | [Link](https://www.npmjs.com/package/modbus-tcp) |
| node-opcua | MIT          | [Link](https://www.npmjs.com/package/node-opcua) |