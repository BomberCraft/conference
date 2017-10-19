import React from 'react';
import {withRouter} from 'react-router';
import List, {ListItem, ListItemText} from 'material-ui/List';
import {routerPropTypes} from '../../propTypes';

export class SessionList extends React.Component {
  static propTypes = {...routerPropTypes};

  render () {
    const {history, sessions} = this.props;

    return (
      <List>
        {sessions.map(session => (
          <ListItem
            key={session.id}
            button
            onClick={() => history.push(`/sessions/${session.id}`)}>
            <ListItemText primary={session.title}/>
          </ListItem>
        ))}
      </List>
    )
  }
}

export default withRouter(SessionList);
