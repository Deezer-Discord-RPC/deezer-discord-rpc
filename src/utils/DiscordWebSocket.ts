import { log } from './Log';
import * as RPC from './RPC';
import { Client } from 'discord.js-selfbot-v13';

export const client = new Client({
  checkUpdate: false
});

export async function connect(token: string) {
  client.on('ready', async () => {
    if (RPC.client && RPC.client.user) {
      await RPC.client.clearActivity(process.pid);
      await RPC.client.destroy();
    }

    log('WebSocket', `Logged in as ${client.user.tag}`);
  });

  await client.login(token);
}

export function disconnect() {
  log('WebSocket', 'Disconnecting...');
  client.destroy();
  log('WebSocket', 'Disconnected');
}
