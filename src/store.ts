import { app, BrowserWindow, shell, ipcMain, protocol } from 'electron';
import log from 'electron-log';
import fs from 'node:fs';
import path from 'node:path';


type Rule = {
    url: string;
    profileEmail: string;
};
type ConfigStore = {
    rules: Rule[];
};

// based on https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
export default class Store {
  private path: string;
  private data: ConfigStore;

  constructor() {
    const userDataPath = app.getPath('userData');
    log.info('userDataPath', userDataPath);
    this.path = path.join(userDataPath, 'config.json');
    this.data = parseDataFile(this.path);
  }
  
  get(key: keyof ConfigStore) {
    return this.data[key];
  }
  
  set<Key extends keyof ConfigStore>(key: Key, val: ConfigStore[Key]) {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath: string): ConfigStore {
  try {
    return JSON.parse(fs.readFileSync(filePath).toString());
  } catch(error) {
    return {
        rules: [],
    };
  }
}