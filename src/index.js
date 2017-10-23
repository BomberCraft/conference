import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles';
import 'normalize.css';
import 'typeface-roboto';
import App from './components/App';

const theme = createMuiTheme();

const {cordova} = window;

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
  document.addEventListener('deviceready', render, false);
} else {
  render();
}
