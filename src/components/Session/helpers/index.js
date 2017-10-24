import {denormalize} from 'normalizr';
import {sessionSchema} from '../schema';
import config from '../../../config';

export const getSession = (id, entities) => {
  return denormalize(id, sessionSchema, entities);
};

export const getSessions = (entities) => {
  return Object.values(entities.sessions);
};

const getDb = () => window.sqlitePlugin.openDatabase(config.db);

const execQuery = (transaction, query, parameters) => new Promise((resolve, reject) => {
  const onSuccess = (transaction, resultSet) => resolve(resultSet);

  transaction.executeSql(
    query,
    parameters,
    onSuccess,
    (transaction, error) => reject(error)
  );
});

export const loadNote = sessionId => new Promise((resolve, reject) => {
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

  getDb().transaction(
    selectTransaction,
    error => reject(error)
  );
});

export const loadMedia = (sessionId, itemType) => new Promise((resolve, reject) => {
  const {dbEntity, dbJoinEntity, dbJoinPrimaryKey} = itemType;

  console.warn('loadMedia', sessionId, itemType);

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

      console.warn('loadMedia onSuccess', {
        itemType,
        medias,
      });

      resolve({
        itemType,
        medias,
      })
    };

    execQuery(transaction, query, parameters)
      .then(onSuccess)
      .catch(error => reject(error));
  };

  getDb().transaction(
    selectTransaction,
    error => reject(error)
  );
});

export const saveNote = (session, content) => new Promise((resolve, reject) => {
  const db = window.sqlitePlugin.openDatabase(config.db);

  const onTransactionError = error => {
    console.error('[TransactionException]: ', error.message);
  };

  db.transaction(transaction => {
    const query = 'INSERT OR REPLACE INTO note (id, content) VALUES (?, ?)';
    const parameters = [session.id, content];

    const onSuccess = (transaction, resultSet) => resolve(resultSet);
    const onError = (transaction, error) => reject(error);

    transaction.executeSql(
      query,
      parameters,
      onSuccess,
      onError
    );
  }, onTransactionError);
});
