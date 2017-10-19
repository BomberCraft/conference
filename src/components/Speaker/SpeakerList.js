import React from 'react';
import {withRouter} from 'react-router';
import Avatar from 'material-ui/Avatar';
import List, {ListItem, ListItemText} from 'material-ui/List';
import config from '../../config';
import {routerPropTypes} from '../../propTypes';

export class SpeakerList extends React.Component {
  static propTypes = {...routerPropTypes};

  render () {
    const {history, speakers} = this.props;

    return (
      <List>
        {speakers.map(speaker => (
          <ListItem
            key={speaker.id}
            button
            onClick={() => history.push(`/speakers/${speaker.id}`)}>
            <Avatar alt={speaker.name} src={config.imgUrl + speaker.photoUrl}/>
            <ListItemText primary={speaker.name}/>
          </ListItem>
        ))}
      </List>
    )
  }
}

export default withRouter(SpeakerList);
