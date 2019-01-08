var data = [];
var codeall;

var vm = new Vue({
    el: '#bom',
    data: {
        bom: data
    },
    methods: {
        udelete: function(_id) //删除
            {},
        updateu: function(item) //更新
            {}
    }
});

function fetchme() {
    var sqltxt = "select dbo.l_goods.goodsid,dbo.l_goods.code,dbo.l_goods.name,dbo.l_goods.specs,dbo.l_goodsunit.unitname from dbo.l_goods inner join l_goodsunit on l_goods.goodsid=l_goodsunit.goodsid and l_goods.unitid=l_goodsunit.unitid ;";
    var request = new sql.Request();
    request.query(sqltxt, function(err, recordset) {
        // ... error checks
        codeall = recordset;
        console.log("codes fetched"); // return 1

        // ...
    });
}