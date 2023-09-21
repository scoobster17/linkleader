// Modules to control application life and create native browser window
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

type FilteredProfile = { id: string; name: string; user_name: string };

const openLinkInProfile = (url: string, profileEmail: string) => {
  spawn(
    '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
    [
      url,
      `--profile-email=${profileEmail}`,
    ]
  );
};

const createWindow = (profiles: FilteredProfile[]) => {
  ipcMain.handle('openLinkInProfile', (_event, url, email) => {
    openLinkInProfile(url, email);
  })

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      'preload': path.join(__dirname, 'preload.js'),
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
    .then(() => { mainWindow.webContents.send('sendProfiles', profiles); })
    .then(() => { mainWindow.show(); });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  // using string concatenation as for some reason, os.homeDir disappears when using path.resolve
  const filePath = `${os.homedir()}/Library/Application Support/Google/Chrome/Local State`;
  const data = fs.readFileSync(filePath, 'utf-8');
  const chromeData: { profile: { info_cache: { [key: string]: { name: string; user_name: string } } }} = JSON.parse(data);
  const filteredChromeProfiles: FilteredProfile[] = Object.entries(chromeData.profile.info_cache)
    .map(([id, { name, user_name }]) => ({ id, name, user_name }));
  // console.log(filteredChromeProfiles);

  createWindow(filteredChromeProfiles);

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow(filteredChromeProfiles)
  })
}).catch(console.error);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.