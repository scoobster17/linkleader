// Modules to control application life and create native browser window
import { app, BrowserWindow, shell, ipcMain, protocol } from 'electron';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import log from 'electron-log';
import Store from './store';

type FilteredProfile = {
  id: string;
  name: string;
  user_name: string;
};

let urlToOpen: string;
const store = new Store();

/**
 *
 * @param url
 * @param profileEmail 
 */
const openLinkInProfile = (url: string, profileEmail: string) => {
  BrowserWindow.getAllWindows()[0]?.close();
  spawn(
    '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
    [
      url,
      `--profile-email=${profileEmail}`,
    ]
  );
};

/**
 * 
 * @param profiles 
 * @param url 
 * @returns 
 */
const createWindow = (profiles: FilteredProfile[], url?: string) => {
  ipcMain.removeHandler('openLinkInProfile');
  ipcMain.handle('openLinkInProfile', (_event, url, email) => {
    openLinkInProfile(url, email);
  })

  ipcMain.removeHandler('updateConfig');
  ipcMain.handle('updateConfig', (_event, key, value) => {
    store.set(key, value);
  })

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      'preload': path.join(__dirname, 'preload.js'),
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'))
    .then(() => { mainWindow.webContents.send('sendWebData', { profiles, url, rules: store.get('rules') }); })
    .then(() => { mainWindow.show(); });

  // mainWindow.webContents.openDevTools()
}

// app.on('activate', () => {
//   const rules = store.get('rules');
//   const index = rules.findIndex(({url}) => url === urlToOpen);
//   if (index !== -1) {
//     openLinkInProfile(rules[index].url, rules[index].profileEmail);
//     return;
//   }

//   if (BrowserWindow.getAllWindows().length === 0) createWindow(filteredChromeProfiles, urlToOpen)
// })

app.on('open-url', (event, url) => {
  log.info('open url', url, JSON.stringify(event));

  if (app.isReady()) {
    const rules = store.get('rules');
    const index = rules.findIndex(({url: urlToCheck}) => urlToCheck === url);
    if (index !== -1) {
      openLinkInProfile(rules[index].url, rules[index].profileEmail);
      return;
    }

    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(filteredChromeProfiles, url)
    } else {
      BrowserWindow.getAllWindows()[0].webContents.send('sendWebData', { profiles: filteredChromeProfiles, url, rules: store.get('rules') });
    }
  } else {
    urlToOpen = url;
  }
})

// app.setAsDefaultProtocolClient('https');

// using string concatenation as for some reason, os.homeDir disappears when using path.resolve
const filePath = `${os.homedir()}/Library/Application Support/Google/Chrome/Local State`;
const data = fs.readFileSync(filePath, 'utf-8');
const chromeData: { profile: { info_cache: { [key: string]: { name: string; user_name: string } } }} = JSON.parse(data);
const filteredChromeProfiles: FilteredProfile[] = Object.entries(chromeData.profile.info_cache)
  .map(([id, { name, user_name }]) => ({ id, name, user_name }));
// console.log(filteredChromeProfiles);

app.whenReady().then(() => {
  log.info('whenReady');

  const rules = store.get('rules');
  const index = rules.findIndex(({url}) => url === urlToOpen);
  if (index !== -1) {
    openLinkInProfile(rules[index].url, rules[index].profileEmail);
    return;
  }

  if (BrowserWindow.getAllWindows().length === 0) createWindow(filteredChromeProfiles, urlToOpen);
}).catch(console.error);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
