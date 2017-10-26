import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router';
import Card, {CardHeader, CardContent} from 'material-ui/Card';
import Input from 'material-ui/Input';
import {withStyles} from 'material-ui/styles';
import {getSpeaker, getSpeakers} from './helpers';
import SpeakerList from './SpeakerList';
import SpeakerDetail from './SpeakerDetail';

const styles = theme => ({
  card: {
    margin: 16,
  },
  input: {
    width: '100%'
  }
});

export class SpeakerContainer extends React.Component {
  static contextTypes = {
    entities: PropTypes.object.isRequired,
  };

  state = {
    search: null,
  };

  handleSearch (event) {
    this.setState({search: event.target.value});
  }

  render () {
    const {classes} = this.props;
    const {entities} = this.context;

    return (
      <Switch>
        <Route exact path='/speakers' render={() => {
          const speakers = getSpeakers(entities);
          const {search} = this.state;

          let speakerList = speakers;

          if (search) {
            const speakerFilter = speaker => speaker.name.toLowerCase().indexOf(search.toLowerCase()) !== -1;

            speakerList = speakerList.filter(speakerFilter);
          }

          return (
            <div>
              <Card className={classes.card}>
                <CardContent>
                  <Input
                    className={classes.input}
                    onChange={this.handleSearch.bind(this)} placeholder="Rechercher un speaker" value={search || ''}/>
                </CardContent>
              </Card>
              <Card className={classes.card}>
                <CardHeader title="Liste des présentateurs"/>
                <CardContent>
                  <SpeakerList speakers={speakerList}/>
                </CardContent>
              </Card>
            </div>
          );
        }}/>
        <Route path='/speakers/:id' render={props => {
          const id = +props.match.params.id;
          const speaker = getSpeaker(id, entities);

          return <SpeakerDetail speaker={speaker}/>;
        }}/>
      </Switch>
    )
  }
}

export default withStyles(styles)(SpeakerContainer);

