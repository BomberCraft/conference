import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router';
import Card, {CardHeader, CardContent} from 'material-ui/Card';
import Input from 'material-ui/Input';
import {withStyles} from 'material-ui/styles';
import {getPartners} from './helpers';
import PartnerList from './PartnerList';

const styles = theme => ({
  card: {
    margin: 16,
  },
  input: {
    width: '100%'
  }
});

export class PartnerContainer extends React.Component {
  static contextTypes = {
    entities: PropTypes.object.isRequired,
  };

  state = {
    search: null,
  };

  handleSearch(event) {
    this.setState({search: event.target.value});
  }

  render() {
    const {classes} = this.props;
    const {entities} = this.context;

    return (
      <Switch>
        <Route exact path='/partners' render={() => {
          const partners = getPartners(entities);
          const {search} = this.state;

          let partnerList = partners;

          if (search) {
            const partnerFilter = partner => partner.name.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            const partnerGroupFilter = partnerGroup => partnerGroup.logos.filter(partnerFilter).length !== 0;

            partnerList = partnerList.filter(partnerGroupFilter);
            partnerList = partnerList.map(partnerGroup => {
              let logos = partnerGroup.logos.filter(partnerFilter);
              return { title: partnerGroup.title, logos };
            });
          }

          return (
            <div>
              <Card className={classes.card}>
                <CardContent>
                  <Input
                    className={classes.input}
                    onChange={this.handleSearch.bind(this)} placeholder="Rechercher un sponsor" value={search || ''}/>
                </CardContent>
              </Card>
              <Card className={classes.card}>
                <CardHeader title="Liste des sponsors"/>
                <CardContent>
                  <PartnerList partners={partnerList}/>
                </CardContent>
              </Card>
            </div>
          );
        }}/>
          </Switch>
          )
        }
        }

        export default withStyles(styles)(PartnerContainer);

