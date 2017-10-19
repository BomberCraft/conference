import React from 'react';
import {compose} from 'recompose';
import marked from 'marked';
import {withRouter} from 'react-router';
import Button from 'material-ui/Button';
import Card, {CardContent} from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import SpeakerList from '../Speaker/SpeakerList';
import {withStyles} from 'material-ui/styles';

const styles = {
  card: {
    margin: 16,
  },
  media: {
    height: 200,
  },
  button: {
    width: '100%',
  },
};

const SessionNote = props => {
  const {classes, history, location, session} = props;
  const {title, description, speakers} = session;

  const markedDescription = description && marked(description);

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography type="headline" component="h2">
          {title}
        </Typography>
        <Typography component="div">
          <p dangerouslySetInnerHTML={{__html: markedDescription}}/>
        </Typography>
        {speakers && (
          <div>
            <Typography type="subheading" color="primary">
              Présentateurs
            </Typography>
            <SpeakerList speakers={speakers}/>
          </div>
        )}
        <Button
          raised
          color="accent"
          className={classes.button}
          onClick={() => history.push(location.pathname + '/notes')}>
          Mes notes
        </Button>
      </CardContent>
    </Card>
  )
};

const composed = compose(
  withRouter,
  withStyles(styles),
);

export default composed(SessionNote);
