// @flow

import KoaRouter from 'koa-router';
import Pino from 'pino';
import KoaConnect from 'koa2-connect';
import ProxyMiddleware from 'http-proxy-middleware';
import { DateTime } from 'luxon';

import type { Database } from '../database';
import type { Attachment } from '../types';
import { Env } from '../env';

const logger = Pino();

const makeParcelProxy = (port: number) =>
  KoaConnect(
    ProxyMiddleware({
      target: `http://localhost:${port}`,
    })
  );

class Routes {
  db: Database;
  env: Env;
  koa: KoaRouter;
  started: Date;

  constructor(env: Env, db: Database) {
    this.db = db;
    this.env = env;
    this.started = new Date();
    this.koa = new KoaRouter();
    this.koa.get('/api/heartbeat', this.heartbeatGET.bind(this));
    this.koa.get('/api/home', this.homeGET.bind(this));

    if (env.FRONTEND_PORT) {
      const port = env.FRONTEND_PORT;
      logger.warn(`FRONTEND_PORT detected. Make sure Parcel is running at port ${port}!`);
      this.koa.all('*', makeParcelProxy(port));
    }
  }

  ////////////////////////////////////////

  async auth(ctx: any, next: (user: any) => Promise<void>): Promise<void> {
    // No authentication yet
    await next(null);
  }

  async csrf(ctx: any, next: (user: any) => Promise<void>): Promise<void> {
    await this.auth(ctx, async user => {
      if (!ctx.request.body.csrf) {
        ctx.status = 400;
        ctx.body = { error: 'missing CSRF token' };
      } else {
        await next(user);
      }
    });
  }

  ////////////////////////////////////////

  async homeGET(ctx: any) {
    const results = (await this.db.all(`SELECT id, channel, json, strftime('%s', created_at) as date FROM links`)).map(
      ({ id, channel, json, date }) => {
        const attachment: Attachment = {
          id,
          channel,
          date: new Date(date * 1000).toISOString(),
          slack: JSON.parse(json),
        };
        return attachment;
      }
    );

    ctx.body = results;
  }

  async heartbeatGET(ctx: any) {
    ctx.body = {
      aliveSeconds: (new Date() - this.started) / 1000,
    };
  }

  routes() {
    return this.koa.routes();
  }
}

export { Routes };
