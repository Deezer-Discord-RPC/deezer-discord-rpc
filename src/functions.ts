import { BrowserWindow, dialog, shell, ipcMain, app } from 'electron';
import { artistsSeparator, clientId, noWsActivity, useAsMainApp, userAgents } from './variables';
import { resolve, join } from 'path';
import { version } from '../package.json';
import { findTrackInAlbum, getAlbum } from './activity/album';
import { getTrack } from './activity/track';
import WebSocket from 'ws';
import * as Config from './utils/Config';
import { tray } from './utils/Tray';
import * as DiscordWebSocket from './utils/WebSocket';
import * as RPC from './utils/RPC';
import * as Spotify from './utils/Spotify';
import { log } from './utils/Log';
import loadAdBlock from './utils/AdBlock';

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function prompt(message: string, app: Electron.App, options?: {
  closable?: boolean
}) {
  const win = new BrowserWindow({
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: typeof options?.closable !== 'undefined' ? options?.closable : true,
    webPreferences: {
      preload: join(__dirname, 'prompt.js')
    }
  });

  ipcMain.on('token-received', async (e, data) => {
    Config.set(app, 'discord_token', data);
    Config.set(app, 'use_listening_to', true);
    win.close();
    await dialog.showMessageBox(null, {
      type: 'info',
      buttons: ['Restart later', 'Restart now'],
      title: 'App restart needed',
      message: 'The app needs to be restarted to apply the changes.',
    }).then(({ response }) => {
      if (response === 1) {
        app.relaunch();
        app.exit();
      }
    });
    DiscordWebSocket.connect(data).catch(console.error);
  });

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });
  win.setMenuBarVisibility(false);
  await win.loadFile(join(__dirname, 'prompt.html'), { hash: message });
}
