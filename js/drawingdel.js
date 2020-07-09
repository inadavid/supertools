$(function(){
    $("input[name=version]").focus(function(){
        $(this).select();
    });

    $("button[bid=search]").click(function(){
        var $btn=$(this);
        var code = $("input[name=code]").val().trim();
        var version = $("input[name=version]").val().trim();
        if(codesList.indexOf(code)==-1){
            alert("The code does not existed in ERP code base.\nERP物料号不存在。")
            return;
        }
        $("input[name=version]").val(code);

        if(parseInt(version)+0!=parseInt(version)){
            alert("Version format error.\nVersion的格式不正确。")
            return;
        }
        version = parseInt(version);
        $("input[name=version]").val(version);

        $btn.prop("disabled",true);

        var sqltext = " select * from st_drawings where code='"+code+"' and version='"+version+"';";
        executeMsSql(sqltext, function (err, result){
            if(err){
                console.log(err);
                $btn.prop("disabled",false);
                return;
            }
            var html="<h4>Found "+result.recordset.length+" Drawing(s).</h4>";

            for(var i in result.recordset){
                html+=" <input type='checkbox' bid='drawingdel' dsn='"+result.recordset[i].sn+"'> " + drawingType[result.recordset[i].filetype].name +" | " +result.recordset[i].filename+" | "+userlistall[result.recordset[i].opid+""]+" | "+moment(result.recordset[i].data).format('YYYY-MM-DD HH:mm:ss')+" | "+(result.recordset[i].stat==1?"审批通过":(result.recordset[i].stat==2?"审批拒绝":"准备中"))+"<br>";
            }

            if(result.recordset.length>0){
                html+='<br><button class="btn btn-form btn-danger btn-sm" bid="delete">Delete selected drawing unconditionally</button>';
            }

            $('div[bid="drawinglist"]').html("").html(html);
            $btn.prop("disabled",false);

            $('button[bid="delete"]').off("click").on("click",function(){
                var list = [];
                $("input[bid=drawingdel]:checked").each(function(){
                    list.push($(this).attr("dsn"));
                })

                if(list.length==0){
                    alert("Please select drawing to be deleted. 请选择需要删除的图纸。");
                    return;
                }
                var sqltext_mssql="delete from st_drawings where sn=0 ";
                var sqltext_mysql="delete from st_drawings where dsn=0 ";
                for(var i in list){
                    sqltext_mssql += " or sn = "+list[i];
                    sqltext_mysql += " or dsn = "+list[i];
                }
                sqltext_mssql += ";";
                sqltext_mysql += ";";
                alert("Please note the deletion of the drawing selected cannot be redone. 请注意，图纸删除后不能恢复。");
                if(!confirm("Are you sure you want to delete these "+list.length+" drawings?\n您确定删除这"+list.length+"张图纸么？")) return;
                executeMsSql(sqltext_mssql, function(err, result){
                    executeMySql(sqltext_mysql, function(err, result){
                        alert("Drawing deleted.图纸已经删除。");
                    })
                })
            })
        })
    })
})