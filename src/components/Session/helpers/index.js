import {denormalize} from 'normalizr';
import {sessionSchema} from '../schema';

export const getSession = (id, entities) => {
  return denormalize(id, sessionSchema, entities);
};

export const getSessions = (entities) => {
  return Object.values(entities.sessions);
};
