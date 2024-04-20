$(".topbar button").click(function (e) { 
    e.preventDefault();
    $(".topbar button").css("background", "#3c3836")
    $(this).css("background", "#282828");
});
$(".firstbtn").css("background", "#282828")
var modlist = []
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
    btn.innerHTML = '<i class="bi bi-check-all"></i> Add Mod to list';
    if(_.find(modlist, {downloadID: id})){
        $(btn).addClass("btndisabled");
        $(btn).text("Mod already exist");
    }
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

$(".mod").click(function (e) { 
    e.preventDefault();
    electronAPI.download($(this).downloadID)
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

electronAPI.modExisted(() => {
    alert("Mod already exists!")
})
electronAPI.modList((event, mods) => {
    modlist = JSON.parse(mods)
    $(".explore").empty();
    // Code below adds recommended mods. Not directly tied to modList, so it doesn't depend on modList but rather can be updated from another list.
    divMod("Lithium", "Fun Stuffs", "https://cdn.modrinth.com/data/gvQqBUqZ/icon.png", "gvQqBUqZ")
    divMod("Sodium", "Fun Stuffs", "https://cdn.modrinth.com/data/AANobbMI/icon.png", "sodium")
    $(".info button").click(function (e) { 
        var downloadID = ($(this).parent().parent().attr("downloadID"))
        electronAPI.download(downloadID)
        console.log(downloadID)
    });
})