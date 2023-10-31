import { IpcRendererEvent, contextBridge, ipcRenderer, shell } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ExtraConfig} from "../main/Globals";
import { Stream } from "socketmost/dist/modules/Messages";

    const exec = require('child_process').exec;
type ApiCallback = (event: IpcRendererEvent, ...args: any[]) => void

export interface Api {
  settings: (callback: ApiCallback) => void
  reverse: (callback: ApiCallback) => void
  getSettings: () => void
  saveSettings: (settings: ExtraConfig) => void
  stream: (stream: Stream) =>  void
  quit: () =>  void
  shutdown:()=>void
}

function execute(command, callback) {
  exec(command, (error, stdout, stderr) => { 
      callback(stdout); 
  });
};

// Custom APIs for renderer
const api: Api = {
  settings: (callback: ApiCallback) => ipcRenderer.on('settings', callback),
  reverse: (callback: ApiCallback) => ipcRenderer.on('reverse', callback),
  getSettings: () => ipcRenderer.send('getSettings'),
  saveSettings: (settings: ExtraConfig) => ipcRenderer.send('saveSettings', settings),
  stream: (stream: Stream) => ipcRenderer.send('startStream', stream),
  quit: () => ipcRenderer.send('quit'),
  shutdown:()=>{
    execute('shutdown now', (output) => {
      console.log(output);
  });

  }
}

try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
  contextBridge.exposeInMainWorld('electronAPI', {
    settings: (callback: ApiCallback) => ipcRenderer.on('settings', callback),
    getSettings: () => ipcRenderer.send('getSettings'),
    saveSettings: (settings: ExtraConfig) => ipcRenderer.send('saveSettings', settings),
    stream: (stream: Stream) => ipcRenderer.send('startStream', stream),
    quit: () => ipcRenderer.send('quit')
  })
} catch (error) {
  console.error(error)
}

