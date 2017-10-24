import {denormalize} from 'normalizr';
import {sessionSchema} from '../schema';
import { getDB, execQuery } from '../../../utils/db';

export const getSession = (id, entities) => {
  return denormalize(id, sessionSchema, entities);
};

export const getSessions = (entities) => {
  return Object.values(entities.sessions);
};

export const loadNoteContent = sessionId => new Promise((resolve, reject) => {
  const selectTransaction = transaction => {
    const query = `
      SELECT content
      FROM note
      WHERE id = ?
    `;

    const parameters = [sessionId];

    const onSuccess = resultSet => resolve(
      resultSet.rows.length !== 0
        ? resultSet.rows.item(0).content
        : ''
    );

    execQuery(transaction, query, parameters)
      .then(onSuccess)
      .catch(error => reject(error));
  };

  getDB().transaction(
    selectTransaction,
    error => reject(error)
  );
});

export const loadMedia = (sessionId, mediaType) => new Promise((resolve, reject) => {
  const {dbEntity, dbJoinEntity, dbJoinPrimaryKey} = mediaType;

  const selectTransaction = transaction => {
    const query = `
      SELECT
        ${dbEntity}.id,
        ${dbEntity}.content,
        datetime(${dbEntity}.createdAt, 'localtime') AS createdAt
      FROM ${dbEntity}
        INNER JOIN ${dbJoinEntity}
          on ${dbJoinEntity}.${dbJoinPrimaryKey} = ${dbEntity}.id
      WHERE noteId = ?
    `;

    const parameters = [sessionId];

    const onSuccess = resultSet => {
      let medias = [];

      if (resultSet.rows.length !== 0) {
        for (let i = 0; i < resultSet.rows.length; i++) {
          const {id, content, createdAt} = resultSet.rows.item(i);

          medias.push({id, content, createdAt});
        }
      }

      resolve({
        mediaType,
        medias,
      })
    };

    execQuery(transaction, query, parameters)
      .then(onSuccess)
      .catch(error => reject(error));
  };

  getDB().transaction(
    selectTransaction,
    error => reject(error)
  );
});

export const saveNoteContent = (sessionId, content) => new Promise((resolve, reject) => {
  const upsertTransaction = transaction => {
    const query = `
      INSERT OR REPLACE
      INTO note (id, content)
      VALUES (?, ?)
    `;

    const parameters = [sessionId, content];

    execQuery(transaction, query, parameters)
      .then(resultSet => resolve())
      .catch(error => reject(error));
  };

  getDB().transaction(
    upsertTransaction,
    error => reject(error)
  );
});

export const deleteMedia = (mediaType, mediaId) => new Promise((resolve, reject) => {
  const {dbEntity} = mediaType;

  const deleteTransaction = transaction => {
    const query = `
      DELETE
      FROM ${dbEntity}
      WHERE id = (?)
    `;

    const parameters = [mediaId];

    execQuery(transaction, query, parameters)
      .then(resultSet => resolve())
      .catch(error => reject(error));
  };

  getDB().transaction(
    deleteTransaction,
    error => reject(error)
  );
});
