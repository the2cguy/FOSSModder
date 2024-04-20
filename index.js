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
db.defaults({preferences: {}}).write()
function downloadfromID(id, version){
    var urlDownload
    var k = request.get("https://api.modrinth.com/v2/project/"+id+"/version", {json:true}, (err, resp, body) => {
        var validversions = _.values(body)
        console.log(resp)
        urlDownload =  _.filter(validversions, function(vers){
            return vers.game_versions.includes(version) && vers.loaders.includes('fabric')
        })[0].files[0].url
        var file = fs.createWriteStream(urlDownload.toString().split("/")[urlDownload.toString().split("/").length-1])
        var req = request.get(urlDownload).pipe(file).on('finish', () => console.log("FINISHED"))
        
    })
}
downloadfromID("sodium", "1.19.4")
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
    if (db.get("preferences.minecraftDir").value() == null){
        win.loadFile("select.html").then(sendPrefs)
    }else{
        win.loadFile("index.html").then(sendPrefs)
    }
}
function sendPrefs(){
    win.webContents.send('sendPrefs', db.get("preferences").value())
    console.log(db.get("preferences").value())
}
app.whenReady().then(() => createWin())