const initDB = (dev = false) => {
  return new Promise((resolve, reject) => {
    const db = window.sqlitePlugin.openDatabase({name: 'conference.db', location: 'default'});
    db.transaction(tx => {
      // Notes(id, sessionId, content, createdAt)
      dev && tx.executeSql('DROP TABLE IF EXISTS note');
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS note (
          id INTEGER,
          content TEXT, 
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        )`);

      // Photos(id, content, createdAt)
      dev && tx.executeSql('DROP TABLE IF EXISTS photo');
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS photo (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          content TEXT, 
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

      // NotePhotos(sessionId, photoId)
      dev && tx.executeSql('DROP TABLE IF EXISTS notePhoto');
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS notePhoto (
          noteId INTEGER, 
          photoId INTEGER,
          PRIMARY KEY (noteId, photoId),
          FOREIGN KEY (noteId) REFERENCES note (id),
          FOREIGN KEY (photoId) REFERENCES photo (id)
        )`);
    }, error => {
      reject(error);
    }, () => {
      resolve();
    });
  });
};

export default initDB;