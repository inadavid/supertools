$(function () {
    var $eco = $("input[bid=econumber]");
    var ecosn = false;
    var $btn = $("button[bid=revert]");
    $btn.on("click", function(){
        var tmpv = $eco.val().trim().replace("ECO-","").replace("ECO","");
        if(isNaN(parseInt(tmpv)) || parseInt(tmpv)<=0) {
            alert("Bad ECO number");
            return;
        }
        else{
            ecosn = parseInt(tmpv);
            console.log(ecosn)
        }

        var sqltxt = "select top 1 * from st_bomeco where sn = "+ecosn+";";
        executeMsSql(sqltxt, function (err, result){
            if(err){
                console.error(err);
                return;
            }
            var data = JSON.parse(Base64.decode(result.recordset[0].data));
            if(!confirm("Are you sure to revert "+data.length+" records in BOM ECO "+ecosn+"?")) return;
            sqltxt="";
            for(var i in data){
                if(data[i].action == "addition"){
                    sqltxt+="delete from st_goodsbom where goodsid ='" + result.recordset[0].parentgid + "' and elemgid ='" + data[i].data.code+"' and endDate = '2099-01-01';"
                }
            }
            for(var i in data){
                if(data[i].action=="deletion"){
                    sqltxt+="update st_goodsbom set endDate = '2099-01-01' where sn = "+data[i].sn+";";
                }
            }
            sqltxt+="delete from st_bomeco where sn = "+ ecosn +"; delete from st_bomeco_children where ecosn = "+ ecosn +";"
            $('div[bid="output"]').html("").append($("<textarea>").prop("readonly",true).css("width","600px").css("height","300px").val(sqltxt.split(";").join(";\n")));
        })
    })
})