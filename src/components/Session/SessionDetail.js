import React from 'react';
import {compose} from 'recompose';
import marked from 'marked';
import {withRouter} from 'react-router';
import Button from 'material-ui/Button';
import Card, {CardContent} from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import SpeakerList from '../Speaker/SpeakerList';
import {withStyles} from 'material-ui/styles';
import * as Difficulty from './helpers/Difficulty';
import WhatshotIcon from 'material-ui-icons/Whatshot';

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

const SessionDetail = props => {
  const {classes, history, location} = props;
  const {session, schedule} = props;
  const {title, description, speakers, complexity} = session;

  const markedDescription = description && marked(description);

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography type="headline" component="h2">
          {title}
        </Typography>
        {Difficulty.valueOf(complexity) && (
          <div>
            <WhatshotIcon color={Difficulty.checkDifficulty(complexity, Difficulty.BEGINNER)}/>
            <WhatshotIcon color={Difficulty.checkDifficulty(complexity, Difficulty.INTERMEDIATE)}/>
            <WhatshotIcon color={Difficulty.checkDifficulty(complexity, Difficulty.EXPERT)}/>
          </div>
        )}
        {schedule && (
          <div>
            {`${schedule.date} / ${schedule.startTime} - ${schedule.endTime}`}
          </div>
        )}
        {session.track && (
          <div>
            {`Salle ${session.track.title}`}
          </div>
        )}
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

export default composed(SessionDetail);
