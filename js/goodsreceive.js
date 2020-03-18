$(function(){
    setTimeout(function(){
        $('input[bid="infoinput"]').focus().select();
    },100);
    $('input[bid="infoinput"]').on("keypress",function(e){
        if (e.which == 13) processScan();
    })
})

function processScan(){
    var $input = $('input[bid="infoinput"]');
    if($input.val().trim().indexOf("|")!=-1){
        var data = $input.val().trim().split("|");
        console.log(data)
    }
    $input.val("").focus();
}