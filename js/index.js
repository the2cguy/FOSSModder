$(".topbar button").click(function (e) { 
    e.preventDefault();
    $(".topbar button").css("background", "#3c3836")
    $(this).css("background", "#282828");
});
$(".firstbtn").css("background", "#282828")
var modlist = []
function exploreModTemplate(titletext, description, id="idk", iconURL, version){
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
    btn.innerHTML = '<i class="bi bi-check-all"></i> Add to Modlist';
    if(_.find(modlist, {hash: CryptoJS.SHA256(id+version).toString()})){
        $(btn).addClass("btndisabled");
        $(btn).text("Mod already exist");
    }
    console.log(CryptoJS.SHA256(id+version).toString())
    console.log(id+version)
    
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
$(".explore").show();
$(".modlist").hide();
electronAPI.modExisted(() => {
    alert("Mod already exists!")
})
electronAPI.modList((event, mods) => {
    modlist = JSON.parse(mods)
    $(".modlist").empty();
    // Code below adds recommended mods. Not directly tied to modList, so it doesn't depend on modList but rather can be updated from another list.
    modlist.forEach(element => {
        modListTemplate(element.modname, element.iconURL, element.version, element.enabled, element.downloadID)
    });
    $(".toggle").click(function (e) {  
        if ($(this).is(":checked")){
            electronAPI.enableMod($(this).parent().parent().parent().attr("hash"))
        }else{
            electronAPI.disableMod($(this).parent().parent().parent().attr("hash"))
        }
    });
})
function modListTemplate(title, imgurl, version, enabled, downloadID){
    var template = document.createElement('div')
    $(template).addClass("moditem");
    $(template).attr("downloadID", downloadID);
    $(template).attr("hash", CryptoJS.SHA256(downloadID+version).toString());

    var modimgdiv = document.createElement('div')
    $(modimgdiv).addClass("modimgdiv");
    modimgdiv.innerHTML = '<img src="imgurl" alt="">'.replace("imgurl", imgurl)
    template.appendChild(modimgdiv);

    var moddescriptiondiv = document.createElement("div");
    $(moddescriptiondiv).addClass("moddescriptiondiv");
    moddescriptiondiv.innerHTML += "<h2>title</h2>".replace("title", title)
    moddescriptiondiv.innerHTML += "<p>desc</p>".replace("desc", version)
    if (enabled){
        moddescriptiondiv.innerHTML += "<div style='position: relative;' class='togglebox'><input type='checkbox' id='check"+title+"' class='toggle' checked></div>"
    }else{
        moddescriptiondiv.innerHTML += "<div style='position: relative;' class='togglebox'><input type='checkbox' id='check"+title+"' class='toggle'></div>"
    }

    template.appendChild(modimgdiv)
    template.appendChild(moddescriptiondiv)

    $(".modlist").append(template);
    
}
function updateExplorePage(explorelist){
        $(".explore").empty();
        var explorelistJSON = JSON.parse(explorelist)
        explorelistJSON.forEach(mod => {
            exploreModTemplate(mod.modtitle, mod.description, mod.downloadID, mod.iconURL, $('.version').val())
        });
        $(".info button").click(function (e) { 
            e.preventDefault();
            electronAPI.download($(this).parent().parent().attr("downloadID"), $(".version").val());
        });
}
electronAPI.downloadProgress((evenet, progr) => {
    $("progress").val(progr);
    console.log(progr)
})
electronAPI.updateExplore((e, explorelist) => {
    updateExplorePage(explorelist)
})
$("select").on("change", function () {
    electronAPI.requestexplore()
});