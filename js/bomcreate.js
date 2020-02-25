
$(function(){
    var data = [];
    var bomflag = false;
    $("button[bid=query]").click(function(){
        var bomtop = $("input[bid=bomtop]").val().trim();
        if(!(bomtop in codesInfo)){
            alert(bomtop+" does not existed in ERP code!");
            return;
        }
        var sqltxt = "select count(*) as cnt from st_goodsbom where goodsid='"+bomtop+"' and startDate<=GETDATE() and endDate>GETDATE();";
        executeMsSql(sqltxt, function(err, result){
            if(err){
                alert (err);
            }
            if(result.recordset[0].cnt > 0){
                alert("There is already BOM items under code "+bomtop);
                bomflag=false;
                $("input[bid=bomtop]").prop("disabled",false);
                $("button[bid=query]").prop("disabled",false);
                $("table[bid=bom]").prop("disabled",true);
                return;
            }
            else{
                bomflag=true;
                $("input[bid=bomtop]").prop("disabled",true);
                $("button[bid=query]").prop("disabled",true);
                $("table[bid=bom]").prop("disabled",false).find("tbody").html("");
            }
        })
    })
    $("table[bid=bom] tfoot input[bid=code]").change(function(){
        //if(!bomflag) return;
        var code = $(this).val().trim();
        if(code in codesInfo){
            console.log(codesInfo[code])
            $("table[bid=bom] tfoot td[bid=name]").text(codesInfo[code].name);
            $("table[bid=bom] tfoot td[bid=spec]").text(codesInfo[code].spec);
            $("table[bid=bom] tfoot td[bid=unit]").text(codesInfo[code].unit);
        }
        else{
            console.error(code + "not existed.")
        }
    })

})

