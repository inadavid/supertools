const express = require('express')
var bodyParser = require('body-parser');
var moment = require("moment");
const app = express()
const path = require('path');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

var filepath = 'D:\\supertools-update\\update' // or ../update.zip
var fileurl = 'http://sv009168.corp01.schleuniger.com:8082/update.7z';
var vers = [];
if (process.argv[2] == "dev") {
	filepath = path.normalize(__dirname + "/../release-builds/update.7z") // or ../update.zip
	fileurl = 'http://127.0.0.1:8082/update.7z';
}
const fs = require("fs");
app.post('/update', function (req, res) {
	var dir = fs.readdirSync(filepath)
	vers = [];
	for (var i in dir) {
		if (dir[i].indexOf('update.') != -1) {
			var tv = dir[i].substr(dir[i].indexOf('update.') + 7, dir[i].indexOf('.7z') - dir[i].indexOf('update.') - 7);
			if (tv.substr(0, 1) == '0') vers.push(tv);
		}
	}
	res.write(JSON.stringify({
		"last": "V" + vers[vers.length - 1],
		"file": fileurl
	}).replace(/[\/]/g, '\\/'));
	console.log("reply to post to " + req.ip + " @" + moment().format("HH:mm:ss"))
	res.end();
})

app.get('/update.7z', function (req, res) {
	var fp = filepath + "/update." + vers[vers.length - 1] + ".7z";
	var stat = fs.statSync(fp);
	var file = fs.readFileSync(fp, 'binary');
	res.setHeader('Content-Length', stat.size);
	res.setHeader('Content-Type', 'application/zip');
	res.setHeader('Content-Disposition', 'attachment; filename=update.7z');
	res.write(file, 'binary');
	res.end();
	console.log("sent update file @" + moment().format("HH:mm:ss"))
});

app.listen(8082)
console.log('run port: 8082')