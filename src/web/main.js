// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import type { State, Action } from './types';
import { initialState } from './types';
import { Main } from './react/main.js';

const middleware = ({ dispatch }) => next => action => {
  if (action.fetch) {
    action.fetch
      .then(reward =>
        dispatch({
          ...action,
          type: `${action.type}/good`,
          reward,
          fetch: undefined,
        })
      )
      .catch(error =>
        dispatch({
          ...action,
          type: `${action.type}/bad`,
          error,
          fetch: undefined,
        })
      );
    return action.fetch;
  } else {
    next(action);
  }
};

const stateMachine = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case 'homeGET/good':
      return { ...state, homeGET: { id: 'good', reward: action.reward } };
    case 'homeGET/bad':
      return { ...state, homeGET: { id: 'bad', error: action.error } };
    default:
      return state;
  }
};

const main = () => {
  const elem = document.getElementById('app');
  if (elem) {
    const store = createStore(stateMachine, initialState, applyMiddleware(middleware));
    ReactDOM.render(
      <Provider store={store}>
        <Main />
      </Provider>,
      elem
    );
  } else {
    throw new Error('main: no #app');
  }
};

main();
