const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld('electronAPI', {
    selectfolder: () => ipcRenderer.send('selectfolder'),
    preferences: (message) => {
        ipcRenderer.on("sendPrefs", message)
    },
    download: (downloadID, version) => ipcRenderer.send('downloadID', downloadID, version),
    downloadProgress: (downloadPercentage) => ipcRenderer.on('downloadProgress', downloadPercentage),
    downloadComplete: (idk) => {
        ipcRenderer.on("downloadComplete", idk)
    },
    modExisted: (callback) => {
        ipcRenderer.on("modExisted", callback)
    },
    modList: (thelist) => ipcRenderer.on("modList", thelist),
    enableMod: (downloadID) => ipcRenderer.send('enableMod', downloadID),
    disableMod: (downloadID) => ipcRenderer.send('disableMod', downloadID),
    exploremods: (modlist) => ipcRenderer.on("exploremods", modlist),
    updateExplore: (explorelist) => ipcRenderer.on('updateExplore', explorelist),
    requestexplore: () => ipcRenderer.send('requestexplore')
})