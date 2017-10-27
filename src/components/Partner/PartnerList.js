import React from 'react';
import {compose} from 'recompose';
import {withRouter} from 'react-router';
import {withStyles} from 'material-ui/styles';
import List, {ListItem} from 'material-ui/List';
import Typography from 'material-ui/Typography';
import config from '../../config';
import {routerPropTypes} from '../../propTypes';
import * as PartnerGroup from './helpers/PartnerGroup';

const styles = theme => ({
  partnerGroupWrapper: {
    display: 'block',
  },
  partnerGroupName: {
    marginBottom: '16px',
  },
  partnersWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerLink: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 20,
  },
  partnerImg: {
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    height: 60,
  },
});

export class PartnerList extends React.Component {
  static propTypes = {...routerPropTypes};

  render() {
    const {classes, partners} = this.props;

    return (
      <List>
        {partners.map(partnerGroup => (
          <ListItem key={partnerGroup.title} className={classes.partnerGroupWrapper}>
            <Typography type="title" component="h2" className={classes.partnerGroupName}>
              {PartnerGroup.getNameFromTitle(partnerGroup.title)}
            </Typography>
            <div className={classes.partnersWrapper}> {partnerGroup.logos.map(partner => (
              <a key={partner.name} href={partner.url} className={classes.partnerLink}>
                <div className={classes.partnerImg}
                     style={{backgroundImage: `url(${config.imgUrl}/${partner.logoUrl})`, width: partner.width}}/>
              </a>
            ))}</div>
          </ListItem>
        ))}
      </List>
    )
  }
}

const composed = compose(
  withRouter,
  withStyles(styles),
);

export default composed(PartnerList);
