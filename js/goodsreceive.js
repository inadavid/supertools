$(function(){
    var inputData;

    setTimeout(function(){
        $('input[bid="infoinput"]').focus().select();
    },100);
    $('input[bid="infoinput"]').on("keypress",function(e){
        if (e.which == 13) processScan();
    })

    $('div[bid="goodsReceiveInfo"] button[tag=cancel]').click(function(){
        $.modal.close();
        $('input[bid="infoinput"]').focus().select();
    })
    
    $('div[bid="goodsReceiveInfo"] button[tag=confirm]').click(function(){
        $.modal.close();
        $('input[bid="infoinput"]').focus().select();
        console.log(inputData)
    })

    function processScan(){
        var $input = $('input[bid="infoinput"]');
        if($input.val().trim().indexOf("|")!=-1){
            inputData = $input.val().trim().split("|");
            console.log(inputData)
            $('div[bid="goodsReceiveInfo"]').modal({
                escapeClose: false,
                clickClose: false,
                showClose: false
            });
            $('div[bid="goodsReceiveInfo"] button[tag=confirm]').focus();
        }
        $input.val("").focus();
    }
})
