import React from 'react';
import {Route, Switch, withRouter} from 'react-router';
import {compose} from 'recompose';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import ArrowBack from 'material-ui-icons/ArrowBack';
import Home from 'material-ui-icons/Home';
import Menu, {MenuItem} from 'material-ui/Menu';
import MenuIcon from 'material-ui-icons/Menu';
import {withStyles} from 'material-ui/styles';
import {routerPropTypes} from '../../propTypes';

const styles = theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  }
});

class Header extends React.Component {
  static propTypes = {...routerPropTypes};

  state = {
    anchorEl: null,
    open: false,
  };

  openMenu = event => {
    this.setState({open: true, anchorEl: event.currentTarget});
  };

  closeMenu = () => {
    this.setState({open: false});
  };

  navigate(path) {
    this.props.history.push(path);
    this.closeMenu();
  }

  navigateBack(path) {
    const {history} = this.props;

    history.length > 2 ? history.goBack() : this.navigate(path);
  }

  renderTitle() {
    const {classes} = this.props;

    return (
      <Switch>
        <Route path='/sessions/:id' render={() => (
          <div className={classes.title}>
            <IconButton
              color="contrast"
              onClick={() => this.navigateBack('/sessions')}>
              <ArrowBack />
            </IconButton>
            <Typography
              type="title"
              color="inherit">
              Session
            </Typography>
          </div>
        )}/>
        <Route path='/speakers/:id' render={props => (
          <div className={classes.title}>
            <IconButton
              color="contrast"
              onClick={() => this.navigateBack('/speakers')}>
              <ArrowBack/>
            </IconButton>
            <Typography
              type="title"
              color="inherit">
              Présentateur
            </Typography>
          </div>
        )}/>
        {window.cordova && <Route path='/device' render={props => (
          <div className={classes.title}>
            <IconButton
              color="contrast"
              onClick={() => this.navigateBack('/device')}>
              <ArrowBack/>
            </IconButton>
            <Typography
              type="title"
              color="inherit">
              Téléphone
            </Typography>
          </div>
        )}/>}
        <Route render={() => (
          <div className={classes.title}>
            <IconButton
              color="contrast"
              onClick={() => this.navigate('/')}>
              <Home/>
            </IconButton>
            <Typography
              type="title"
              color="inherit"
              className={classes.title}
              onClick={() => this.navigate('/')}>
              Conférence
            </Typography>
          </div>
        )}/>
      </Switch>
    );
  }

  renderMenu() {
    return (
      <div>
        <IconButton
          color="contrast"
          onClick={this.openMenu}>
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onRequestClose={this.closeMenu}
        >
          <MenuItem onClick={() => this.navigate('/sessions')}>Sessions</MenuItem>
          <MenuItem onClick={() => this.navigate('/speakers')}>Présentateurs</MenuItem>
          {window.cordova && <MenuItem onClick={() => this.navigate('/device')}>Téléphone</MenuItem>}
        </Menu>
      </div>
    )
  }

  render () {
    return (
      <AppBar position="static">
        <Toolbar>
          {this.renderTitle()}
          {this.renderMenu()}
        </Toolbar>
      </AppBar>
    )
  }
}

const composed = compose(
  withRouter,
  withStyles(styles),
);

export default composed(Header);
