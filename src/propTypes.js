import PropTypes from 'prop-types';

/**
 * Router prop types
 */
export const routerPropTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};
