const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld('electronAPI', {
    selectfolder: () => ipcRenderer.send('selectfolder'),
    preferences: (message) => {
        ipcRenderer.on("sendPrefs", message)
    },
    download: (downloadID) => ipcRenderer.send('downloadID', downloadID),
    downloadProgress: (downloadPercentage) => ipcRenderer.send('downloadProgress', downloadPercentage),
    downloadComplete: (idk) => {
        ipcRenderer.on("downloadComplete", idk)
    },
    modExisted: (callback) => {
        ipcRenderer.on("modExisted", callback)
    },
    checkMod: (downloadID) => ipcRenderer.send("checkMod", downloadID)
})