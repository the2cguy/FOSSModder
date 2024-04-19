$(".topbar button").click(function (e) { 
    e.preventDefault();
    $(".topbar button").css("background", "#3c3836")
    $(this).css("background", "#282828");
});
$(".firstbtn").css("background", "#282828")

function divMod(titletext, description, iconurl, id="idk"){
    var div = document.createElement("div");
    var infodiv = document.createElement("div")
    $(infodiv).addClass("info");
    var title = document.createElement("h2")
    $(title).text(titletext);
    var p = document.createElement("p")
    $(p).text(description);
    var icon = document.createElement("img")
    $(icon).attr("src", iconurl);
    $(infodiv).append(title);
    $(infodiv).append(p);
    div .appendChild(document.createElement("div").appendChild(icon))
    $(div).addClass("imgdiv");
    var k = document.createElement("div")
    k.appendChild(div)
    k.appendChild(infodiv)
    $(k).attr("downloadID", id);
    $(k).addClass("mod");
    $(".explore").append(k);
}
divMod("Lithium", "Fun Stuffs", "https://cdn.modrinth.com/data/gvQqBUqZ/icon.png")
$(".mod").click(function (e) { 
    e.preventDefault();
    electronAPI.download($(this).downloadID)
});