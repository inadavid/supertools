const express = require('express')
var bodyParser = require('body-parser');
var moment = require("moment");
const app = express()
const path = require('path');
const {
	degrees,
	PDFDocument,
	rgb,
	StandardFonts
} = require('pdf-lib');

const ini = require('ini');
const fs = require('fs');
var configFile = '../config.ini';
var config = ini.parse(fs.readFileSync(configFile, 'utf-8'));

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

app.get('/drawingUpdate/:dsn/:adata', function (req, res) {
	console.log(req.params);
	var dsn = req.params.dsn;
	//1. get the drawing data.
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: config.mysqlServer,
		user: config.serverconfig.user,
		password: config.serverconfig.password,
		database: config.serverconfig.user
	});
	query = "select data from st_drawings where dsn=" + dsn;
	connection.query(query, function (error, results, fields) {
		var ddata = results[0].data;
		//fs.writeFileSync(filepath, results[0].data);
		//2. import pdf lib. open current pdf data. get page information.
		//below codes comes from https://www.npmjs.com/package/pdf-lib#modify-document
		async function tmpf() {
			const pdfDoc = await PDFDocument.load(ddata)
			const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
			const pages = pdfDoc.getPages();
			const firstPage = pages[0];
			const pageSize = firstPage.getSize();
			var size=false, ppi=false;
			console.log(pageSize);
			//https://www.papersizes.org/a-sizes-in-pixels.htm
			if(pageSize.width>832 && pageSize.width<852 && pageSize.height>585 && pageSize.height<605) {size="A4"; ppi="72";}
			if(pageSize.width>1181 && pageSize.width<1201 && pageSize.height>832 && pageSize.height<852) {size="A3"; ppi="72";}
			if(pageSize.width>1674 && pageSize.width<1694 && pageSize.height>1181 && pageSize.height<1201) {size="A2"; ppi="72";}
			if(pageSize.width>2374 && pageSize.width<2394 && pageSize.height>1674 && pageSize.height<1694) {size="A1"; ppi="72";}
			if(pageSize.width>3360 && pageSize.width<3380 && pageSize.height>2374 && pageSize.height<2394) {size="A0"; ppi="72";}
			
			if(pageSize.width>1113 && pageSize.width<1133 && pageSize.height>784 && pageSize.height<804) {size="A4"; ppi="96";}
			if(pageSize.width>1577 && pageSize.width<1597 && pageSize.height>1113 && pageSize.height<1133) {size="A3"; ppi="96";}
			if(pageSize.width>2235 && pageSize.width<2255 && pageSize.height>1577 && pageSize.height<1597) {size="A2"; ppi="96";}
			if(pageSize.width>3169 && pageSize.width<3189 && pageSize.height>2235 && pageSize.height<2255) {size="A1"; ppi="96";}
			if(pageSize.width>4484 && pageSize.width<4504 && pageSize.height>3169 && pageSize.height<3189) {size="A0"; ppi="96";}

			if(pageSize.width>1744 && pageSize.width<1764 && pageSize.height>1230 && pageSize.height<1250) {size="A4"; ppi="150";}
			if(pageSize.width>2470 && pageSize.width<2490 && pageSize.height>1744 && pageSize.height<1764) {size="A3"; ppi="150";}
			if(pageSize.width>3498 && pageSize.width<3518 && pageSize.height>2470 && pageSize.height<2490) {size="A2"; ppi="150";}
			if(pageSize.width>4957 && pageSize.width<4977 && pageSize.height>3498 && pageSize.height<3518) {size="A1"; ppi="150";}
			if(pageSize.width>7012 && pageSize.width<7032 && pageSize.height>4957 && pageSize.height<4977) {size="A0"; ppi="150";}
			
			var xyloc = {
				"72":{
					"A3":{
						xc: 712, yc:40, xa:712, ya: 20 
					}
				}
			};
			if(xyloc[ppi][size]){
				var loc = xyloc[ppi][size];
				firstPage.drawText(timesRomanFont.encodeText('审核人'), {
					x: loc.xc,
					y: loc.yc,
					size: 10,
					font: timesRomanFont,
					color: rgb(0.0, 0.0, 0.0),
					rotate: degrees(0),
				})
				firstPage.drawText(timesRomanFont.encodeText('批准人'), {
					x: loc.xa,
					y: loc.ya,
					size: 10,
					font: timesRomanFont,
					color: rgb(0.0, 0.0, 0.0),
					rotate: degrees(0),
				})
			}
			const pdfBytes = await pdfDoc.save()
			fs.writeFileSync("c:/temp/t.pdf",pdfBytes)
		};
		tmpf()
	});
	res.end("endendend");
})

app.listen(8082)
console.log('run port: 8082')