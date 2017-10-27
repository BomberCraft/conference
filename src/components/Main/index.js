import React from 'react';
import {Route, Switch} from 'react-router';
import Home from '../Home';
import SessionContainer from '../Session/SessionContainer';
import SpeakerContainer from '../Speaker/SpeakerContainer';
import PartnerContainer from '../Partner/PartnerContainer';
import DeviceInfos from '../Device';

const Main = () => (
  <Switch>
    <Route exact path='/' component={Home}/>
    <Route path='/sessions' component={SessionContainer}/>
    <Route path='/speakers' component={SpeakerContainer}/>
    <Route path='/partners' component={PartnerContainer}/>
    {window.cordova && <Route path='/device' component={DeviceInfos}/>}
  </Switch>
);

export default Main;
