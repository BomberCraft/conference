import React from "react";
import {withStyles} from "material-ui/styles";
import Button from "material-ui/Button";
import TextField from "material-ui/TextField";
import Card, {CardContent} from "material-ui/Card";
import List, {ListItem} from "material-ui/List";
import Collapse from "material-ui/transitions/Collapse";
import Typography from "material-ui/Typography";
import IconButton from "material-ui/IconButton";
import ExpandMoreIcon from "material-ui-icons/ExpandMore";
import AddAPhoto from "material-ui-icons/AddAPhoto";
import Photo from "material-ui-icons/Photo";
import Camera from "cordova-plugin-camera/www/CameraConstants";


const styles = theme => ({
  card: {
    margin: 16,
  },
  cardMenu: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  input: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  figure: {
    margin: '0',
  },
  img: {
    width: '100%',
  },
});

export class SessionNote extends React.Component {
  state = {
    isLoading: true,
    error: null,
    saveDisabled: true,
    note: '',
    isNoteExpanded: true,
    photos: [],
    isPhotosExpanded: true,
  };

  componentWillMount() {
    if (!window.cordova) {
      const note = localStorage.getItem(this.props.session.id) || '';
      this.setState({note, isLoading: false});
      return;
    }

    this.loadNote();
    this.loadPhotos();
  }

  loadNote() {
    const db = window.sqlitePlugin.openDatabase({name: 'conference.db', location: 'default'});

    const onTransactionError = (error) => {
      console.error('[TransactionException]: ', error.message);
      this.setState({error});
    };

    db.transaction(tx => {
      const query = 'SELECT content FROM note WHERE id = ?';
      const parameters = [this.props.session.id];

      const onSqlSuccess = (tx, rs) => {
        const nextState = {isLoading: false};
        if (rs.rows.length !== 0) {
          nextState.note = rs.rows.item(0).content;
        }
        this.setState(nextState);
      };
      const onSqlError = (tx, error) => {
        console.error('[SQLException] Fail to load notes:', error.message);
        this.setState({error});
      };

      tx.executeSql(
        query,
        parameters,
        onSqlSuccess,
        onSqlError
      );
    }, onTransactionError);
  }

  loadPhotos() {
    const db = window.sqlitePlugin.openDatabase({name: 'conference.db', location: 'default'});

    const onTransactionError = (error) => {
      console.error('[TransactionException]: ', error.message);
      this.setState({error});
    };

    db.transaction(tx => {
      const query = `
        SELECT photo.id, photo.content, datetime(photo.createdAt, 'localtime') AS createdAt 
        FROM photo INNER JOIN notePhoto on notePhoto.photoId = photo.id 
        WHERE noteId = ?
      `;
      const parameters = [this.props.session.id];

      const onSqlSuccess = (tx, rs) => {
        const nextState = {isLoading: false};
        if (rs.rows.length !== 0) {
          for (let i = 0; i < rs.rows.length; i++) {
            const photo = rs.rows.item(i);
            nextState.photos = [...(nextState.photos || []), {
              id: photo.id,
              content: photo.content,
              createdAt: photo.createdAt
            }];
          }
        }
        this.setState(nextState);
      };
      const onSqlError = (tx, error) => {
        console.error('[SQLException] Fail to load notes:', error.message);
        this.setState({error});
      };

      tx.executeSql(
        query,
        parameters,
        onSqlSuccess,
        onSqlError
      );
    }, onTransactionError);
  }

  handleChanges(event) {
    this.setState({note: event.target.value, saveDisabled: false});
  }

  toggleMenu(menu) {
    const stateName = `is${menu}Expanded`;
    this.setState({[stateName]: !this.state[stateName]});
  };

  saveNote() {
    if (!window.cordova) {
      localStorage.setItem(this.props.session.id, this.state.note);
      this.setState({saveDisabled: true});
      return;
    }

    const db = window.sqlitePlugin.openDatabase({name: 'conference.db', location: 'default'});

    const onTransactionError = (error) => {
      console.error('[TransactionException]: ', error.message);
    };

    db.transaction(tx => {
      const query = 'INSERT OR REPLACE INTO note (id, content) VALUES (?, ?)';
      const parameters = [this.props.session.id, this.state.note];

      const onSqlSuccess = (tx, rs) => {
        if (rs.rowsAffected !== 0) {
          this.setState({saveDisabled: true});
        } else {
          console.error('[NotModifiedException] Fail to save notes:', 'no record saved');
        }
      };
      const onSqlError = (tx, error) => {
        console.error('[SQLException]', error.message);
      };

      tx.executeSql(
        query,
        parameters,
        onSqlSuccess,
        onSqlError
      );
    }, onTransactionError);
  }

  addAPhoto() {
    this.getPicture({
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: Camera.MediaType.PICTURE,
      destinationType: Camera.DestinationType.DATA_URL,
      encodingType: Camera.EncodingType.PNG,
    });
  }

  takeAPhoto() {
    this.getPicture({
      sourceType: Camera.PictureSourceType.CAMERA,
      destinationType: Camera.DestinationType.DATA_URL,
      encodingType: Camera.EncodingType.PNG,
    });
  }

  getPicture(cameraOptions) {
    const onCameraError = (message) => {
      console.error('[PictureException] Fail to add a photo:', message);
    };

    navigator.camera.getPicture(this.savePhoto.bind(this), onCameraError, cameraOptions);
  }

