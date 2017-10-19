import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles';
import 'normalize.css';
import 'typeface-roboto';
import App from './components/App';
import initDB from './utils/db';

const theme = createMuiTheme();

const {navigator, cordova} = window;

const startApp = () => {
  initDB(false)
    .then(render)
    .catch(error => {
      alert(error.message);
      navigator.app.exitApp();
    });
};

const render = () => {
  ReactDOM.render((
    <BrowserRouter>
      <MuiThemeProvider theme={theme}>
        <App/>
      </MuiThemeProvider>
    </BrowserRouter>
  ), document.getElementById('root'));
};

if (cordova) {
  document.addEventListener('deviceready', startApp, false);
} else {
  render();
}
