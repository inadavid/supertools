$(function () {
    var codes = $('textarea[bid="plme-codes"]');
    var namespec = $('textarea[bid="plme-namespec"]');
    var n_codes = false;
    var f_codes = false;
    var pldata = [];
    codes.on("keypress", scanChange);
    codes.on("blur", scanChange);


    function scanChange() {
        f_codes = true;
        var n_namespec = [];
        n_codes = codes.val().trim().split("\n");
        if (n_codes.length == 0) return;
        for (var i in n_codes) {
            n_codes[i] = n_codes[i].trim();
            if (codesInfo[n_codes[i]]) {
                n_namespec.push(codesInfo[n_codes[i]].name + "|" + codesInfo[n_codes[i]].spec);
            } else {
                n_namespec.push("!ERROR! Code does not exist.");
                f_codes = false;
            }
        }
        namespec.val(n_namespec.join("\n"));
        $("button[bid=export]").prop("disabled", !f_codes);
    }

    $("button[bid=export]").on("click", () => {
        console.log("export click")
        var btn = $(this);
        if (n_codes.length == 0) {
            f_codes = false;
            $("button[bid=export]").prop("disabled", !f_codes);
            return;
        }
        btn.prop("disabled", true);
        pldata = [];
        var n_codes_mirror = JSON.parse(JSON.stringify(n_codes));
        console.log(n_codes_mirror)
        plProcess(n_codes_mirror, () => {
            var path = require('path');
            const fs = require("fs");
            var tmppath = app.getPath("temp") + "/SuperTools";
            if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath);
            var filepath = path.resolve(tmppath + "/Picklist-" + moment().format("YYYYMMDD-HHmmss") + ".temp.csv");
            savedata(filepath, pldata, true, () => {
                btn.prop("disabled", false);
            });
        })
    })

    function plProcess(l_codes, cb) {
        if (l_codes.length == 0) return cb();
        var code = l_codes.splice(0, 1)[0];
        console.log("code=", code, ", l_codes=", l_codes);
        getPicklistData(code, 0, (rdata) => {
            for (var j in rdata) {
                rdata[j].Root = code;
                rdata[j].RootSpec = codesInfo[code].name + "|" + codesInfo[code].spec;
            }
            pldata = pldata.concat(rdata);
            plProcess(l_codes, cb);
        })
    }
})