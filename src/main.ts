// Modules to control application life and create native browser window
import { app, BrowserWindow, shell, ipcMain, protocol } from 'electron';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import log from 'electron-log';

type FilteredProfile = { id: string; name: string; user_name: string };

/**
 *
 * @param url
 * @param profileEmail 
 */
const openLinkInProfile = (url: string, profileEmail: string) => {
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
  // if (process.argv.length >= 3) {
  //     const url_to_open = process.argv[2];
  //     log.info("Received: " + url_to_open);

  //     // should print:
  //     // Received: masslinker://123/456
  //     // now take URL apart using string operations ..
  // } else {
  //   log.info('else', JSON.stringify(process.argv));
  // }

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

  // if (!url) {
  //   mainWindow.loadFile(path.join(__dirname, 'index.html'))
  //     .then(() => { mainWindow.webContents.send('sendProfiles', profiles); })
  //     .then(() => { mainWindow.show(); });

  //   return;
  // }

  // and load the index.html of the app.
  // mainWindow.loadURL(url)
  //   .then(() => { mainWindow.show(); });

  mainWindow.loadFile(path.join(__dirname, 'index.html'))
    .then(() => { mainWindow.webContents.send('sendWebData', { profiles, url }); })
    .then(() => { mainWindow.show(); });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow(filteredChromeProfiles)
})

app.on('open-url', (event, url) => {
  log.info('open url', url);
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (BrowserWindow.getAllWindows().length === 0) createWindow(filteredChromeProfiles, url)

  app.whenReady().then(() => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(filteredChromeProfiles, url);
  }).catch(console.error);
})

app.setAsDefaultProtocolClient('https');

// using string concatenation as for some reason, os.homeDir disappears when using path.resolve
const filePath = `${os.homedir()}/Library/Application Support/Google/Chrome/Local State`;
const data = fs.readFileSync(filePath, 'utf-8');
const chromeData: { profile: { info_cache: { [key: string]: { name: string; user_name: string } } }} = JSON.parse(data);
const filteredChromeProfiles: FilteredProfile[] = Object.entries(chromeData.profile.info_cache)
  .map(([id, { name, user_name }]) => ({ id, name, user_name }));
// console.log(filteredChromeProfiles);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  protocol.handle('app', (req) => {
    const { host, pathname } = new URL(req.url)
    log.info('handle1', host, pathname)

    // if (host === 'bundle') {
      // if (pathname === '/') {
        return new Response('<h1>hello, world</h1>', {
          headers: { 'content-type': 'text/html' }
        })
      // }
    // }

      // // NB, this does not check for paths that escape the bundle, e.g.
      // // app://bundle/../../secret_file.txt
      // return net.fetch(pathToFileURL(join(__dirname, pathname)).toString())
    // } else if (host === 'api') {
      // return net.fetch('https://api.my-server.com/' + pathname, {
      //   method: req.method,
      //   headers: req.headers,
      //   body: req.body
      // })
    // }
  })

  // createWindow(filteredChromeProfiles);
  if (BrowserWindow.getAllWindows().length === 0) createWindow(filteredChromeProfiles, '"url"');
}).catch(console.error);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.