$(function () {
    var pem = {};
    pem['1'] = 10;
    pem['2'] = 12;
    pem['4'] = 13;
    pem['5'] = 14;
    pem['11'] = 4;
    pem['12'] = 3;
    pem['13'] = 18;
    pem['14'] = 15;
    pem['15'] = 11;
    pem['21'] = 9;
    pem['29'] = 2;
    pem['31'] = 19;
    pem['32'] = 7;
    pem['34'] = 24;
    pem['36'] = 36;
    pem['48'] = 31;
    pem['49'] = 30;
    pem['50'] = 34;
    pem['51'] = 32;
    pem['52'] = 25;
    pem['54'] = 28;
    pem['55'] = 16;
    pem['56'] = 33;
    pem['57'] = 26;
    pem['58'] = 21;
    pem['59'] = 22;
    pem['60'] = 6;
    pem['61'] = 29;
    pem['62'] = 5;
    pem['64'] = 37;
    pem['65'] = 39;
    pem['66'] = 35;
    pem['67'] = 38;
    pem['68'] = 40;
    pem['69'] = 41;
    pem['70'] = 42;

    $("button[bid=go]").click(function () {
        var table = $("input[bid=table]").val();
        var col = $("input[bid=col]").val();
        var sqltext = "select sn," + col + " from " + table + " where ";
        for (var oldpm in pem) sqltext += col + " = " + oldpm + " or ";
        sqltext += col + " = 0;"
        executeMsSql(sqltext, (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
            $('pre[bid="output"]').html("");
            var rs = result.recordset;

            for (var oldpm in pem) {
                var sqltext = "update " + table + " set " + col + " = " + pem[oldpm] + " where ";
                var flag = false;
                for (var i in rs) {
                    if (rs[i][col] == oldpm) {
                        sqltext += " sn = " + rs[i].sn + " or ";
                        flag = true;
                    }

                }
                if (flag) {
                    sqltext += " sn = -1;";
                    $('pre[bid="output"]').append(sqltext + "\n");
                }
            }
        });
    })

    $('pre[bid="output"]').click(function () {
        var cont = $(this).html();
        clipboard.writeText(cont);
        popup("SQL has been copied to clipboard!");
    });

});