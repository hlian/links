// @flow

import { RTMClient } from '@slack/client';
import pino from 'pino';

import { Env } from './env';
import { Parse } from './parse';
import { Database, withDB } from './database';

const logger = pino('main');

const main = () => {
  const env = new Env();
  withDB(env.DB_PATH, handle => {
    const db = new Database(handle);
    const rtm = new RTMClient(env.SLACK_TOKEN);
    rtm.start();

    const parse = new Parse();
    rtm.on('message', async message => {
      logger.info(message);
      const parsed = parse.parse(message);
      if (parsed) {
        await db.run('INSERT INTO links (json, channel) VALUES (json($json), $channel)', {
          $json: JSON.stringify(parsed.slack),
          $channel: parsed.channel,
        });
        logger.debug('success');
      }
    });
  });
};

main();
