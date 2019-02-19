var selectedAction = "byECOcode";
today = moment().format("YYYY-MM-DD")
$(function () {
    $('table.optionTable input[type=date]').val(today);
    $('table.optionTable input[name="searchtype"][value=byECOcode]').click();
    if (ecosn != 0) {
        $('table.optionTable tr[name="byECOcode"] input[name="code"]').val(ecosn);
        ecosn = 0;
        $('button[bid="bomecoSearch"]').click();
    }
})

$('table.optionTable input[name="searchtype"]').click(function () {
    selectedAction = $(this).val();
    $("table.optionTable").find("tr").css("background-color", "").find("td[name] input").prop("disabled", true);
    $("table.optionTable").find("tr[name=" + selectedAction + "]").css("background-color", "#eeeeee").find("input").prop("disabled", false);
})

$('table.optionTable tr').click(function () {
    if (selectedAction == $(this).find('input[name="searchtype"]').val()) return;
    $(this).find('input[name="searchtype"]').click();
});

$('button[bid="bomecoSearch"]').click(function () {
    co(function* () {
        try {
            var coConn = new cosql.Connection(config.serverconfig);
            yield coConn.connect();
            var request = new cosql.Request(coConn);

            //senario 1 : search by ECO code
            if (selectedAction == "byECOcode") {
                var code = $('table.optionTable tr[name="' + selectedAction + '"] input[name="code"]').val().trim();
                if (code.length == 0) {
                    alert("Please input ECO# or Code#.");
                    return;
                }
                var sqltext = "select a.*,b.opname from st_bomeco as a inner join m_operator as b on a.userid=b.opid where parentgid='" + code + "' or sn=" + code + ";";
                recordset = yield request.query(sqltext);

                for (var i in recordset) {
                    var card = $("<div>").addClass("card-body");
                    var table = $("<table>").addClass("treetable");
                }

            }

        } catch (ex) {
            // ... error checks
            console.error(ex)
        }
    })();
})