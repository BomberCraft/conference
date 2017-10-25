import React from 'react';
import marked from 'marked';
import Card, {CardContent, CardMedia} from 'material-ui/Card';
import Switch from 'material-ui/Switch';
import Typography from 'material-ui/Typography';
import {withStyles} from 'material-ui/styles';
import config from '../../config';
import SessionList from '../Session/SessionList';
import {createContact, findContacts, removeContact} from './helpers';
import {showToast} from '../../utils/toast';

const styles = {
  card: {
    margin: 16,
  },
  media: {
    height: 200,
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
  },
};

export class SpeakerDetail extends React.Component {
  state = {
    isLoading: true,
    error: null,
    isInContacts: false,
    contact: null,
  };

  componentWillMount() {
    if (!window.cordova) {
      this.setState({
        isLoading: false,
      });

      return;
    }

    findContacts(this.props.speaker)
      .then(contacts => {
        const nextState = {
          isLoading: false,
          isInContacts: false,
        };

        if (contacts.length !== 0) {
          nextState.isInContacts = true;
          nextState.contact = contacts[0];
        }

        this.setState(nextState);
      })
      .catch(error => this.setState({
        error: {
          message: error,
        },
      }));
  }

  manageContact = checked => {
    if (checked) {
      const onCreateSuccess = contact => {
        showToast('Présentateur ajouté aux contacts');
        this.setState({
          isInContacts: true,
          contact,
        });
      };

      const onCreateError = error => {
        showToast('Erreur lors de l\'ajout aux contacts');
        console.error('[AddContactException]', error);
      };

      createContact(this.props.speaker)
        .then(onCreateSuccess)
        .catch(onCreateError);
    } else {
      const onRemoveSuccess = () => {
        showToast('Présentateur supprimé des contacts');
        this.setState({
          isInContacts: false,
          contact: null,
        });
      };
      const onRemoveError = error => {
        showToast('Erreur lors de la suppression aux contacts');
        console.error('[RemoveContactException]', error);
      };

      removeContact(this.state.contact)
        .then(onRemoveSuccess)
        .catch(onRemoveError);
    }
  };

  render() {
    const {classes, speaker} = this.props;
    const {isLoading, error} = this.state;
    const {name, bio, photoUrl, sessions} = speaker;

    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return <p>Chargement des données...</p>;
    }

    const markedBio = bio && marked(bio);

    return (
      <Card className={classes.card}>
        <CardMedia
          className={classes.media}
          image={config.imgUrl + photoUrl}
          title={name}
        />
        <CardContent>
          <Typography type="headline" component="h2" className={classes.title}>
            {name}
            { window.cordova && (
              <Switch
                checked={this.state.isInContacts}
                onChange={(event, checked) => this.manageContact(checked)}
                aria-label="isInContacts"
              />
            )}
          </Typography>
          <Typography component="div">
            <p dangerouslySetInnerHTML={{__html: markedBio}}/>
          </Typography>
          {sessions && (
            <div>
              <Typography type="subheading" color="primary">
                Ses conférences
              </Typography>
              <SessionList sessions={sessions}/>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
}

export default withStyles(styles)(SpeakerDetail);
