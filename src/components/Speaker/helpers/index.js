import ContactFindOptions from 'cordova-plugin-contacts/www/ContactFindOptions';
import ContactOrganization from 'cordova-plugin-contacts/www/ContactOrganization';
import ContactField from 'cordova-plugin-contacts/www/ContactField';
import {denormalize} from 'normalizr';
import {speakerSchema} from '../schema';
import {getSessions} from '../../Session/helpers';
import config from '../../../config';

export const getSpeaker = (id, entities) => {
  const speaker = denormalize(id, speakerSchema, entities);
  const sessions = getSessions(entities);

  const sessionSpeakerFilter = session =>
  session.speakers
  && session.speakers.indexOf(id) !== -1;

  const filteredSessions = sessions.filter(sessionSpeakerFilter);

  return Object.assign({}, speaker, {
    sessions: filteredSessions,
  })
};

export const getSpeakers = entities => {
  return Object.values(entities.speakers);
};

export const findContacts = speaker => new Promise((resolve, reject) => {
  const {contacts} = navigator;

  const searchParams = new ContactFindOptions();
  searchParams.filter = speaker.name;
  searchParams.multiple = false;
  searchParams.desiredFields = [
    contacts.fieldType.id,
    contacts.fieldType.displayName,
  ];

  const searchFields = [
    contacts.fieldType.displayName,
  ];

  const onSuccess = contacts => resolve(contacts);
  const onError = error => reject(error);

  contacts.find(searchFields, onSuccess, onError, searchParams);
});

export const createContact = speaker => new Promise((resolve, reject) => {
  const socials = speaker.socials || [];
  const urls = socials.map((social, index) => new ContactField(social.name, social.link, 0 === index));

  const contact = navigator.contacts.create({
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
  });

  const onSuccess = contact => resolve(contact);
  const onError = error => reject(error);

  contact.save(onSuccess, onError);
});

export const removeContact = contact => new Promise((resolve, reject) => {
  const onSuccess = () => resolve(true);
  const onError = error => reject(error);

  if (contact) {
    contact.remove(onSuccess, onError);
  } else {
    onSuccess();
  }
});
