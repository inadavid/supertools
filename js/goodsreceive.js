$(function(){
    var inputData;
    var pageCount = 20;
    var page = 1;

    setTimeout(function(){
        $('input[bid="infoinput"]').focus().select();
    },100);
    $('input[bid="infoinput"]').off("keypress").on("keypress",function(e){
        if (e.which == 13) processScan();
    })
    
    if(user.perm.indexOf(41)==-1) $('button[bid="export"]').hide();

    $('div[bid="goodsReceiveInfo"] button[tag=cancel]').off("click").on("click",function(){
        $.modal.close();
        $(document).off("keydown");
        $('input[bid="infoinput"]').val("").focus().select();
    })
    
    $('div[bid="goodsReceiveInfo"] button[tag=confirm]').off("click").on("click",function(){
        $.modal.close();
        $('input[bid="infoinput"]').val("");
        $(document).off("keydown");
        var code = inputData[0];
        var qty = parseFloat($('div[bid="goodsReceiveInfo"] input[bid="gr.qty.receive"]').val());
        var pocode = inputData[2];
        var trader = $('div[bid="goodsReceiveInfo"] td[bid="gr.trader"]').text().trim();
        var sqltext = "select count(*) as cnt from st_goodsreceive where po = '"+pocode+"' and code = '"+code+"';"
        executeMySql(sqltext, function (err, result){
            if(result[0].cnt > 0){
                if(!confirm("订单"+pocode+"已经做过物料"+code+"的收货操作。\n您确认这不是同一送货单的重复收货么？")) {
                    $('input[bid="infoinput"]').val("").focus().select();
                    return;
                }
            }
            sqltext = "insert into st_goodsreceive (code, po, opid, quantity, trader) values ('"+code+"','"+pocode+"', "+user.id+" , "+qty+", '"+trader+"');";
            executeMySql(sqltext,function (err, result){
                console.log("database insert updated");
                updateHistory();
                $('input[bid="infoinput"]').val("").focus().select();
            })
        })
    })

    $('div[bid="goodsReceiveInfo"]').off($.modal.OPEN).on($.modal.OPEN, function(){
        setTimeout(function(){
            $(document).off("keydown").on("keydown", function (e) {
                if (e.which == 13) $('div[bid="goodsReceiveInfo"] button[tag=confirm]').click();
            })
        },100)
    })

    $('input[bid="kw"]').off("keypress").on("keypress",function(e){
        if(e.which == 13) $('button[bid="filter"]').click();
    })

    $('button[bid="filter"]').off("click").on("click",function(){
        updateHistory();
    })
    $('button[bid="export"]').off("click").on("click",function(){
        exportHistory();
    })

    function processScan(){
        var $input = $('input[bid="infoinput"]');
        if($input.val().trim().indexOf("|")!=-1){
            inputData = $input.val().trim().split("|");
            var code = inputData[0];
            var qty = parseFloat(inputData[1]);
            var pocode = inputData[2];
            if(codesList.indexOf(code)==-1) {
                alert("物料号不存在，请检查送货单。");
                $input.val("").focus();
                return;
            }
            if(isNaN(qty)){
                alert("送货数量有误，请检查送货单！");
                $input.val("").focus();
                return;
            }
            var sqltext = "select a.quantity as qty, b.name as trader_name, b.code as trader_code from p_orderdetail as a inner join p_order as c on c.billid = a.billid and c.billcode='"+pocode+"' inner join l_trader as b on c.traderid = b.traderid where a.goodsid = "+codesInfo[code].goodsid+";";
            console.log(sqltext)
            executeMsSql(sqltext,function(err, result){
                if(result.recordset.length == 0){
                    alert("订单号有误，或该物料不在订单"+pocode+"中。\n请检查送货单！");
                    $input.val("").focus();
                    return;
                }
                if(qty>result.recordset[0].qty){
                    alert("请注意，送货数量大于订单数量！");
                }
                $('div[bid="goodsReceiveInfo"] td[bid="gr.pocode"]').text(pocode);
                $('div[bid="goodsReceiveInfo"] td[bid="gr.code"]').text(code);
                $('div[bid="goodsReceiveInfo"] td[bid="gr.name"]').text(codesInfo[code].name);
                $('div[bid="goodsReceiveInfo"] td[bid="gr.spec"]').text(codesInfo[code].spec);
                $('div[bid="goodsReceiveInfo"] td[bid="gr.unit"]').text(codesInfo[code].unit);
                $('div[bid="goodsReceiveInfo"] input[bid="gr.qty.receive"]').val(qty);
                $('div[bid="goodsReceiveInfo"] td[bid="gr.qty.order"]').text(result.recordset[0].qty);
                $('div[bid="goodsReceiveInfo"] td[bid="gr.trader"]').text(result.recordset[0].trader_name+"("+result.recordset[0].trader_code+")");
                $('div[bid="goodsReceiveInfo"]').modal({
                    escapeClose: false,
                    clickClose: false,
                    showClose: false
                });
            })
        }
        else {
            $input.val("").focus();
        }
    }

    function updateHistory(){
        var filter = $('input[bid="kw"]').val().trim();
        var fromdate = moment($("input[bid=fromdate]").val()).format('YYYY-MM-DD');
        var todate = moment($("input[bid=todate]").val()).format('YYYY-MM-DD');
        var sqltext="select * from st_goodsreceive where 1 ";
        if(user.perm.indexOf(41)==-1) $("table[bid=dtable] th[bid=action]").hide();
        if(filter.length>0) sqltext+=" and ( code = '"+filter+"' or po = '"+filter+"') ";
        sqltext+=" and date >= '"+fromdate+"' and date<= '"+todate+"' order by sn desc limit "+(pageCount+1)+" offset "+((page-1)*pageCount)+";";

        var $tbody = $('table[bid="dtable"] tbody');
        $tbody.html("");
        executeMySql(sqltext, function (err, result){
            for(var i = 0; i<pageCount; i++){
                if(!result[i]) break;
                var $tmptr = $("<tr>").attr("data",JSON.stringify(result[i])).attr("sn",result[i].sn);
                $tmptr.append($("<td>").attr("bid","sn").text(result[i].sn));
                $tmptr.append($("<td>").attr("bid","code").text(result[i].code));
                $tmptr.append($("<td>").attr("bid","name").text(codesInfo[result[i].code].name));
                $tmptr.append($("<td>").attr("bid","spec").text(codesInfo[result[i].code].spec));
                $tmptr.append($("<td>").attr("bid","qty").text(result[i].quantity));
                $tmptr.append($("<td>").attr("bid","unit").text(codesInfo[result[i].code].unit));
                $tmptr.append($("<td>").attr("bid","po").text(result[i].po));
                $tmptr.append($("<td>").attr("bid","trader").text(result[i].trader));
                $tmptr.append($("<td>").attr("bid","opname").text(userlistall[result[i].opid]));
                $tmptr.append($("<td>").attr("bid","date").text(moment(result[i].date).format("YYYY-MM-DD HH:mm:ss")));
                if(user.perm.indexOf(41)!=-1) $tmptr.append($("<td>").attr("bid","delete").html("<button class='btn btn-danger btn-sm' bid='delete' sn='"+result[i].sn+"'>Delete</button>"));
                $tbody.append($tmptr);
            }
            $("input[bid='page']").val(page);

            if(page<=1) {
                $('button[bid="prev"]').prop("disabled", true);
            }
            else{
                $('button[bid="prev"]').prop("disabled", false);
            }
            if(result.length>=pageCount+1) {
                $('button[bid="next"]').prop("disabled", false);
            }
            else{
                $('button[bid="next"]').prop("disabled", true);
            }

            $('button[bid="next"]').off("click").on("click",function(){
                page++;
                updateHistory();
            });

            $('button[bid="prev"]').off("click").on("click",function(){
                page--;
                updateHistory();
            });

            $("button[bid=delete][sn]").off("click").on("click",function(){
                if(!confirm("Are you sure to delete this item?")) return;
                var sn = $(this).attr("sn");
                var sqltext = "delete from st_goodsreceive where sn = "+sn+" limit 1;";
                executeMySql(sqltext, function (err, result){
                    updateHistory();
                })
            })

        })

    }

    function exportHistory(){
        var filter = $('input[bid="kw"]').val().trim();
        var fromdate = moment($("input[bid=fromdate]").val()).format('YYYY-MM-DD');
        var todate = moment($("input[bid=todate]").val()).format('YYYY-MM-DD');
        var sqltext="select * from st_goodsreceive where 1 ";
        if(filter.length>0) sqltext+=" and ( code = '"+filter+"' or po = '"+filter+"') ";
        sqltext+=" and date >= '"+fromdate+"' and date<= '"+todate+"' order by sn desc;";

        executeMySql(sqltext, function (err, result,fields){
            var data = [];
            for(var i in result){
                var tmpobj = {};
                
                tmpobj["ID"]=(result[i].sn);
                tmpobj["Code"]=(result[i].code);
                tmpobj["Name"]=(codesInfo[result[i].code].name);
                tmpobj["Spec"]=(codesInfo[result[i].code].spec);
                tmpobj["Qty"]=(result[i].quantity);
                tmpobj["Unit"]=(codesInfo[result[i].code].unit);
                tmpobj["POCode"]=(result[i].po);
                tmpobj["Trader"]=(result[i].trader);
                tmpobj["Operator"]=(userlistall[result[i].opid]);
                tmpobj["Date"]=(moment(result[i].date).format("YYYY-MM-DD HH:mm:ss"));
                data.push(tmpobj);
            }
            var fn = app.getPath("temp") + "/SuperTools/goodsReceiveExport.csv";
            savedata(fn,data,true)
        });
    }

    updateHistory();
})
