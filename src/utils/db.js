import config from '../config';

/**
 * Purge database
 *
 * @param transaction
 */
const purgeDB = transaction => {
  transaction.executeSql('DROP TABLE IF EXISTS noteVideo');
  transaction.executeSql('DROP TABLE IF EXISTS video');
  transaction.executeSql('DROP TABLE IF EXISTS noteRecord');
  transaction.executeSql('DROP TABLE IF EXISTS record');
  transaction.executeSql('DROP TABLE IF EXISTS notePhoto');
  transaction.executeSql('DROP TABLE IF EXISTS photo');
  transaction.executeSql('DROP TABLE IF EXISTS note');
};

/**
 * Create table
 *
 * @param transaction
 */
const createTable = transaction => {
  // Note(id, content, createdAt)
  transaction.executeSql(`
    CREATE TABLE IF NOT EXISTS note (
      id        INTEGER,
      content   TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )
  `);

  // Photo(id, content, createdAt)
  transaction.executeSql(`
    CREATE TABLE IF NOT EXISTS photo (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      content   TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // NotePhoto(sessionId, photoId)
  transaction.executeSql(`
    CREATE TABLE IF NOT EXISTS notePhoto (
      noteId  INTEGER,
      photoId INTEGER,
      PRIMARY KEY (noteId, photoId),
      FOREIGN KEY (noteId) REFERENCES note (id),
      FOREIGN KEY (photoId) REFERENCES photo (id)
        ON DELETE CASCADE
    )
  `);

  // Record(id, content, createdAt)
  transaction.executeSql(`
    CREATE TABLE IF NOT EXISTS record (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      content   TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // NoteRecord(noteId, recordId)
  transaction.executeSql(`
    CREATE TABLE IF NOT EXISTS noteRecord (
      noteId   INTEGER,
      recordId INTEGER,
      PRIMARY KEY (noteId, recordId),
      FOREIGN KEY (noteId) REFERENCES note (id),
      FOREIGN KEY (recordId) REFERENCES record (id)
        ON DELETE CASCADE
    )
  `);

  // Video(id, content, createdAt)
  transaction.executeSql(`
    CREATE TABLE IF NOT EXISTS video (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      content   TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // NoteVideo(noteId, videoId)
  transaction.executeSql(`
    CREATE TABLE IF NOT EXISTS noteVideo (
      noteId  INTEGER,
      videoId INTEGER,
      PRIMARY KEY (noteId, videoId),
      FOREIGN KEY (noteId) REFERENCES note (id),
      FOREIGN KEY (videoId) REFERENCES video (id)
        ON DELETE CASCADE
    )
  `);
};

/**
 * Create database
 *
 * @param transaction
 * @param doPurge
 */
const createDB = (transaction, doPurge) => {
  doPurge && purgeDB(transaction);
  createTable(transaction);
};

/**
 * Init database
 *
 * @param doPurge
 */
export const initDB = (doPurge = false) => new Promise((resolve, reject) => {
  const db = window.sqlitePlugin.openDatabase(config.db);

  db.transaction(
    transaction => createDB(transaction, doPurge),
    error => reject(error),
    () => resolve()
  );
});

/**
 * Get database
 */
export const getDB = () => window.sqlitePlugin.openDatabase(config.db);

/**
 * Execute query
 *
 * @param transaction
 * @param query
 * @param parameters
 */
export const executeQuery = (transaction, query, parameters) => new Promise((resolve, reject) => {
  const onSuccess = (transaction, resultSet) => resolve(resultSet);

  transaction.executeSql(
    query,
    parameters,
    onSuccess,
    (transaction, error) => reject(error)
  );
});
