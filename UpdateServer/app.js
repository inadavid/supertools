const express = require('express')
var bodyParser = require('body-parser');
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var desktop_app_version = 'v0166';
var desktop_app_URL = 'http://192.168.16.12:8083/update.zip' // or ../update.zip

app.post('/update', function (req, res) {
    if (req.body && req.body.current != desktop_app_version) { // check for server side
        res.write(JSON.stringify({ "last": desktop_app_version, "source": desktop_app_URL }).replace(/[\/]/g, '\\/'));
    } else {
        res.write(JSON.stringify({ "last": desktop_app_version }).replace(/[\/]/g, '\\/'));
    }
    res.end();
});

app.listen(8082)
console.log('run port: 8082')