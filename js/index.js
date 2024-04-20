$(".topbar button").click(function (e) { 
    e.preventDefault();
    $(".topbar button").css("background", "#3c3836")
    $(this).css("background", "#282828");
});
$(".firstbtn").css("background", "#282828")
var modlist = []
function divMod(titletext, description, id="idk", iconURL){
    var div = document.createElement("div");
    var infodiv = document.createElement("div")
    $(infodiv).addClass("info");
    var title = document.createElement("h2")
    $(title).text(titletext);
    var p = document.createElement("p")
    $(p).text(description);
    var icon = document.createElement("img")
    $(icon).attr("src", iconURL);
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
$(".explore").hide();
$(".modlist").show();
electronAPI.modExisted(() => {
    alert("Mod already exists!")
})
electronAPI.modList((event, mods) => {
    modlist = JSON.parse(mods)
    $(".modlist").empty();
    // Code below adds recommended mods. Not directly tied to modList, so it doesn't depend on modList but rather can be updated from another list.
    $(".info button").click(function (e) { 
        var downloadID = ($(this).parent().parent().attr("downloadID"))
        electronAPI.download(downloadID)
        console.log(downloadID)
    });
    modlist.forEach(element => {
        modListTemplate(element.modname, element.iconURL, element.description, element.enabled, element.downloadID)
    });
    $(".toggle").click(function (e) { 
        if ($(this).is(":checked")){
            electronAPI.enableMod($(this).parent().parent().parent().attr("downloadID"))
        }else{
            electronAPI.disableMod($(this).parent().parent().parent().attr("downloadID"))
        }
    });
})
function modListTemplate(title, imgurl, description, enabled, downloadID){
    var template = document.createElement('div')
    $(template).addClass("moditem");
    $(template).attr("downloadID", downloadID);

    var modimgdiv = document.createElement('div')
    $(modimgdiv).addClass("modimgdiv");
    modimgdiv.innerHTML = '<img src="imgurl" alt="">'.replace("imgurl", imgurl)
    template.appendChild(modimgdiv);

    var moddescriptiondiv = document.createElement("div");
    $(moddescriptiondiv).addClass("moddescriptiondiv");
    moddescriptiondiv.innerHTML += "<h2>title</h2>".replace("title", title)
    moddescriptiondiv.innerHTML += "<p>desc</p>".replace("desc", description)
    if (enabled){
        moddescriptiondiv.innerHTML += "<div style='position: relative;' class='togglebox'><input type='checkbox' id='check"+title+"' class='toggle' checked></div>"
    }else{
        moddescriptiondiv.innerHTML += "<div style='position: relative;' class='togglebox'><input type='checkbox' id='check"+title+"' class='toggle'></div>"
    }

    template.appendChild(modimgdiv)
    template.appendChild(moddescriptiondiv)

    $(".modlist").append(template);
    
}
electronAPI.exploremods((event, mods) => {
    $(".explore").empty();
    var modd = JSON.parse(mods);
    modd.forEach(element => {
        divMod(element.modtitle, element.description, element.downloadID, element.iconURL)
    });
    $(".info button").click(function (e) { 
        e.preventDefault();
        electronAPI.download($(this).parent().parent().attr("downloadID"), $(".version").val())
    });
})