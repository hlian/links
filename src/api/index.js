// @flow

import Pino from 'pino';

import { Env } from '../env';
import { Server } from './server';
import { withDB } from '../database';

const env = new Env();
withDB(env.DB_PATH, db => {
  const logger = Pino();
  const port = env.PORT || 8080;
  const server = new Server({
    env,
    db,
  });
  logger.info(`main: listening to port ${port}`);
  server.start();
});
