var selectedAction = "byECOcode";
var tempBomTop = [];
today = moment().format("YYYY-MM-DD")
$(function () {
    $('table.optionTable input[type=date]').val(today);
    $('table.optionTable input[name="searchtype"][value=byECOcode]').click();
    if (ecosn != 0) {
        $('table.optionTable tr[name="byECOcode"] input[name="eco"]').val(ecosn);
        ecosn = 0;
        $('button[bid="bomecoSearch"]').click();
    }

    new Awesomplete('table.optionTable tr[name="byName"] input[name=name]', {
        list: ["王福顺", "王世静", "王佳宇", "毕磊", "杨竣轶", "张瑞", "刘洪杰", "孙世峰", "李猛", "彭宝奎", "魏亮"],
        minChars: 0
    });
    var sqltext = "select goodsid from st_bomtop;";
    new sql.Request().query(sqltext, (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        allcodesHint = [];
        tempBomTop = []
        for (var m in result.recordset) {
            allcodesHint.push({
                label: result.recordset[m].goodsid + " | " + codesInfo[result.recordset[m].goodsid].name + " | " + codesInfo[result.recordset[m].goodsid].spec,
                value: result.recordset[m].goodsid
            })
            tempBomTop.push(result.recordset[m].goodsid);
        }
        new Awesomplete('table.optionTable tr[name="byFGcode"] input[name=fgcode]', {
            list: allcodesHint,
            minChars: 4,
            maxItems: 15,
        });
    });
})

$('table.optionTable input[type=text]').keypress(function (e) {
    if (e.which == 13) $("button[bid=bomecoSearch]").trigger("click");
})
$('table.optionTable input[name="searchtype"]').click(function () {
    selectedAction = $(this).val();
    // if (selectedAction == "byFGcode") { // comment
    //     popup("Under construction...", "warning");
    //     return false;
    // }
    $("table.optionTable").find("tr").css("background-color", "").find("td[name] input").prop("disabled", true);
    $("table.optionTable").find("tr[name=" + selectedAction + "]").css("background-color", "#eeeeee").find("input").prop("disabled", false);
})

$('table.optionTable tr').click(function () {
    if (selectedAction == $(this).find('input[name="searchtype"]').val()) return;
    $(this).find('input[name="searchtype"]').click();
});

