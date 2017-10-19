import React from 'react';
import {compose} from 'recompose';
import {withRouter} from 'react-router';
import Card, {CardContent} from 'material-ui/Card';
import Table, { TableBody, TableCell, TableRow } from 'material-ui/Table';
import {withStyles} from 'material-ui/styles';
import Connection from 'cordova-plugin-network-information/www/Connection';

const styles = theme => ({
  flex: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
});

export class Device extends React.Component {
  static networkStates = {
    [Connection.UNKNOWN]: 'Unknown',
    [Connection.ETHERNET]: 'Ethernet',
    [Connection.WIFI]: 'WiFi',
    [Connection.CELL_2G]: '2G',
    [Connection.CELL_3G]: '3G',
    [Connection.CELL_4G]: '4G',
    [Connection.CELL]: 'Cellular',
    [Connection.NONE]: 'Offline',
  };

  render () {
    const {device} = window;
    const {connection} = navigator;
    const {classes} = this.props;

    return (
      <Card className={classes.card}>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Plateform</TableCell>
                <TableCell>{device.platform}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Version</TableCell>
                <TableCell>{device.version}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>UUID</TableCell>
                <TableCell>{device.uuid}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Model</TableCell>
                <TableCell>{device.model}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Connection</TableCell>
                <TableCell>{Device.networkStates[connection.type]}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }
}

const composed = compose(
  withRouter,
  withStyles(styles),
);

export default composed(Device);
