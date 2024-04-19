const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld('electronAPI', {
    selectfolder: () => ipcRenderer.send('selectfolder'),
    preferences: (message) => {
        ipcRenderer.on("sendPrefs", message)
    }
})