$('button[bid="bomecoSearch"]').click(function () {
    var cards = $("div[bid='ecoBody']");
    cards.html("<div class='card-body'><h5>Searching BOM ECO ...</h5></div>");
    co(function* () {
        try {
            var coConn = new cosql.Connection(config.serverconfig);
            yield coConn.connect();
            var request = new cosql.Request(coConn);
            var sqltext = "";
            //senario 1 : search by ECO code
            if (selectedAction == "byECOcode") {
                var code = $('table.optionTable tr[name="' + selectedAction + '"] input[name="eco"]').val().trim();
                if (code.length == 0) {
                    alert("Please input ECO#.");
                    return;
                }
                sqltext = "select a.*,b.opname from st_bomeco as a inner join m_operator as b on a.userid=b.opid where ";
                if (IDeco(code)) sqltext += " sn=" + IDeco(code);
                else sqltext += " sn=" + code;
                sqltext += " order by [date] desc;";
            }
            //senario 2 : search by erp code
            if (selectedAction == "byCode") {
                var code = $('table.optionTable tr[name="' + selectedAction + '"] input[name="code"]').val().trim();
                if (code.length == 0) {
                    alert("Please input Code#.");
                    return;
                }
                sqltext = "select a.*,b.opname from st_bomeco as a inner join m_operator as b on a.userid=b.opid where parentgid='" + code + "' order by [date] desc;";
            }

            //senario 3 : search by operator name
            if (selectedAction == "byName") {
                var code = $('table.optionTable tr[name="' + selectedAction + '"] input[name="name"]').val().trim();
                if (code.length == 0) {
                    alert("Please input Operator name.");
                    return;
                }
                sqltext = "select a.*,b.opname from st_bomeco as a inner join m_operator as b on a.userid=b.opid and b.opname='" + code + "'  order by [date] desc;";
            }
            //senario 4: search by ECO date
            if (selectedAction == "byECOdate") {
                var startDate = moment($('table.optionTable tr[name="' + selectedAction + '"] input[name="startDate"]').val() + " 00:00:01");
                var endDate = moment($('table.optionTable tr[name="' + selectedAction + '"] input[name="endDate"]').val() + " 00:00:01").add(1, 'day');
                if (startDate > endDate || startDate > moment() || endDate < moment()) {
                    alert("Please check your date info.");
                    return;
                }
                sqltext = "select a.*,b.opname from st_bomeco as a inner join m_operator as b on a.userid=b.opid where [date] >= '" + startDate.format("YYYY-MM-DD") + "' and [date] <= '" + endDate.format("YYYY-MM-DD") + "' order by [date] desc;";
            }

            //senario 5: search by fgcode
            if (selectedAction == "byFGcode") {
                var fgcode = $('table.optionTable tr[name="' + selectedAction + '"] input[name="fgcode"]').val().trim();
                if (tempBomTop.indexOf(fgcode) == -1) {
                    alert("The code you input is not a Finish Good code.");
                    return;
                }
                sqltext = "WITH CTE AS (SELECT b.*,cast('" + fgcode + "' as varchar(2000)) as pid , lvl=1 FROM dbo.st_goodsbom as b WHERE goodsid='" + fgcode + "' UNION ALL SELECT b.*, cast(c.pid+'.'+b.goodsid as varchar(2000)) as pid, lvl+1 FROM dbo.st_goodsbom as b INNER JOIN CTE as c ON b.goodsid=c.elemgid) select a.sn from st_bomeco as a inner join CTE as c on c.goodsid=a.parentgid or c.elemgid=a.parentgid group by a.sn;";
                recordset = yield request.query(sqltext);
                sqltext = "select a.*,b.opname from st_bomeco as a inner join m_operator as b on a.userid=b.opid where sn = 0";
                for (var n in recordset) sqltext += " or sn = " + recordset[n].sn;
                sqltext += " order by [date] desc;";
            }

            recordset = yield request.query(sqltext);
            cards.html("<div class='card-body'><h5> Found " + recordset.length + " BOM ECO.</h5></div>");
            for (var i in recordset) {
                var card = $("<div>").addClass("card-body");
                var table = $("<table>").addClass("treetable").css("width", "100%");
                var tr = $("<tr>").attr("bid", "typetr");
                var td = $("<td>")
                var affectedRows = JSON.parse(Base64.decode(recordset[i].data));
                var html = table.clone()
                var day = moment.utc(recordset[i].date).format("YYYY-MM-DD HH:mm:ss");
                html.append(tr.clone().append(td.clone().css("width", "100px").text("ECO ID:")).append(td.clone().text(ecoID(recordset[i].sn)).addClass("selectable")));
                html.append(tr.clone().append(td.clone().text("Owner")).append(td.clone().text(recordset[i].opname).addClass("selectable")));
                html.append(tr.clone().append(td.clone().text("Applied Date")).append(td.clone().text(day).addClass("selectable")));
                html.append(tr.clone().append(td.clone().text("Comments")).append(td.clone().text(Base64.decode(recordset[i].comments)).addClass("selectable")));
                html.append(tr.clone().append(td.clone().text("Affected rows")).append(td.clone().text(affectedRows.length).addClass("selectable")));
                html.append(tr.clone().append(td.clone().text("Parent code")).append(td.clone().text(recordset[i].parentgid).addClass("selectable")));

                for (var m in affectedRows) {
                    var data = affectedRows[m].data;
                    var text = "S" + data.order + " | " + data.code + " | " + codesInfo[data.code].name + " | " + data.qty + codesInfo[data.code].unit + " | " + data.ptype;
                    html.append(tr.clone().append(td.clone().text(affectedRows[m].action).addClass("selectable")).append(td.clone().text(text).addClass("selectable")).addClass(affectedRows[m].action));
                }
                card.append("<h5>" + ecoID(recordset[i].sn) + " on : " + recordset[i].parentgid + "</h5>").append(html);
                cards.append(card);
            }

        } catch (ex) {
            // ... error checks
            console.error(ex)
        }
    })();
})