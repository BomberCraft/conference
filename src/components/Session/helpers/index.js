import {denormalize} from 'normalizr';
import {sessionSchema} from '../schema';
import { getDB, executeQuery } from '../../../utils/db';

/**
 * Get session
 *
 * @param id
 * @param entities
 * @returns {*}
 */
export const getSession = (id, entities) => {
  return denormalize(id, sessionSchema, entities);
};

/**
 * Get sessions
 *
 * @param entities
 * @returns {*}
 */
export const getSessions = (entities) => {
  return Object.values(entities.sessions);
};

/**
 * Load note content
 *
 * @param sessionId
 */
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

    executeQuery(transaction, query, parameters)
      .then(onSuccess)
      .catch(error => reject(error));
  };

  getDB().transaction(
    selectTransaction,
    error => reject(error)
  );
});

/**
 * Save note content
 *
 * @param sessionId
 * @param content
 */
export const saveNoteContent = (sessionId, content) => new Promise((resolve, reject) => {
  const upsertTransaction = transaction => {
    const query = `
      INSERT OR REPLACE
      INTO note (id, content)
      VALUES (?, ?)
    `;

    const parameters = [sessionId, content];

    executeQuery(transaction, query, parameters)
      .then(() => resolve())
      .catch(error => reject(error));
  };

  getDB().transaction(
    upsertTransaction,
    error => reject(error)
  );
});

/**
 * Load media
 *
 * @param sessionId
 * @param mediaType
 */
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
      });
    };

    executeQuery(transaction, query, parameters)
      .then(onSuccess)
      .catch(error => reject(error));
  };

  getDB().transaction(
    selectTransaction,
    error => reject(error)
  );
});

/**
 * Delete media
 *
 * @param mediaType
 * @param mediaId
 */
export const deleteMedia = (mediaType, mediaId) => new Promise((resolve, reject) => {
  const {dbEntity} = mediaType;

  const deleteTransaction = transaction => {
    const query = `
      DELETE
      FROM ${dbEntity}
      WHERE id = (?)
    `;

    const parameters = [mediaId];

    executeQuery(transaction, query, parameters)
      .then(() => resolve())
      .catch(error => reject(error));
  };

  getDB().transaction(
    deleteTransaction,
    error => reject(error)
  );
});

/**
 * Save media
 *
 * @param mediaType
 * @param sessionId
 * @param content
 */
export const saveMedia = (mediaType, sessionId, content) => new Promise((resolve, reject) => {
  const {dbEntity, dbJoinEntity, dbJoinPrimaryKey} = mediaType;

  const saveTransaction = transaction => {
    const insertMediaQuery = `
      INSERT
      INTO ${dbEntity} (content)
      VALUES (?)
    `;

    const insertMediaParameters = [content];

    const onInsertMediaSuccess = (transaction, {insertId: mediaId}) => {
      const insertMediaRelationQuery = `
        INSERT
        INTO ${dbJoinEntity} (noteId, ${dbJoinPrimaryKey})
        VALUES (?, ?)
      `;

      const insertMediaRelationParameters = [sessionId, mediaId];

      const onInsertMediaRelationSuccess = (transaction) => {
        const selectMediaQuery = `
          SELECT
            id,
            content,
            datetime(createdAt, 'localtime') AS createdAt
          FROM ${dbEntity}
          WHERE id = ?
        `;

        const selectMediaParameters = [mediaId];

        const onSelectMediaSuccess = (transaction, {rows}) => {
          const media = rows.item(0);

          resolve(media);
        };

        transaction.executeSql(
          selectMediaQuery,
          selectMediaParameters,
          onSelectMediaSuccess
        );
      };

      transaction.executeSql(
        insertMediaRelationQuery,
        insertMediaRelationParameters,
        onInsertMediaRelationSuccess
      );
    };

    transaction.executeSql(
      insertMediaQuery,
      insertMediaParameters,
      onInsertMediaSuccess
    );
  };

  getDB().transaction(
    saveTransaction,
    error => reject(error)
  );
});
