import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router';
import Card, {CardHeader, CardContent} from 'material-ui/Card';
import Input from 'material-ui/Input';
import {withStyles} from 'material-ui/styles';
import {getSessions, getSession, getSchedule} from './helpers';
import SessionList from './SessionList';
import SessionDetail from './SessionDetail';
import SessionNote from './SessionNote';

const styles = theme => ({
  card: {
    margin: 16,
  },
  input: {
    width: '100%'
  },
});

export class SessionContainer extends React.Component {
  static contextTypes = {
    entities: PropTypes.object.isRequired,
  };

  state = {
    search: null,
  };

  handleSearch (event) {
    this.setState({search: event.target.value});
  }

  render () {
    const {classes} = this.props;
    const {entities} = this.context;

    return (
      <Switch>
        <Route exact path='/sessions' render={() => {
          const sessions = getSessions(entities);
          const {search} = this.state;

          let sessionList = sessions;

          if (search) {
            const sessionFilter = session => session.title.toLowerCase().indexOf(search) !== -1;

            sessionList = sessionList.filter(sessionFilter);
          }

          return (
            <div>
              <Card className={classes.card}>
                <CardContent>
                  <Input
                    className={classes.input}
                    onChange={this.handleSearch.bind(this)} placeholder="Rechercher une session" value={search || ''}/>
                </CardContent>
              </Card>
              <Card className={classes.card}>
                <CardHeader title="Liste des conférences"/>
                <CardContent>
                  <SessionList sessions={sessionList}/>
                </CardContent>
              </Card>
            </div>
          );
        }}/>
        <Route path='/sessions/:id/notes' render={props => {
          const id = +props.match.params.id;
          const session = getSession(id, entities);

          return <SessionNote session={session}/>;
        }}/>
        <Route path='/sessions/:id' render={props => {
          const id = +props.match.params.id;
          const session = getSession(id, entities);
          const schedule = getSchedule(id, entities);

          return <SessionDetail session={session} schedule={schedule}/>;
        }}/>
      </Switch>
    )
  }
}

export default withStyles(styles)(SessionContainer);

