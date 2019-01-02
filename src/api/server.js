// @flow

import Koa from 'koa';
import KoaLogger from 'koa-pino-logger';
import KoaBodyParser from 'koa-bodyparser';
import Pino from 'pino';

import type { Env } from '../env';
import type { Database } from '../database';
import { Routes } from './routes';

type ServerProps = {|
  env: Env,
  db: Database,
|};

class Server {
  app: Koa;
  started: Date;
  port: number;
  env: Env;

  constructor({ env, db }: ServerProps) {
    this.env = env;
    this.started = new Date();

    const app = new Koa();
    const logger = Pino();
    const router = new Routes(env, db);
    app.use(KoaBodyParser());
    app.use(router.routes());

    app.use(
      new KoaLogger({
        logger,
        serializers: {
          req: req => `${req.method} ${req.url}`,
          res: res => `${res.statusCode}`,
        },
      })
    );

    this.app = app;
  }

  start() {
    this.app.listen(this.env.PORT || 8080);
  }
}

export { Server };
