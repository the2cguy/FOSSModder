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
    var btn = document.createElement("button")
    var existed = electronAPI.checkMod()
    if (existed){
        $(btn).css("background", "transparent")
    }
    btn.innerHTML = '<i class="bi bi-check-all"></i> Add Mod to list';
    $(infodiv).append(title);
    $(infodiv).append(p);
    $(infodiv).append(btn);
    div .appendChild(document.createElement("div").appendChild(icon))
    $(div).addClass("imgdiv");
    var k = document.createElement("div")
    k.appendChild(div)
    k.appendChild(infodiv)
    $(k).attr("downloadID", id);
    $(k).addClass("mod");
    $(".explore").append(k);
    
}

divMod("Lithium", "Fun Stuffs", "https://cdn.modrinth.com/data/gvQqBUqZ/icon.png", "gvQqBUqZ")
$(".mod").click(function (e) { 
    e.preventDefault();
    electronAPI.download($(this).downloadID)
});

$(".info button").click(function (e) { 
    e.preventDefault();
    var downloadID = ($(this).parent().parent().attr("downloadID"))
    electronAPI.download(downloadID)
    console.log(downloadID)
});
electronAPI.downloadComplete((event) => {
    alert("Download Finished")
})

$(".modlistbtn").click(function (e) { 
    e.preventDefault();
    $(".explore").hide();
    $(".modlist").show();
});
$(".firstbtn").click(function (e) { 
    e.preventDefault();
    $(".explore").show();
    $(".modlist").hide();
});
$('.firstbtn').click()

electronAPI.modExisted(() => {
    alert("Mod already exists!")
})