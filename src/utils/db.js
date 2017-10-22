const initDB = (purgeDB = false) => {
  return new Promise((resolve, reject) => {
    const db = window.sqlitePlugin.openDatabase({name: 'conference.db', location: 'default'});
    db.transaction(tx => {
      purgeDB && purgeDB(tx);

      // Note(id, sessionId, content, createdAt)
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS note (
          id        INTEGER,
          content   TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        )`);

      // Photo(id, content, createdAt)
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS photo (
          id        INTEGER PRIMARY KEY AUTOINCREMENT,
          content   TEXT,
          createdAt DATETIME            DEFAULT CURRENT_TIMESTAMP
        )`);

      // NotePhoto(sessionId, photoId)
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS notePhoto (
          noteId  INTEGER,
          photoId INTEGER,
          PRIMARY KEY (noteId, photoId),
          FOREIGN KEY (noteId) REFERENCES note (id),
          FOREIGN KEY (photoId) REFERENCES photo (id)
            ON DELETE CASCADE
        )`);

      // Record(id, content, createdAt)
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS record (
          id        INTEGER PRIMARY KEY AUTOINCREMENT,
          content   TEXT,
          createdAt DATETIME            DEFAULT CURRENT_TIMESTAMP
        )`);

      // NoteRecord(sessionId, recordId)
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS noteRecord (
          noteId   INTEGER,
          recordId INTEGER,
          PRIMARY KEY (noteId, recordId),
          FOREIGN KEY (noteId) REFERENCES note (id),
          FOREIGN KEY (recordId) REFERENCES record (id)
            ON DELETE CASCADE
        )`);

      // Video(id, content, createdAt)
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS video (
          id        INTEGER PRIMARY KEY AUTOINCREMENT,
          content   TEXT,
          createdAt DATETIME            DEFAULT CURRENT_TIMESTAMP
        )`);

      // NoteVideo(sessionId, videoId)
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS noteVideo (
          noteId  INTEGER,
          videoId INTEGER,
          PRIMARY KEY (noteId, videoId),
          FOREIGN KEY (noteId) REFERENCES note (id),
          FOREIGN KEY (videoId) REFERENCES video (id)
            ON DELETE CASCADE
        )`);
    }, error => {
      reject(error);
    }, () => {
      resolve();
    });

    const purgeDB = (tx) => {
      tx.executeSql('DROP TABLE IF EXISTS noteVideo');
      tx.executeSql('DROP TABLE IF EXISTS video');
      tx.executeSql('DROP TABLE IF EXISTS noteRecord');
      tx.executeSql('DROP TABLE IF EXISTS record');
      tx.executeSql('DROP TABLE IF EXISTS notePhoto');
      tx.executeSql('DROP TABLE IF EXISTS photo');
      tx.executeSql('DROP TABLE IF EXISTS note');
    };

  });
};

export default initDB;