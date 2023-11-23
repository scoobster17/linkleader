// Import the necessary Electron modules
const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;

// Exposed protected methods in the render process
contextBridge.exposeInMainWorld(
    // Allowed 'ipcRenderer' methods
    'electronApi', {
        // From main to render
        sendWebData: (message: any) => {
            ipcRenderer.on('sendWebData', message);
        },
        openLinkInProfile: (...args: string[]) => ipcRenderer.invoke('openLinkInProfile', ...args),
        updateConfig: (...args: string[]) => ipcRenderer.invoke('updateConfig', ...args),
    }
);