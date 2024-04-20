const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld('electronAPI', {
    selectfolder: () => ipcRenderer.send('selectfolder'),
    preferences: (message) => {
        ipcRenderer.on("sendPrefs", message)
    },
    download: (downloadID, version) => ipcRenderer.send('downloadID', downloadID, version),
    downloadProgress: (downloadPercentage) => ipcRenderer.send('downloadProgress', downloadPercentage),
    downloadComplete: (idk) => {
        ipcRenderer.on("downloadComplete", idk)
    },
    modExisted: (callback) => {
        ipcRenderer.on("modExisted", callback)
    },
    modList: (thelist) => ipcRenderer.on("modList", thelist),
    enableMod: (downloadID) => ipcRenderer.send('enableMod', downloadID),
    disableMod: (downloadID) => ipcRenderer.send('disableMod', downloadID),
    exploremods: (modlist) => ipcRenderer.on("exploremods", modlist)
})