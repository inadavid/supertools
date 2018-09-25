var action="bomup";

$(()=>{
    loadPanel(action);
});

$("nav.nav-group span.nav-group-item").on("click",(e)=>{
  var ts=$(e.currentTarget)
  if(ts.attr("action")=="debug"){
        require("electron").remote.getCurrentWebContents().openDevTools();
        return;
  }
  $("nav.nav-group span.nav-group-item").removeClass("active");
  ts.addClass("active");
  action=ts.attr("action");
  loadPanel(action);
});

function loadPanel(pname){
  $("div[bid=main]").load(pname+".html");
}
