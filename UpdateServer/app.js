const express = require('express')
var bodyParser = require('body-parser');
var moment = require("moment");
const app = express()
const path = require('path');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

var version = 'V0167';
var filepath = '/home/update/update.0167.7z' // or ../update.zip
var fileurl = 'http://192.168.16.12:8082/update.7z';

if (process.argv[2] == "dev") {
	filepath = path.normalize(__dirname + "/../release-builds/update.7z") // or ../update.zip
	fileurl = 'http://127.0.0.1:8082/update.7z';
}
const fs = require("fs");
app.post('/update', function (req, res) {
	res.write(JSON.stringify({
		"last": version,
		"file": fileurl
	}).replace(/[\/]/g, '\\/'));
	console.log("reply to post @" + moment().format("HH:mm:ss"))
	res.end();
});
app.get('/update.7z', function (req, res) {
	var stat = fs.statSync(filepath);
	var file = fs.readFileSync(filepath, 'binary');
	res.setHeader('Content-Length', stat.size);
	res.setHeader('Content-Type', 'application/zip');
	res.setHeader('Content-Disposition', 'attachment; filename=update.7z');
	res.write(file, 'binary');
	res.end();
	console.log("sent update file @" + moment().format("HH:mm:ss"))
});

app.listen(8082)
console.log('run port: 8082')