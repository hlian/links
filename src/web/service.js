// @flow

import type { Attachment } from '../types';

const homeGET = async (): Promise<Attachment[]> => {
  const res = await retry(3, () => fetch('/api/home'));
  if (res.status === 200) {
    return await res.json();
  } else {
    throw new Error(`homeGET: what do i do with ${await res.text()}`);
  }
};

// Sometimes the backend is restarting during development
const retry = async (times: number, action: () => Promise<Response>): Promise<Response> => {
  let tries = 0;
  while (tries < times) {
    const res = await action();
    if (res.status === 504 && tries + 1 >= times) {
      return res;
    } else if (res.status == 504 && tries + 1 < times) {
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, times)));
      tries++;
    } else {
      return res;
    }
  }
  throw new Error('impossible');
};

export { homeGET, retry };
