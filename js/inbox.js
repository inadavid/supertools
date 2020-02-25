$(function () {
    var drs = [];

    function updateContentData() {
        sqltxt = "select * from st_approval where stat = 0 and flownext = " + user.id + " order by date asc;";
        var rltlen = 0;
        var rltcnt = 0;
        var procnt = 0;
        executeMsSql(sqltxt, (err, result) => {
            drs = [];
            rltlen = result.recordset.length;
            var rs = result.recordset;
            for (var i in rs) {
                var trs = rs[i];
                var code = trs.code;
                var version = trs.version;
                var index = rltcnt++;
                drs[index] = trs;
                sqltxt = "select " + index + " as ind, * from st_drawings where code = '" + code + "' and version = '" + version + "' order by filetype;";
                executeMsSql(sqltxt, (err, result) => {
                    if (!err && result.recordset.length > 0) drs[result.recordset[0]["ind"]]["drawings"] = result.recordset;
                    procnt++;
                });
            }
            var itv = setInterval(function () {
                if (procnt < rltlen) {
                    console.log("debug info:", procnt, rltlen)
                    return;
                }
                clearInterval(itv);
                updateContentTable(drs);
            }, 100);
        })
    }

    function updateContentTable(rs) {
        var tbody = $("table[bid=dtable] tbody").html("");
        for (var i in rs) {
            var adata = JSON.parse(rs[i].data);
            var flowinfo = JSON.parse(rs[i].flowinfo);
            var curflow = undefined;
            var curindex = 0;
            if ("auther" in adata) {
                adata["author"] = adata["auther"];
                delete adata["auther"];
            }
            for (var j in flowinfo) {
                if (flowinfo[j].result > 0) continue;
                if (flowinfo[j].opid != user.id) continue;
                curflow = flowinfo[j];
                curindex = j;
                break;
            }
            if (curflow == undefined) {
                console.error("logic error, current approval say current use in flow but cannot find him. \n debug info:", flowinfo, adata, rs);
            }
            var tr = $("<tr>").attr("data", Base64.encode(JSON.stringify(rs[i]))).attr("curindex", curindex);

            tr.append($("<th>").text(rs[i].sn));
            if (rs[i].drawings.length == 1) {
                tr.append($("<td>").html("<a href='#' bid='open' code='" + rs[i].code + "' version='" + rs[i].drawings[0].version + "' filetype='0'>" + rs[i].code + "</a>"));
            } else {
                var html = "";
                for (var ii in rs[i].drawings) {
                    var drw = rs[i].drawings[ii];
                    html += " <a href='#' bid='open' code='" + drw.code + "' version='" + drw.version + "' filetype='" + drw.filetype + "'><span  class='iconfont icon-open'></span>F" + drw.filetype + "</a> "
                }
                tr.append($("<td>").html(rs[i].code + html));
            }
            tr.append($("<td>").text(rs[i].version));
            tr.append($("<td>").text(userlistall[adata.author]));
            tr.append($("<td>").text(adata.reason||""));
            tr.append($("<th>").text(curflow.type));
            tr.append($("<td>").text(moment(rs[i].date).utc().format("YYYY-MM-DD HH:mm:ss")));
            tr.append($("<td>").html("<span><input type='radio' name='r" + rs[i].sn + "' sn='" + rs[i].sn + "' value='1' checked>Approve</span> &nbsp; <span><input type='radio' name='r" + rs[i].sn + "' sn='" + rs[i].sn + "' value='2'>Reject</span>"));
            tr.append($("<td>").html("<input type='text' name='c" + rs[i].sn + "' sn='" + rs[i].sn + "' bid='comment' style='width:100%; margin:0; padding:1px;'>"));
            tr.append($("<td>").append($("<button>").addClass("btn btn-primary btn-sm").attr("bid", rs[i].sn).attr("tag", "submit").text("Submit")));

            tbody.append(tr);
        }
        tbody.find("a").on("click", function () {
            var data = $(this).attr();
            downloadDrawing(data.code, data.version, false, function (fp) {
                const {
                    shell
                } = require('electron');
                // Open a local file in the default app
                shell.openItem(fp);
            }, data.filetype);
        });
        tbody.find("button[tag=submit]").on("click", function () {
            if (!confirm("Are you sure? The result is not irrevocable.")) return;
            var btn = $(this);
            var tr = btn.parents("tr");
            var data = JSON.parse(Base64.decode(tr.attr("data")));
            data.data = JSON.parse(data.data);
            var result = tr.find("input[type=radio]:checked").val() == "1" ? 1 : 2;
            var comment = tr.find("input[bid=comment]").val().trim();
            var curindex = parseInt(tr.attr("curindex"));
            var flowinfo = JSON.parse(data.flowinfo);

            flowinfo[curindex].date = moment().format("YYYY-MM-DD HH:mm:ss");
            flowinfo[curindex].result = result;
            flowinfo[curindex].comment = comment;

            var flownext = flowinfo[curindex + 1] ? flowinfo[curindex + 1].opid : -1;
            var flag_final = false;
            if (result == 1) { //approve this one 
                if (flownext == -1) { //this is final approval 
                    sqltxt = "update st_approval set flowinfo='" + JSON.stringify(flowinfo) + "', flownext = -1, stat = 1 where sn = " + data.sn + "; update st_drawings set stat = 1 where code = '" + data.code + "' and version = " + data.version + ";";
                    flag_final = true;
                    sqltxt += "insert into st_inbox (opid, stat, msg, info_data, type) values (" + data.data.author + ", 0, 'Your drawing " + data.code + " has been <font color=green><b>Approved</b></font>.', '{\"code\":\"" + data.code + "\",\"version\":\"" + data.version + "\",\"stat\":1}', 1);";
                } else { //proceed to next approval
                    sqltxt = "update st_approval set flowinfo='" + JSON.stringify(flowinfo) + "', flownext = " + flownext + " where sn = " + data.sn + ";";
                }
                sqltxt += "insert into st_inbox (opid, stat, msg, info_data, type) values (" + user.id + ", 0, 'Drawing " + data.code + " has been <font color=green><b>Approved</b></font> by you.', '{\"code\":\"" + data.code + "\",\"version\":\"" + data.version + "\",\"stat\":1}', 1);";
            } else { //reject this one.
                sqltxt = "update st_approval set flowinfo='" + JSON.stringify(flowinfo) + "', flownext = -1, stat = 2 where sn = " + data.sn + "; update st_drawings set stat = 3 where code = '" + data.code + "' and version = " + data.version + "; ";
                sqltxt += "insert into st_inbox (opid, stat, msg, info_data, type) values (" + data.data.author + ", 0, 'Your drawing " + data.code + " has been <font color=red><b>REJECTED</b></font> by " + userlistall[user.id] + ".<br>Comments: " + comment + "', '{\"code\":\"" + data.code + "\",\"version\":\"" + data.version + "\",\"stat\":2,\"opid\":" + user.id + ",\"msg\":\"" + comment + "\"}', 1);";
                sqltxt += "insert into st_inbox (opid, stat, msg, info_data, type) values (" + user.id + ", 0, 'Drawing " + data.code + " has been <font color=red><b>REJECTED</b></font> by you.', '{\"code\":\"" + data.code + "\",\"version\":\"" + data.version + "\",\"stat\":2}', 1);";
            }
            executeMsSql(sqltxt, (e) => {
                loadPanel("inbox");
                if (flag_final) {
                    for (var p in data.drawings) {
                        if (data.drawings[p].filetype == 0) stampPDF(data.drawings[p], flowinfo);
                    }
                }
            })
        })
    }

    function updateInbox(page = 0, pageCount = 10) {
        if (pageCount < 10) pageCount = 10;
        var tbody = $("table[bid=inbox] tbody").html("");
        var div = $("div[bid=inbox]");
        sqltxt = "select count(*) as cnt from st_inbox where opid=" + user.id ;
        executeMsSql(sqltxt, (err, result) => {
            if(!err){
                var cnt = result.recordset[0].cnt;
                if(page == 0) {
                    div.find("button[bid='prev']").prop("disabled",true);
                }
                else{
                    div.find("button[bid='prev']").prop("disabled",false);
                }
                if(cnt>(page+1)*10){
                    div.find("button[bid='next']").prop("disabled",false);
                }
                else{
                    div.find("button[bid='next']").prop("disabled",true);
                }
            }
        });
        sqltxt = "select top " + pageCount + " * from st_inbox where opid=" + user.id + " and sn not in (select top " + (page * pageCount) + " sn from st_inbox where opid=" + user.id + " order by sn desc) order by sn desc;";
        console.log(sqltxt);
        executeMsSql(sqltxt, (err, result) => {
            var rs = result.recordset;
            for (var i in rs) {
                var drawing = JSON.parse(rs[i].info_data);
                var tr = $("<tr>");
                tr.append($("<td>").html(rs[i].sn));
                tr.append($("<td>").html("<a href='#' bid='open' code='"+drawing.code+"'>"+drawing.code+"</a>"));
                tr.append($("<td>").html(drawing.version));
                tr.append($("<td>").html(rs[i].type == 1 ? "Drawing" : "BOM"));
                tr.append($("<td>").html(moment(rs[i].date).utc().format("YYYY-MM-DD HH:mm:ss")));
                tr.append($("<td>").html(rs[i].msg));
                tbody.append(tr);
            }
            tbody.find("a[bid=open]").off("click").on("click",function(){
                drawingCode = $(this).attr("code");
                console.log(drawingCode)
                loadPanel("drawingdis");
            })
        });
    }

    function updateDrawingProcess() {
        sqltxt = "select * from st_approval where stat=0 and (data like '%\"author\":" + user.id + ",%' or data like '%\"author\":" + user.id + "}') order by sn desc";
        var tbody = $("table[bid=dprocess] tbody").html("");
        executeMsSql(sqltxt, (err, result) => {
            var rs = result.recordset;
            for (var i in rs) {
                var tr = $("<tr>");
                var data = JSON.parse(rs[i].flowinfo);
                tr.append($("<td>").html(rs[i].sn));
                tr.append($("<td>").html("<a href='#' bid='open' code='" + rs[i].code + "'>"+rs[i].code+"</a>"));
                tr.append($("<td>").html(rs[i].version));
                tr.append($("<td>").html(moment(rs[i].date).utc().format("YYYY-MM-DD HH:mm:ss")));
                for (var j in data) {
                    if (data[j].result == 0) {
                        tr.append($("<td>").html(data[j].type));
                        tr.append($("<td>").html(userlistall[data[j].opid]));
                        break;
                    }
                }
                tbody.append(tr);
            }
            tbody.find("a[bid=open]").off("click").on("click",function(){
                var code = $(this).attr("code");
                drawingCode = code;
                loadPanel("drawingdis");
            })
        });
    }

    updateContentData();
    updateInbox();
    updateDrawingProcess();

    $("div[bid=inbox] button[bid=prev]").on("click", function(){
        var page= parseInt($("div[bid=inbox] input[bid=page]").val());
        if(page<=1) return;
        updateInbox(page-2);
        $("div[bid=inbox] input[bid=page]").val(page-1);
    });
    $("div[bid=inbox] button[bid=next]").on("click", function(){
        var page= parseInt($("div[bid=inbox] input[bid=page]").val());
        updateInbox(page);
        $("div[bid=inbox] input[bid=page]").val(page+1);
    });
})

