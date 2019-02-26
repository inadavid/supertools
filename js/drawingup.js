var drawingfilepath;
drawingfilepath = "";
$("button[bid=dfolder]").click(function () {
    var dfp = dialog.showOpenDialog(win, {
        properties: ['openDirectory']
    })
    if (dfp) drawingfilepath = dfp;
    $("span[bid=dfolder]").text(drawingfilepath);
    return;
})