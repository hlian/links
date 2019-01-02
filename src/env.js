// @flow

import dotenv from 'dotenv';

import { runValidator, object, optional, numeric, string } from './validator';
import type { Validator } from './validator';

const envValidator: Validator<Env> = object({
  FRONTEND_PORT: optional(numeric()),
  PORT: optional(numeric()),
  SLACK_TOKEN: string(),
  DB_PATH: string(),
});

class Env {
  SLACK_TOKEN: string;
  DB_PATH: string;
  PORT: ?number;
  FRONTEND_PORT: ?number;

  constructor() {
    dotenv.config();
    const parsed: any = runValidator(envValidator, process.env);
    if ('errors' in parsed) {
      throw new Error(`Missing environment values! ${JSON.stringify(parsed.errors)}`);
    }

    for (let [key, value] of Object.entries(parsed)) {
      // $FlowFixMe
      this[key] = value;
    }
  }
}

export { Env };
