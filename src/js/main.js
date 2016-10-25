import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './components/app';
import configureStore from './stores/';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import {deepOrange500} from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
});

ReactDOM.render(
  <MuiThemeProvider muiTheme={ muiTheme }>
    <Provider store={ configureStore() }>
      <App />
    </Provider>
  </MuiThemeProvider>,
  document.getElementById("app-container")
)