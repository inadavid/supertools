const user = "SuperTools";
const password = "be5ad9d0b797040743f4bd5fe0b9f26a";
const server = "192.168.18.3";
const database = "SD30602_STJ";

const mysql = require('mysql');
var connection = mysql.createConnection({
    host: server,
    user: user,
    password: password,
    database: database
});
connection.connect();
query = "select data from st_drawings where dsn=" + result.recordset[0].sn;
if (path === false) {
    var tmppath = app.getPath("temp") + "/SuperTools";
    if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath);
    filepath = tmppath + "/" + result.recordset[0].filename;
} else {
    filepath = path;
}
connection.query(query, function (error, results, fields) {
    fs.writeFileSync(filepath, results[0].data);
    if (typeof (cb) == "function") cb(filepath);
});
connection.end();