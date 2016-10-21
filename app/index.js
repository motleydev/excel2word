// @flow
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import routes from './routes';
import configureStore from './store/configureStore';
import './app.global.css';

const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

// import Reactotron from 'reactotron-react-js'

// Reactotron
//   .configure() // we can use plugins here -- more on this later
//   .connect() // let's connect!


render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root')
);
