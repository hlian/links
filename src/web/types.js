// @flow

import type { Attachment } from '../types';

type HTTP<T> = { id: 'wait' } | { id: 'good', reward: T } | { id: 'bad', error: Error };

type State = {
  homeGET: HTTP<Attachment[]>,
};

type Action =
  | {| type: 'homeGET', fetch: Promise<any> |}
  | {| type: 'homeGET/good', reward: Attachment[] |}
  | {| type: 'homeGET/bad', error: Error |};

const initialState: State = { homeGET: { id: 'wait' } };

export type { State, Action, HTTP, Attachment };
export { initialState };
