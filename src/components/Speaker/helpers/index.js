import {denormalize} from 'normalizr';
import {speakerSchema} from '../schema';
import {getSessions} from '../../Session/helpers';

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

export const getSpeakers = (entities) => {
  return Object.values(entities.speakers);
};
