import React from 'react';
import {withRouter} from 'react-router';
import {compose} from 'recompose';
import CircularProgress from 'material-ui/Progress/CircularProgress';
import {withStyles} from 'material-ui/styles';
import PropTypes from 'prop-types';
import Connection from 'cordova-plugin-network-information/www/Connection';
import fetchData from '../../fetchData';
import Header from '../Header';
import Main from '../Main';

const styles = theme => ({
  progressContainer: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent:'center',
    width: '100%',
    height: '100%',
  },
});

export class App extends React.Component {
  static childContextTypes = {
    entities: PropTypes.object,
  };

  static storageKey = 'entities';

  getChildContext() {
    return {entities: this.state.entities};
  }

  state = {
    isLoading: true,
    error: null,
    entities: null,
  };

  constructor(props) {
    super(props);

    this.handleOnline = this.handleOnline.bind(this);
  }

  componentWillMount() {
    const {navigator, cordova} = window;

    if (cordova && navigator.connection.type === Connection.NONE) {
      const entities = localStorage.getItem(App.storageKey);

      if (entities) {
        this.handleData(JSON.parse(entities));
      } else {
        const error = new Error('Failed to load data.');

        this.handleError(error);
      }
    } else {
      this.handleFetch();
    }
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline, false);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline, false);
  }

  handleFetch() {
    fetchData()
      .then(entities => {
        this.handleData(entities);
        this.saveData(entities);
      })
      .catch(error => this.handleError(error));
  }

  saveData(entities) {
    localStorage.setItem(App.storageKey, JSON.stringify(entities));
  }

  handleData(entities) {
    setTimeout(() => {
      this.setState({entities, isLoading: false});
      this.props.history.replace('/');
    }, 800);
  }

  handleError(error) {
    this.setState({error, isLoading: false});
  }

  handleOnline() {
    this.handleFetch();
  }

  render() {
    const {classes} = this.props;
    const {isLoading, error} = this.state;

    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return (
        <div className={classes.progressContainer}>
          <CircularProgress size={50} />
        </div>
      );
    }

    return (
      <div>
        <Header/>
        <Main/>
      </div>
    )
  }
}

const composed = compose(
  withRouter,
  withStyles(styles),
);

export default composed(App);
