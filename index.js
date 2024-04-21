const { app, BrowserWindow, ipcMain, dialog } = require("electron")
const { path } = require("node:path")

var _ = require("underscore");
var low = require("lowdb")
var FileSync = require("lowdb/adapters/FileSync")
var fs = require("fs")
var { dir } = require("node:console")
var adapter = new FileSync('db.json')
var db = low(adapter)
var win
var request = require("request")
var http = require('http')
var SHA256 = require("crypto-js/sha256");

var searchQuery = ""
var selectedversion = "1.20.4"
db.defaults({preferences: {}, modlist: []}).write()
function searchMods(modname){
    console.log("THEFIRST")
    var modlist = []
    var projects
    request.get("https://api.modrinth.com/v2/search?query="+modname, {json:true}, (err, resp, body) => {
        projects = JSON.stringify(body)
        projects = JSON.parse(projects)
        for(var i=0;i<10;i++){
            modlist.push({
                modtitle: projects.hits[i].title,
                downloadID: projects.hits[i].project_id,
                description: projects.hits[i].description,
                iconURL:projects.hits[i].icon_url
            })
        }
        win.webContents.send('updateExplore', JSON.stringify(modlist))
        console.log(JSON.stringify(modlist))
    })
}
function updateModList(){
    db.get("modlist").value().forEach(element => {
        var disabledmod = fs.existsSync(db.get("preferences.minecraftDir").value()+"/fossmods/"+element.filename)
        var enabledmod = fs.existsSync(db.get("preferences.minecraftDir").value()+"/mods/"+element.filename)
        if(!disabledmod && !enabledmod){
            db.get("modlist").remove({downloadID:element.downloadID}).write()
            console.log("REMOVEDREMOVEDREMOVEDREMOVED")
        }
    });
}

function downloadfromID(id, version){
    var urlDownload
    var req = request.get("https://api.modrinth.com/v2/project/"+id+"/version", {json:true}, (err, resp, body) => {
    var validversions = _.values(body)
    urlDownload =  _.filter(validversions, function(vers){
        // This is the filters/options
        return vers.game_versions.includes(version) && vers.loaders.includes('fabric')
    })
    if (urlDownload.length < 1){
        win.webContents.send("versionInvalid")
        return
    }
    urlDownload = urlDownload[0].files[0].url
    var filename = db.get("preferences.minecraftDir").value()+"/fossmods/"+urlDownload.toString().split("/")[urlDownload.toString().split("/").length-1]
    if(db.get("modlist").find({hash: SHA256(id+version).toString()}).value() == null){
        console.log(filename)
            var file = fs.createWriteStream(filename)
            var currentLen = 0
            var progress = 0.1
            var maxProgress = 0
            var req = request.get(urlDownload)
            req.pipe(file)
            req.on("response", (resp) => {
                maxProgress = resp.headers["content-length"]
            })
            req.on('data', (chunk) => {
                currentLen += chunk.length
                //console.log(currentLen/maxProgress*100)
                win.webContents.send('downloadProgress', currentLen/maxProgress*100)
            })
            req.on('complete', () => {
                win.webContents.send('downloadComplete')
                file.close()
                console.log("finished")
                searchMods(searchQuery)
                var modtitle
                request.get("https://api.modrinth.com/v2/project/"+id, {json:true}, (error, response, data) => {
                    modtitle = data.title
                    db.get("modlist").push({
                        modname: modtitle,
                        version: version,
                        enabled: false,
                        filename: urlDownload.toString().split("/")[urlDownload.toString().split("/").length-1],
                        iconURL: data.icon_url,
                        downloadID: id,
                        description: data.description,
                        hash: SHA256(id+version).toString()
                    }).write()
                    win.webContents.send('modList', JSON.stringify(db.get('modlist').value()))
                    searchMods(searchQuery)
                })
                
                console.log(JSON.stringify(db.get('modlist').value()))
            })
    }else{
        win.webContents.send('modExisted')
        return
    }
    })
}
function createWin(){
    win = new BrowserWindow({
        minWidth: 1200,
        minHeight: 800,
        maxWidth: 1500,
        maxHeight: 1200,
        resizable: true,
        autoHideMenuBar: true,
        webPreferences:{
            preload: __dirname + "/preload.js"
        }
    })

    ipcMain.on("selectfolder", (event) => {
        dir = dialog.showOpenDialogSync(win, {
            properties: ["openDirectory"],
            defaultPath: require("os").homedir()
        })
        console.log(dir)
        // Set Minecraft Directory using lowdb
        if (dir != null){
            db.set("preferences.minecraftDir", dir[0].toString()).write()
            win.loadFile("index.html")
        }
    })
    ipcMain.on('downloadID', (event, downloadID, version=selectedversion) => {
        if (downloadID != null){
            downloadfromID(downloadID, version)
        }
    })
    ipcMain.on('enableMod', (event, hash) => {
        console.log("YEAY")
        db.get("modlist").find({hash:hash}).value().enabled = true
        db.write()
        console.log(hash)
        fs.renameSync(db.get("preferences.minecraftDir").value()+"/fossmods/"+db.get("modlist").find({hash:hash}).value().filename, db.get("preferences.minecraftDir").value()+"/mods/"+db.get("modlist").find({hash:hash}).value().filename)
    })
    ipcMain.on('disableMod', (event, hash) => {
        console.log("YOAY")
        db.get("modlist").find({hash:hash}).value().enabled = false
        db.write()
        console.log(hash)
        fs.renameSync(db.get("preferences.minecraftDir").value()+"/mods/"+db.get("modlist").find({hash:hash}).value().filename, db.get("preferences.minecraftDir").value()+"/fossmods/"+db.get("modlist").find({hash:hash}).value().filename)
    })
    ipcMain.on('requestexplore', (e, q) => {
        searchQuery = q
        searchMods(searchQuery)
    })
    if (db.get("preferences.minecraftDir").value() == null){
        win.loadFile("select.html").then(sendPrefs)
    }else{
        if(!fs.existsSync(db.get("preferences.minecraftDir").value()+"/fossmods")){
            fs.mkdirSync(db.get("preferences.minecraftDir").value()+"/fossmods")
        }
        win.loadFile("index.html").then(sendPrefs).then(sendModList)
        updateModList()
        searchMods(searchQuery)
    }
}
function sendPrefs(){
    win.webContents.send('sendPrefs', db.get("preferences").value())
    console.log(db.get("preferences").value())
}
function sendModList(){
    win.webContents.send('modList', JSON.stringify(db.get('modlist').value()))
}
app.whenReady().then(() => {
    createWin()
    //ipcMain.handle("checkMod", sendModCheck)
})
