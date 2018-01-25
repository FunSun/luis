import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Provider } from 'mobx-react';

import { Layout } from './layout';
import { setupTestBridge, bdd } from '../config/bridge';
import { initState, RenderOptions } from '../models/state_model';

const state = initState();

setupTestBridge(state, bdd);

export function renderLuis(options: RenderOptions = {}) {
  state.renderOptions = options;
   ReactDOM.render(
    <Provider state={state}>
      <Layout localStorage={localStorage} />
    </Provider>,
    document.querySelector(options.root || '#react-root')
  );
}
