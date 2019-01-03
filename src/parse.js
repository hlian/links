// @flow

import type { SLAttachment, SLMessage, Attachment } from './types';

import { runValidator, regex, object, number, string, optional, array } from './validator';
import type { Validator } from './validator';
import pino from 'pino';

const logger = pino('parse');

const attachmentValidator = object({
  service_name: string(),
  service_url: optional(string()),
  title: string(),
  title_link: string(),
  author_name: optional(string()),
  author_link: optional(string()),
  thumb_url: string(),
  thumb_width: number(),
  thumb_height: number(),
});

const messageValidator: Validator<SLMessage> = object({
  channel: regex(/^C/, 'channels only, my dear, channels only'),
  message: object({
    attachments: array(attachmentValidator),
  }),
});

class Parse {
  constructor() {}

  parse(object: any): ?Attachment {
    const validated: any = runValidator(messageValidator, object);
    if ('errors' in validated) {
      if (validated.errors.length && validated.errors[0].path === '<root>.message') {
        // This message had no attachments, or was a private channel
        return null;
      } else {
        logger.info('parse: probably something went wrong?', object);
        return null;
      }
    }

    const message: SLMessage = validated;
    if (message.message.attachments[0]) {
      return {
        id: 1234,
        slack: message.message.attachments[0],
        channel: message.channel,
        date: new Date(),
      };
    } else {
      return null;
    }
  }

  ////////////////////////////////////////
}

export { Parse };
