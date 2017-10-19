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
};

export default config;
