import config from './config';

/**
 * Fetch partners
 */
const fetchPartners = () => fetch(config.api.partners).then(response => {
  if (response.ok) {
    return response.json();
  } else {
    throw new Error('Cannot retrieve partners list');
  }
});

/**
 * Fetch schedules
 */
const fetchSchedules = () => fetch(config.api.schedules).then(response => {
  if (response.ok) {
    return response.json();
  } else {
    throw new Error('Cannot retrieve schedules list');
  }
});

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
  fetchPartners(),
  fetchSchedules(),
  fetchSessions(),
  fetchSpeakers(),
]).then(([partners, schedules, sessions, speakers]) => ({
  partners,
  schedules,
  sessions,
  speakers,
}));

export default fetchData;
