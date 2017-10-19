import React from 'react';
import marked from 'marked';
import Card, {CardContent, CardMedia} from 'material-ui/Card';
import Switch from 'material-ui/Switch';
import Typography from 'material-ui/Typography';
import {withStyles} from 'material-ui/styles';
import config from '../../config';
import SessionList from '../Session/SessionList';
import ContactFindOptions from "cordova-plugin-contacts/www/ContactFindOptions";
import ContactOrganization from "cordova-plugin-contacts/www/ContactOrganization";
import ContactField from "cordova-plugin-contacts/www/ContactField";


const styles = {
  card: {
    margin: 16,
  },
  media: {
    height: 200,
  },
  name: {
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
      this.setState({isLoading: false});
      return;
    }

    const {speaker} = this.props;
    this.findInContacts(speaker);
  }

  findInContacts(speaker) {
    const onFindSuccess = (contacts) => {
      const nextState = {isLoading: false, isInContacts: false};
      console.warn('contacts', contacts);

      if (contacts.length !== 0) {
        nextState.isInContacts = true;
        nextState.contact = contacts[0];
      }

      this.setState(nextState);
    };
    const onFindError = (contactError) => {
      this.setState({error: {message: contactError}})
    };

    const optionsRecherche = new ContactFindOptions();
    optionsRecherche.filter = speaker.name;
    optionsRecherche.multiple = false;
    optionsRecherche.desiredFields = [
      navigator.contacts.fieldType.id,
      navigator.contacts.fieldType.displayName,
    ];
    const champsRecherche = [
      navigator.contacts.fieldType.displayName,
    ];
    navigator.contacts.find(champsRecherche, onFindSuccess, onFindError, optionsRecherche);
  }

  manageContact(event, checked) {
    checked ? this.createContact() : this.removeContact();
  }

  createContact() {
    const {speaker} = this.props;

    const socials = speaker.socials || [];
    const urls = socials.map((social, index) => (
      new ContactField(social.name, social.link, index === 0)
    ));

    const contact = navigator.contacts.create(
      {
        displayName: speaker.name,
        nickname: speaker.name,
        organizations: [
          new ContactOrganization(true, null, speaker.company, null, null),
        ],
        note: speaker.shortBio,
        photos: [
          new ContactField('avatar', config.imgUrl + speaker.photoUrl, true),
        ],
        urls: urls,
      }
    );

    const onSaveSuccess = (contact) => {
      this.setState({isInContacts: true, contact: contact});
    };

    const onSaveError = (contactError) => {
      console.error('[SaveContactException]', contactError);
    };

    contact.save(onSaveSuccess, onSaveError);
  }

  removeContact() {
    const onRemoveSuccess = (contact) => {
      this.setState({isInContacts: false, contact: null});
    };

    const onRemoveError = (contactError) => {
      console.error('[RemoveContactException]', contactError);
    };

    this.state.contact && this.state.contact.remove(onRemoveSuccess, onRemoveError);
  }

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

    console.warn('speaker', speaker);

    return (
      <Card className={classes.card}>
        <CardMedia
          className={classes.media}
          image={config.imgUrl + photoUrl}
          title={name}
        />
        <CardContent>
          <Typography type="headline" component="h2" className={classes.name}>
            {name}
            { window.cordova &&
            <Switch
              checked={this.state.isInContacts}
              onChange={this.manageContact.bind(this)}
              aria-label="isInContacts"
            />}
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
