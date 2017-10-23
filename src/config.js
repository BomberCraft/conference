const apiUrl = 'https://raw.githubusercontent.com/DevInstitut/conference-data/master';
const sessions = 'sessions.json';
const speakers = 'speakers.json';
const devfest = 'https://devfest.gdgnantes.com';

/**
 * Config
 */
const config = {
  api: {
    sessions: `${apiUrl}/${sessions}`,
    speakers: `${apiUrl}/${speakers}`,
  },
  imgUrl: devfest,
  db: {
    name: 'conference.db',
    location: 'default',
  },
};

export default config;
