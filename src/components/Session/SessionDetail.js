import React from 'react';
import {compose} from 'recompose';
import marked from 'marked';
import {withRouter} from 'react-router';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Card, {CardContent} from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import SpeakerList from '../Speaker/SpeakerList';
import {withStyles} from 'material-ui/styles';
import * as Difficulty from './helpers/Difficulty';
import WhatshotIcon from 'material-ui-icons/Whatshot';
import Event from 'material-ui-icons/Event';
import EventAvailable from 'material-ui-icons/EventAvailable';
import {showToast} from '../../utils/toast';
import {findSessionInCalendar, openCalendar, addSessionToCalendar} from './helpers/index';

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

export class SessionDetail extends React.Component {
  state = {
    isLoading: true,
    error: null,
    isInCalendar: false,
  };

  componentWillMount() {
    if (!window.cordova) {
      this.setState({
        isLoading: false,
      });

      return;
    }

    const {session, schedule} = this.props;
    findSessionInCalendar(session, schedule)
      .then(events => {
        const nextState = {
          isLoading: false,
          isInCalendar: false,
        };

        if (events.length !== 0) {
          nextState.isInCalendar = true;
        }

        this.setState(nextState);
      })
      .catch(error => this.setState({
        error: {
          message: error,
        },
      }));
  }

  handleCalendar = (session, schedule) => {
    const {isInCalendar} = this.state;

    if (isInCalendar) {
      const startHours = schedule.startTime.split(':');
      const startDate = new Date(schedule.date);
      startDate.setHours(startHours[0], startHours[1]);
      openCalendar(startDate);
    } else {
      addSessionToCalendar(session, schedule)
        .then(() => {
          this.setState({isInCalendar: true});
        })
        .catch(message => {
          showToast(`Erreur lors de l'ajout au calendrier`);
          console.error('[AddEventException]', message);
        })
    }
  };

  render() {
    const {classes, history, location} = this.props;
    const {session, schedule} = this.props;
    const {title, description, speakers, complexity} = session;
    const {isLoading, error} = this.state;
    const {isInCalendar} = this.state;

    const markedDescription = description && marked(description);

    if (error) {
      return null;
    }

    if (isLoading) {
      return <p>Chargement des données...</p>;
    }

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
              {window.cordova && (
                <IconButton
                  color="accent"
                  onClick={() => this.handleCalendar(session, schedule)}>
                  { isInCalendar ? (<EventAvailable/>) : (<Event/>) }
                </IconButton>
              )}
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
  }
}

const composed = compose(
  withRouter,
  withStyles(styles),
);

export default composed(SessionDetail);
