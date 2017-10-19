import React from 'react';
import {withRouter} from 'react-router';
import PropTypes from 'prop-types';
import fetchData from '../../fetchData';
import Header from '../Header';
import Main from '../Main';

export class App extends React.Component {
  static childContextTypes = {
    entities: PropTypes.object,
  };

  getChildContext() {
    return {entities: this.state.entities};
  }

  state = {
    isLoading: false,
    error: null,
    entities: null,
  };

  componentWillMount() {
    this.setState({isLoading: true});

    fetchData()
      .then(entities => {
        this.setState({entities, isLoading: false});
        this.props.history.replace('/');
      })
      .catch(error => this.setState({error, isLoading: false}));
  }

  render() {
    const {isLoading, error} = this.state;

    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return <p>Chargement des données...</p>;
    }

    return (
      <div>
        <Header/>
        <Main/>
      </div>
    )
  }
}

export default withRouter(App);
