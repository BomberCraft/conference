import {denormalize} from 'normalizr';
import {sessionSchema} from '../schema';
import config from '../../../config';

export const getSession = (id, entities) => {
  return denormalize(id, sessionSchema, entities);
};

export const getSessions = (entities) => {
  return Object.values(entities.sessions);
};

export const loadNote = session => new Promise((resolve, reject) => {
  const db = window.sqlitePlugin.openDatabase(config.db);

  const onTransactionError = (error) => {
    console.error('[TransactionException]: ', error.message);
    reject();
  };

  db.transaction(transaction => {
    const query = 'SELECT content FROM note WHERE id = ?';
    const parameters = [session.id];

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

export const loadMedia = (session, itemType) => new Promise((resolve, reject) => {
  const db = window.sqlitePlugin.openDatabase(config.db);

  const {dbEntity, dbJoinEntity, dbJoinPrimaryKey} = itemType;

  const onTransactionError = error => reject(error);

  db.transaction(transaction => {
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
    const parameters = [session.id];

    const onSuccess = (transaction, resultSet) => resolve({
      itemType,
      resultSet,
    });
    const onError = (transaction, error) => reject(error);

    transaction.executeSql(
      query,
      parameters,
      onSuccess,
      onError
    );
  }, onTransactionError);
});

export const saveNote = (session, content) => new Promise((resolve, reject) => {
  if (!window.cordova) {
    localStorage.setItem(session.id, content);
    resolve();

    return;
  }

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