  savePhoto(imageData) {
    const db = window.sqlitePlugin.openDatabase({name: 'conference.db', location: 'default'});

    const onTransactionError = (error) => {
      console.error('[TransactionException]: ', error.message);
    };

    db.transaction(tx => {
      const query = 'INSERT INTO photo (content) VALUES (?)';
      const parameters = [imageData];

      const onSqlSuccess = (tx, rs) => {
        if (rs.rowsAffected === 0) {
          console.error('[NotModifiedException] Fail to save photo:', 'no record saved');
          return;
        }

        const childQuery = 'INSERT INTO notePhoto (noteId, photoId) VALUES (?, ?)';
        const childParameters = [this.props.session.id, rs.insertId];

        const onChildSqlSuccess = (tx, childRs) => {
          if (childRs.rowsAffected === 0) {
            console.error('[NotModifiedException] Fail to save photo:', 'no record saved');
            return;
          }

          const finalChildQuery = `SELECT id, content, datetime(createdAt, 'localtime') AS createdAt FROM photo WHERE id = ?`;
          const finalChildParameters = [rs.insertId];

          const onFinalChildSqlSuccess = (tx, finalChildRs) => {
            if (finalChildRs.rows.length === 0) {
              console.error('[NotModifiedException] Fail to select last photo');
              return;
            }

            const photo = finalChildRs.rows.item(0);

            const {photos} = this.state;
            this.setState({photos: [...photos, {id: photo.id, content: photo.content, createdAt: photo.createdAt}]});
          };
          const onChildSqlError = (tx, error) => {
            console.error('[ChildSQLException]', error.message);
          };

          tx.executeSql(
            finalChildQuery,
            finalChildParameters,
            onFinalChildSqlSuccess,
            onChildSqlError
          );
        };
        const onChildSqlError = (tx, error) => {
          console.error('[ChildSQLException]', error.message);
        };

        tx.executeSql(
          childQuery,
          childParameters,
          onChildSqlSuccess,
          onChildSqlError
        );
      };
      const onSqlError = (tx, error) => {
        console.error('[SQLException]', error.message);
      };

      tx.executeSql(
        query,
        parameters,
        onSqlSuccess,
        onSqlError
      );
    }, onTransactionError);
  }

  handlePhotoItem(stateKey, itemId) {
    this.handleItem("Que faire de la photo ?",stateKey, itemId);
  }

  handleItem(title, stateKey, itemId) {
    console.warn('handleItem', stateKey, itemId);

    const options = {
      androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
      title: title,
      buttonLabels: [
        'Partager',
      ],
      androidEnableCancelButton: true,
      winphoneEnableCancelButton: true,
      addCancelButtonWithLabel: 'Annuler',
      addDestructiveButtonWithLabel: 'Supprimer',
      destructiveButtonLast: true
    };

    const callback = (buttonIndex) => {
      setTimeout(() => {
        // like other Cordova plugins (prompt, confirm) the buttonIndex is 1-based (first button is index 1)
        alert('button index clicked: ' + buttonIndex);
      });
    };

    window.plugins.actionsheet.show(options, callback);
  }

  render() {
    const {classes, session} = this.props;
    const {isLoading, error} = this.state;
    const {note, saveDisabled} = this.state;
    const {photos} = this.state;

    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return <p>Chargement des notes...</p>;
    }

    return (
      <div>
        <Card className={classes.card}>
          <CardContent>
            <Typography type="headline" component="h2">
              {session.title}
            </Typography>
          </CardContent>
        </Card>
        {window.cordova && (
          <div>
            <Card className={classes.card}>
              <CardContent>
                <IconButton
                  color="accent"
                  onClick={this.takeAPhoto.bind(this)}>
                  <AddAPhoto />
                </IconButton>
                <IconButton
                  color="accent"
                  onClick={this.addAPhoto.bind(this)}>
                  <Photo />
                </IconButton>
              </CardContent>
            </Card>
          </div>
        )}
        <Card className={classes.card}>
          <CardContent>
            <Typography type="subheading" component="h3" className={classes.cardMenu}>
              Note
              <IconButton
                className={this.state.isNoteExpanded ? classes.expandOpen : classes.expand}
                onClick={this.toggleMenu.bind(this, 'Note')}
                aria-expanded={this.state.isNoteExpanded}
                aria-label="Show more"
              >
                <ExpandMoreIcon />
              </IconButton>
            </Typography>
            <Collapse in={this.state.isNoteExpanded} transitionDuration="auto">
              <TextField
                className={classes.input}
                multiline={true}
                margin="normal"
                placeholder="Saisir une note"
                value={note}
                onChange={this.handleChanges.bind(this)}
              />
              <Button
                raised
                disabled={saveDisabled}
                color="accent"
                className={classes.button}
                onClick={this.saveNote.bind(this)}>
                Sauvegarder
              </Button>
            </Collapse>
          </CardContent>
        </Card>
        {window.cordova && photos.length > 0 && (
          <Card className={classes.card}>
            <CardContent>
              <Typography type="subheading" component="h3" className={classes.cardMenu}>
                Photos
                <IconButton
                  className={this.state.isPhotosExpanded ? classes.expandOpen : classes.expand}
                  onClick={this.toggleMenu.bind(this, 'Photos')}
                  aria-expanded={this.state.isPhotosExpanded}
                  aria-label="Show more"
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Typography>
              <Collapse in={this.state.isPhotosExpanded} transitionDuration="auto">
                <List>
                  {photos.map((photo, index) => (
                    <ListItem
                      key={photo.id}>
                      <figure className={classes.figure}>
                        <img className={classes.img} alt={`n°${index}`} src={`data:image/png;base64,${photo.content}`}
                             onClick={this.handlePhotoItem.bind(this, 'Photos', photo.id)}/>
                        <figcaption>Ajoutée le {photo.createdAt}</figcaption>
                      </figure>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

}

export default withStyles(styles)(SessionNote);
