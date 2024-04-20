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

var selectedversion = "1.20.4"
db.defaults({preferences: {}, modlist: []}).write()
function updateModList(){
    var modfiles = []
    fs.readdirSync("fossmods").forEach(file => {
        modfiles.push(file.toString())
    })
    db.get("modlist").value().forEach(element => {
        if(!modfiles.includes(element.filename.toString())){
            db.get("modlist").remove({filename:element.filename}).write()
            console.log("removed")
        }
    });
    console.log(modfiles[0])
}
updateModList()
function downloadfromID(id, version){
    var urlDownload
    var req = request.get("https://api.modrinth.com/v2/project/"+id+"/version", {json:true}, (err, resp, body) => {
    var validversions = _.values(body)
    urlDownload =  _.filter(validversions, function(vers){
        // This is the filters/options
        return vers.game_versions.includes(version) && vers.loaders.includes('fabric')
    })[0].files[0].url
    var filename = "fossmods/"+urlDownload.toString().split("/")[urlDownload.toString().split("/").length-1]
    if(db.get("modlist").find({filename: urlDownload.toString().split("/")[urlDownload.toString().split("/").length-1]}).value() == null){
        console.log(db.get("modlist").find({filename: filename}).value());
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
            })
            var modtitle
            request.get("https://api.modrinth.com/v2/project/"+id, {json:true}, (error, response, data) => {
                modtitle = data.title
                db.get("modlist").push({
                    modname: modtitle,
                    version: selectedversion,
                    enabled: false,
                    filename: urlDownload.toString().split("/")[urlDownload.toString().split("/").length-1],
                    iconURL: data.icon_url,
                    downloadID: id
                }).write()
                win.webContents.send('modList', JSON.stringify(db.get('modlist').value()))
            })
    }else{
        win.webContents.send('modExisted')
        return
    }
    })
}
function createWin(){
    win = new BrowserWindow({
        width: 1000,
        height: 800,
        resizable: false,
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
    ipcMain.on('downloadID', (event, downloadID) => {
        if (downloadID != null){
            downloadfromID(downloadID, selectedversion)
        }
    })
    if (db.get("preferences.minecraftDir").value() == null){
        win.loadFile("select.html").then(sendPrefs)
    }else{
        win.loadFile("index.html").then(sendPrefs).then(sendModList)
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