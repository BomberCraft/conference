import config from './config';

/**
 * Fetch sessions
 */
const fetchSessions = () => fetch(config.api.sessions).then(response => {
  if (response.ok) {
    return response.json();
  } else {
    throw new Error('Cannot retrieve sessions list');
  }
});

/**
 * Fetch speakers
 */
const fetchSpeakers = () => fetch(config.api.speakers).then(response => {
  if (response.ok) {
    return response.json();
  } else {
    throw new Error('Cannot retrieve speakers list');
  }
});

/**
 * Fetch data
 */
const fetchData = () => Promise.all([
  fetchSessions(),
  fetchSpeakers(),
]).then(([sessions, speakers]) => ({
  sessions,
  speakers,
}));

export default fetchData;
