const express = require('express')
var bodyParser = require('body-parser');
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var version = 'V0166';
var filepath = '/home/update/update.0166.7z' // or ../update.zip
const fs = require("fs");
app.post('/update', function (req, res) {
    res.write(JSON.stringify({ "last": version, "file": "http://192.168.16.12:8082/update.7z" }).replace(/[\/]/g, '\\/'));
    res.end();
});
app.get('/update.7z', function(req,res) {
	var stat = fs.statSync(filepath);
	var file = fs.readFileSync(filepath, 'binary');
	res.setHeader('Content-Length', stat.size);
	res.setHeader('Content-Type', 'application/zip');
	res.setHeader('Content-Disposition', 'attachment; filename=update.7z');
	res.write(file, 'binary');
	res.end();
});

app.listen(8082)
console.log('run port: 8082')
