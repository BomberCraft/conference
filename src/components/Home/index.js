import React from 'react';
import {compose} from 'recompose';
import {withRouter} from 'react-router';
import Card, {CardContent, CardMedia} from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import List, {ListItem, ListItemText} from 'material-ui/List';
import {withStyles} from 'material-ui/styles';
import {routerPropTypes} from '../../propTypes';
import config from '../../config';

const styles = theme => ({
  flex: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  media: {
    height: 100,
  },
});

export class Home extends React.Component {
  static propTypes = {...routerPropTypes};

  render () {
    const {classes, history} = this.props;

    return (
      <Card className={classes.card}>
        <CardMedia
          className={classes.media}
          image={config.imgUrl + '/images/backgrounds/keynote.jpg'}
          title="Contemplative Reptile"
        />
        <CardContent>
          <Typography type="headline" component="h2">
            13/10/2017 - 25/10/2017
          </Typography>
          <List>
            <ListItem
              button
              onClick={() => history.push(`/sessions`)}>
              <ListItemText primary='Liste des conférences'/>
            </ListItem>
            <ListItem
              button
              onClick={() => history.push(`/speakers`)}>
              <ListItemText primary='Liste des présentateurs'/>
            </ListItem>
            <ListItem
              button
              onClick={() => history.push(`/partners`)}>
              <ListItemText primary='Liste des sponsors'/>
            </ListItem>
          </List>
        </CardContent>
      </Card>
    )
  }
}

const composed = compose(
  withRouter,
  withStyles(styles),
);

export default composed(Home);
