import React from 'react';
import {withRouter} from 'react-router';
import {compose} from 'recompose';
import CircularProgress from 'material-ui/Progress/CircularProgress';
import {withStyles} from 'material-ui/styles';
import PropTypes from 'prop-types';
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

  getChildContext() {
    return {entities: this.state.entities};
  }

  state = {
    isLoading: true,
    error: null,
    entities: null,
  };

  componentWillMount() {
    fetchData()
      .then(entities => {
        setTimeout(() => {
          this.setState({entities, isLoading: false});
          this.props.history.replace('/');
        }, 800);
      })
      .catch(error => this.setState({error, isLoading: false}));
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
