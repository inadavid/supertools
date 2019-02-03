var allcodesHint = [];
var displayBOM = [];

$(function () {
    $("head").append("<link rel='stylesheet' id='extracss' href='../css/awesomplete.css' type='text/css' />");
    for (var m in codesInfo) {
        allcodesHint.push({
            label: m + " | " + codesInfo[m].name + " | " + codesInfo[m].spec,
            value: m
        })
    }
})

$("input[bid=bomtop]").on("keypress", function () {
    var val = $(this).val();
    var spec = $("span[bid=codespec]")
    spec.css("margin-left", "50px").css("margin-right", "50px")
    if (codesList.indexOf(val) == -1) {
        spec.text("");
        return;
    } else
        spec.text(codesInfo[val].name + " | " + codesInfo[val].spec);
}).css("display", "inline-block").css("width", "200px")
// var as1 = new Awesomplete("input[bid='bomtop']", {
//     minChars: 4,
//     maxItems: 10
// });
// as1.list = codesList;

function searchBOM(code) {
    if (code.length != 10) return false;
    sqltext = "WITH CTE AS (SELECT b.*,lvl=0 FROM dbo.st_goodsbom as b WHERE goodsid='" + code + "' UNION ALL SELECT b.*, lvl+1 FROM dbo.st_goodsbom as b INNER JOIN CTE as c ON b.goodsid=c.elemgid) SELECT * FROM CTE ";
    new sql.Request().query(sqltext, (err, result) => {
        // ... error checks

        console.dir(result)
        if (result.rowsAffected == 0) {
            popup("This material has no sub-BOM.", "danger");
        } else {
            for (var i in result.recordset) {
                displayBOM.push({
                    Level: result.recordset[i].lvl,
                    Code: result.recordset[i].goodsid,
                })
            }

        }
    })
}