// function stampPDF(drawing,flowinfo){
//     var url="http://"+config.updateServer+":"+config.updatePort+"/drawingUpdate/"+drawing.sn+"/"+Base64.encode(flowinfo);
//     console.log("requesting: "+url);
//     //$.get(url);
// }
function stampPDF(drawing, flow) {
    const {
        degrees,
        PDFDocument,
        rgb,
        fetch,
        StandardFonts
    } = require('pdf-lib');
    var dsn = drawing.sn;
    var flowinfo = {}
    for (var i in flow) {
        if (flow[i].type == "check") {
            flowinfo["check"] = flow[i]
        }
        if (flow[i].type == "approve") {
            flowinfo["approve"] = flow[i]
        }
    }
    //1. get the drawing data.
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: config.mysqlServer,
        user: config.serverconfig.user,
        password: config.serverconfig.password,
        database: config.serverconfig.user
    });
    connection.connect();
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
            for (var p in pages) {
                const firstPage = pages[p];
                const pageSize = firstPage.getSize();
                var size = false,
                    ppi = false;
                //guess the drawing size by the page size of pdf.
                //https://www.papersizes.org/a-sizes-in-pixels.htm
                if (pageSize.width > 832 && pageSize.width < 852 && pageSize.height > 585 && pageSize.height < 605) {
                    size = "A4";
                    ppi = "72";
                }
                if (pageSize.width > 1181 && pageSize.width < 1201 && pageSize.height > 832 && pageSize.height < 852) {
                    size = "A3";
                    ppi = "72";
                }
                if (pageSize.width > 1674 && pageSize.width < 1694 && pageSize.height > 1181 && pageSize.height < 1201) {
                    size = "A2";
                    ppi = "72";
                }
                if (pageSize.width > 2374 && pageSize.width < 2394 && pageSize.height > 1674 && pageSize.height < 1694) {
                    size = "A1";
                    ppi = "72";
                }
                if (pageSize.width > 3360 && pageSize.width < 3380 && pageSize.height > 2374 && pageSize.height < 2394) {
                    size = "A0";
                    ppi = "72";
                }

                if (pageSize.width > 1113 && pageSize.width < 1133 && pageSize.height > 784 && pageSize.height < 804) {
                    size = "A4";
                    ppi = "96";
                }
                if (pageSize.width > 1577 && pageSize.width < 1597 && pageSize.height > 1113 && pageSize.height < 1133) {
                    size = "A3";
                    ppi = "96";
                }
                if (pageSize.width > 2235 && pageSize.width < 2255 && pageSize.height > 1577 && pageSize.height < 1597) {
                    size = "A2";
                    ppi = "96";
                }
                if (pageSize.width > 3169 && pageSize.width < 3189 && pageSize.height > 2235 && pageSize.height < 2255) {
                    size = "A1";
                    ppi = "96";
                }
                if (pageSize.width > 4484 && pageSize.width < 4504 && pageSize.height > 3169 && pageSize.height < 3189) {
                    size = "A0";
                    ppi = "96";
                }

                if (pageSize.width > 1744 && pageSize.width < 1764 && pageSize.height > 1230 && pageSize.height < 1250) {
                    size = "A4";
                    ppi = "150";
                }
                if (pageSize.width > 2470 && pageSize.width < 2490 && pageSize.height > 1744 && pageSize.height < 1764) {
                    size = "A3";
                    ppi = "150";
                }
                if (pageSize.width > 3498 && pageSize.width < 3518 && pageSize.height > 2470 && pageSize.height < 2490) {
                    size = "A2";
                    ppi = "150";
                }
                if (pageSize.width > 4957 && pageSize.width < 4977 && pageSize.height > 3498 && pageSize.height < 3518) {
                    size = "A1";
                    ppi = "150";
                }
                if (pageSize.width > 7012 && pageSize.width < 7032 && pageSize.height > 4957 && pageSize.height < 4977) {
                    size = "A0";
                    ppi = "150";
                }
                //set location of stamp for different drawings size and ppi.
                var xyloc = {
                    "72": {
                        "A3": {
                            xc: 710,
                            yc: 40,
                            xd: 795,
                            ya: 20,
                            font: 8
                        },
                        "A4": {
                            xc: 362,
                            yc: 40,
                            xd: 448,
                            ya: 20,
                            font: 8
                        }
                    }
                };
                //make stamp
                if (xyloc[ppi][size]) {
                    var loc = xyloc[ppi][size];
                    firstPage.drawText(formatName(userlistall[flowinfo["check"].opid]), {
                        x: loc.xc,
                        y: loc.yc,
                        size: loc.font,
                        font: timesRomanFont,
                        color: rgb(0.0, 0.0, 0.0),
                        rotate: degrees(0),
                    })
                    firstPage.drawText(formatName(userlistall[flowinfo["approve"].opid]), {
                        x: loc.xc,
                        y: loc.ya,
                        size: loc.font,
                        font: timesRomanFont,
                        color: rgb(0.0, 0.0, 0.0),
                        rotate: degrees(0),
                    })
                    firstPage.drawText(moment(flowinfo["check"].date).format("YYYY.MM.DD"), {
                        x: loc.xd,
                        y: loc.yc,
                        size: loc.font,
                        font: timesRomanFont,
                        color: rgb(0.0, 0.0, 0.0),
                        rotate: degrees(0),
                    })
                    firstPage.drawText(moment(flowinfo["approve"].date).format("YYYY.MM.DD"), {
                        x: loc.xd,
                        y: loc.ya,
                        size: loc.font,
                        font: timesRomanFont,
                        color: rgb(0.0, 0.0, 0.0),
                        rotate: degrees(0),
                    })
                }
            }
            const pdfBytes = await pdfDoc.save()
            //update to database
            query = "delete from st_drawings where dsn = " + dsn;
            connection.query(query, () => {
                var fn = app.getPath("temp") + "/SuperTools/" + "t.pdf"
                fs.writeFileSync(fn, pdfBytes);
                query = "INSERT INTO st_drawings SET ? ";
                value = {
                    dsn: dsn,
                    data: fs.readFileSync(fn)
                }
                connection.query(query, value);
            });

            sqltxt = "update st_drawings set size = '" + size + "' where sn = " + dsn;
            executeMsSql(sqltxt);
            //write to temp file for testing.
            // console.log(size,ppi)
            // fs.writeFileSync("c:/temp/t.pdf", pdfBytes);
            console.log("stamp on drawing:", drawing)
        };
        tmpf()
    });
}

function formatName(cnn) {
    var pinyin = require("chinese-to-pinyin");
    var tn = pinyin(cnn, {
        removeTone: true
    });
    var tna = tn.split(" ");
    if (tna[0]) tna[0] = tna[0].substring(0, 1).toUpperCase() + tna[0].substring(1);
    if (tna[1]) tna[1] = tna[1].substring(0, 1).toUpperCase() + tna[1].substring(1);
    return tna.join("");
}
//[{"type":"check","opid":28,"date":false,"result":0,"comment":""},{"type":"approve","opid":28,"date":false,"result":0,"comment":""}]