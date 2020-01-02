$(function(){
    var output=$("div[bid=output]");
    $('button[bid="refreshcode"]').click(function(){
        var btn = $(this);
        btn.prop("disabled",true);
        sqltxt = "update [SD30602_STJ201907].[dbo].[l_goodsunit] set isbase=1 where unittype=0 and isbase=0;";
        executeMsSql(sqltxt, function (err, result) {
            if (err) throw err;
            var num = result.rowsAffected[0];
            sqltxt = "update [SD30602_STJ].[dbo].[l_goodsunit] set isbase=1 where unittype=0 and isbase=0;";
            executeMsSql(sqltxt, function (err, result) {
                if (err) throw err;
                output.html("rowsAffected: "+ (num + result.rowsAffected[0]));
                btn.prop("disabled",false);
            })
        })
    })
})