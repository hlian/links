// @flow

type SLAttachment = {|
  service_name: string,
  service_url: ?string,
  title: string,
  title_link: string,
  author_name: ?string,
  author_link: ?string,
  thumb_url: string,
  thumb_width: number,
  thumb_height: number,
|};

type SLMessage = {|
  channel: string,
  message: {
    attachments: SLAttachment[],
  },
|};

type Attachment = {|
  id: number,
  channel: string,
  slack: SLAttachment,
  date: string,
|};

type Database = any;

export type { SLAttachment, SLMessage, Database, Attachment };
