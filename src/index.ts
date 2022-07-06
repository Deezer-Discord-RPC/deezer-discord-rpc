import RPC from 'discord-rpc';
import {
  getTrackTitle, getTrackCover, getTrackLink, getTrackArtist, getTrackDuration
} from './activity/track';
import {
  getAlbumLink, getAlbumTitle
} from './activity/album';
import ms from 'ms';
import { CLIENT_ID, ACTIVITY_REFRESH_EVERY } from './variables';

const rpc = new RPC.Client({
  transport: 'ipc'
});

async function setActivity() {
  if (!rpc) return;

  rpc.setActivity({
    details: await getTrackTitle(3135556),
    state: `By ${await getTrackArtist(3135556)}`,
    endTimestamp: new Date().getTime() + ms(await getTrackDuration(3135556) + 's'),
    largeImageKey: await getTrackCover(3135556),
    largeImageText: await getAlbumTitle(302127),
    smallImageKey: 'play',
    smallImageText: 'Playing',
    instance: false,
    buttons: [
      {
        label: 'See title on Deezer',
        url: await getTrackLink(3135556)
      },
      {
        label: 'See album on Deezer',
        url: await getAlbumLink(302127)
      }
    ]
  });
  
}

rpc.on('ready', () => {
  setActivity();

  setInterval(() => {
    setActivity();
  }, ACTIVITY_REFRESH_EVERY);
});

rpc.login({ clientId: CLIENT_ID }).catch(console.error);