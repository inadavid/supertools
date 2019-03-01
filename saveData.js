
const mssql = require('mssql');
var Base64 = require('js-base64').Base64;
var fs = require("fs");
mssql.connect({
    user: "SuperTools",
    password: "be5ad9d0b797040743f4bd5fe0b9f26a",
    server: "192.168.18.3",
    database: "SD30602_STJ",
    port: 1433,
    stream: false,
    parseJSON: false,
    options: { encrypt: false }
}, err => {
    if (err) {
        console.error(err);
    } else {

        new mssql.Request().query("select remark from st_log where action='GenerateBOMsql';", (err, result) => {
            // ... error checks
            //console.log(result)
            if (result.rowsAffected == 0) {
                console.log("bad sql")
            } else {
                var rs = result.recordset;
                var out = "";
                for (var i in rs) {
                    var sql = Base64.decode(rs[i].remark).split("|");
                    out += (sql[0]);
                }
                fs.writeFileSync("./sql.txt", out)
                process.exit();
            }
        })
    }
});