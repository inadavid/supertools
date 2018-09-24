# SuperTools

#### 项目介绍
Electron练笔项目，为SuperData 5000生成批量SQL语句。

#### 软件架构


#### 使用说明
运行SuperTools:

    git clone https://gitee.com/schleuniger_tj/SuperTools.git
    npm i
    npm start

编译SuperTools:

    npm install electron-packager -g
    electron-packager ./ SuperTools --platform=win32 --arch=x64

按照编译系统的类型更改platform和arch。上文中的命令会生成 SuperTools-win32-x64 目录。