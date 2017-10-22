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
import Mic from "material-ui-icons/Mic";
import Videocam from "material-ui-icons/Videocam";
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
  contentButton: {
    padding: 0,
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
    records: [],
    isRecordsExpanded: true,
    videos: [],
    isVideosExpanded: true,
  };

  componentWillMount() {
    if (!window.cordova) {
      const note = localStorage.getItem(this.props.session.id) || '';
      this.setState({note, isLoading: false});
      return;
    }

    const onLoadingError = () => {

    };

    const onLoadingDone = () => {
      this.setState({isLoading: false});
    };

    this.loadNote()
      .catch(onLoadingError)
      .then(() => this.loadItems('photos', 'photo', 'notePhoto'))
      .catch(onLoadingError)
      .then(() => this.loadItems('records', 'record', 'noteRecord'))
      .catch(onLoadingError)
      .then(() => this.loadItems('videos', 'video', 'noteVideo'))
      .catch(onLoadingError)
      .then(onLoadingDone);
  }

  loadNote = () => new Promise((resolve, reject) => {
    const db = window.sqlitePlugin.openDatabase({name: 'conference.db', location: 'default'});

    const onTransactionError = (error) => {
      console.error('[TransactionException]: ', error.message);
      reject();
    };

    db.transaction(tx => {
      const query = 'SELECT content FROM note WHERE id = ?';
      const parameters = [this.props.session.id];

      const onSqlSuccess = (tx, rs) => {
        const nextState = {};
        if (rs.rows.length !== 0) {
          nextState.note = rs.rows.item(0).content;
          this.setState(nextState);
        }
        resolve();
      };
      const onSqlError = (tx, error) => {
        console.error('[SQLException] Fail to load notes:', error.message);
        reject();
      };

      tx.executeSql(
        query,
        parameters,
        onSqlSuccess,
        onSqlError
      );
    }, onTransactionError);
  });

  loadItems = (stateKey, dbEntity, dbJoinEntity) => new Promise((resolve, reject) => {
    const db = window.sqlitePlugin.openDatabase({name: 'conference.db', location: 'default'});

    const onTransactionError = (error) => {
      console.error('[TransactionException](', stateKey, '):', error.message);
      reject();
    };

    db.transaction(tx => {
      const query = `
        SELECT ${dbEntity}.id, ${dbEntity}.content, datetime(${dbEntity}.createdAt, 'localtime') AS createdAt 
        FROM ${dbEntity} INNER JOIN ${dbJoinEntity} on ${dbJoinEntity}.${dbEntity}Id = ${dbEntity}.id 
        WHERE noteId = ?
      `;
      const parameters = [this.props.session.id];

      const onSqlSuccess = (tx, rs) => {
        const nextState = {};
        if (rs.rows.length !== 0) {
          for (let i = 0; i < rs.rows.length; i++) {
            const item = rs.rows.item(i);
            nextState[stateKey] = [...(nextState[stateKey] || []), {
              id: item.id,
              content: item.content,
              createdAt: item.createdAt
            }];
          }
          this.setState(nextState);
        }
        resolve();
      };
      const onSqlError = (tx, error) => {
        console.error(`[SQLException] Fail to load ${stateKey}:`, error.message);
        reject();
      };

      tx.executeSql(
        query,
        parameters,
        onSqlSuccess,
        onSqlError
      );
    }, onTransactionError);
  });

  handleChanges = (event) => {
    this.setState({note: event.target.value, saveDisabled: false});
  };

  toggleMenu = (menu) => {
    const stateName = `is${menu}Expanded`;
    this.setState({[stateName]: !this.state[stateName]});
  };

  saveNote = () => {
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
  };

  addAPhoto = () => {
    this.getPicture({
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: Camera.MediaType.PICTURE,
      destinationType: Camera.DestinationType.DATA_URL,
      encodingType: Camera.EncodingType.PNG,
    });
  };

  takeAPhoto = () => {
    this.getPicture({
      sourceType: Camera.PictureSourceType.CAMERA,
      destinationType: Camera.DestinationType.DATA_URL,
      encodingType: Camera.EncodingType.PNG,
    });
  };

  getPicture = (cameraOptions) => {
    const onCameraError = (message) => {
      console.error('[PictureException] Fail to add a photo:', message);
    };

    navigator.camera.getPicture((imageData) => this.saveItem('photos', 'photo', 'notePhoto', imageData), onCameraError, cameraOptions);
  };

  saveItem = (stateKey, dbEntity, dbJoinEntity, itemContent) => {
    const db = window.sqlitePlugin.openDatabase({name: 'conference.db', location: 'default'});

    const onTransactionError = (error) => {
      console.error('[TransactionException] (', stateKey, '):', error.message);
    };

    db.transaction(tx => {
      const query = `INSERT INTO ${dbEntity} (content) VALUES (?)`;
      const parameters = [itemContent];

      const onSqlSuccess = (tx, rs) => {
        if (rs.rowsAffected === 0) {
          console.error('[NotModifiedException] Fail to save', stateKey);
          return;
        }

        const childQuery = `INSERT INTO ${dbJoinEntity} (noteId, ${dbEntity}Id) VALUES (?, ?)`;
        const childParameters = [this.props.session.id, rs.insertId];

        const onChildSqlSuccess = (tx, childRs) => {
          if (childRs.rowsAffected === 0) {
            console.error('[NotModifiedException] Fail to save', stateKey);
            return;
          }

          const finalChildQuery = `SELECT id, content, datetime(createdAt, 'localtime') AS createdAt FROM ${dbEntity} WHERE id = ?`;
          const finalChildParameters = [rs.insertId];

          const onFinalChildSqlSuccess = (tx, finalChildRs) => {
            if (finalChildRs.rows.length === 0) {
              console.error('[NotModifiedException] Fail to select last', stateKey);
              return;
            }

            const item = finalChildRs.rows.item(0);
            this.setState({
              [stateKey]: [...this.state[stateKey], {
                id: item.id,
                content: item.content,
                createdAt: item.createdAt,
              }]
            });
          };
          const onFinalChildSqlError = (tx, error) => {
            console.error('[ChildSQLException] (', stateKey, '):', error.message);
          };

          tx.executeSql(
            finalChildQuery,
            finalChildParameters,
            onFinalChildSqlSuccess,
            onFinalChildSqlError
          );
        };
        const onChildSqlError = (tx, error) => {
          console.error('[ChildSQLException] (', stateKey, '):', error.message);
        };

        tx.executeSql(
          childQuery,
          childParameters,
          onChildSqlSuccess,
          onChildSqlError
        );
      };
      const onSqlError = (tx, error) => {
        console.error('[SQLException] (', stateKey, '):', error.message);
      };

      tx.executeSql(
        query,
        parameters,
        onSqlSuccess,
        onSqlError
      );
    }, onTransactionError);
  };

  deleteItem = (stateKey, dbEntity, itemId) => {
    const db = window.sqlitePlugin.openDatabase({name: 'conference.db', location: 'default'});

    const onTransactionError = (error) => {
      console.error('[TransactionException] (', stateKey, '):', error.message);
    };

    db.transaction(tx => {
      const query = `DELETE FROM ${dbEntity} WHERE id = (?)`;
      const parameters = [itemId];

      const onSqlSuccess = (tx, rs) => {
        if (rs.rowsAffected === 0) {
          console.error('[NotModifiedException] Fail to save', stateKey);
          return;
        }
        this.setState({[stateKey]: this.state[stateKey].filter(item => item.id !== itemId)});
      };
      const onSqlError = (tx, error) => {
        console.error('[SQLException] (', stateKey, '):', error.message);
      };

      tx.executeSql(
        query,
        parameters,
        onSqlSuccess,
        onSqlError
      );
    }, onTransactionError);
  };

  captureAudio = () => {

  };

  captureVideo = () => {

  };

  handlePhotoItem = (itemId) => {
    this.handleItem("Que faire de la photo ?", 'photos', 'photo', itemId);
  };

  handleRecordItem = (itemId) => {
    this.handleItem("Que faire de l'enregistrement ?", 'records', 'record', itemId);
  };

  handleVideoItem = (itemId) => {
    this.handleItem("Que faire de la video ?", 'videos', 'video', itemId);
  };

  handleItem = (title, stateKey, dbEntity, itemId) => {
    console.warn('handleItem', stateKey, itemId);

    const actionSheetButtons = [];

    const ActionSheetButtonsIndex = {
      share: 1,
      delete: -1,
      cancel: -1,
    };

    const addButton = (buttons, index, value) => {
      buttons[index - 1] = value;
    };

    const updateIndexEnum = (indexEnum, buttons) => {
      indexEnum.delete = buttons.length + 1;
      indexEnum.cancel = buttons.length + 2;
    };

    addButton(actionSheetButtons, ActionSheetButtonsIndex.share, 'Partager');
    updateIndexEnum(ActionSheetButtonsIndex, actionSheetButtons);

    const actionSheetOptions = {
      androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
      title: title,
      buttonLabels: actionSheetButtons,
      androidEnableCancelButton: true,
      winphoneEnableCancelButton: true,
      addCancelButtonWithLabel: 'Annuler',
      addDestructiveButtonWithLabel: 'Supprimer',
      destructiveButtonLast: true,
    };

    const callback = (buttonIndex) => {
      switch (buttonIndex) {
        case ActionSheetButtonsIndex.share:
          const item = this.state[stateKey].filter(item => item.id === itemId)[0];
          const shareOptions = {
            files: [`data:image/png;base64,${item.content}`],
          };

          const onShareSuccess = (result) => {
          };
          const onShareError = (msg) => {
            console.error("[ShareException]", msg);
          };

          window.plugins.socialsharing.shareWithOptions(shareOptions, onShareSuccess, onShareError);
          break;
        case ActionSheetButtonsIndex.delete:
          this.deleteItem(stateKey, dbEntity, itemId);
          break;
        default:
      }
    };

    window.plugins.actionsheet.show(actionSheetOptions, callback);
  };

  render() {
    const {classes, session} = this.props;
    const {isLoading, error} = this.state;
    const {note, saveDisabled} = this.state;
    const {photos, records, videos} = this.state;

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
                  onClick={() => this.takeAPhoto()}>
                  <AddAPhoto />
                </IconButton>
                <IconButton
                  color="accent"
                  onClick={() => this.addAPhoto()}>
                  <Photo />
                </IconButton>
                <IconButton
                  color="accent"
                  onClick={() => this.captureAudio()}>
                  <Mic />
                </IconButton>
                <IconButton
                  color="accent"
                  onClick={() => this.captureVideo()}>
                  <Videocam />
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
                onClick={() => this.toggleMenu('Note')}
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
                onChange={() => this.handleChanges()}
              />
              <Button
                raised
                disabled={saveDisabled}
                color="accent"
                className={classes.button}
                onClick={() => this.saveNote()}>
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
                  onClick={() => this.toggleMenu('Photos')}
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
                        <Button key={photo.id} className={classes.contentButton}
                                onContextMenu={() => this.handlePhotoItem(photo.id)}>
                          <img className={classes.img} alt={`n°${index}`}
                               src={`data:image/png;base64,${photo.content}`}/>
                        </Button>
                        <figcaption>Ajoutée le {photo.createdAt}</figcaption>
                      </figure>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </CardContent>
          </Card>
        )}
        {window.cordova && records.length > 0 && (
          <Card className={classes.card}>
            <CardContent>
              <Typography type="subheading" component="h3" className={classes.cardMenu}>
                Enregistrements
                <IconButton
                  className={this.state.isRecordsExpanded ? classes.expandOpen : classes.expand}
                  onClick={() => this.toggleMenu('Records')}
                  aria-expanded={this.state.isRecordsExpanded}
                  aria-label="Show more"
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Typography>
              <Collapse in={this.state.isRecordsExpanded} transitionDuration="auto">
                <List>
                  {records.map((record, index) => (
                    <ListItem
                      key={record.id}>
                      <figure className={classes.figure}>
                        <Button key={record.id} className={classes.contentButton}
                                onContextMenu={() => this.handleRecordItem(record.id)}>
                          <div>{record.content}</div>
                        </Button>
                        <figcaption>Ajoutée le {record.createdAt}</figcaption>
                      </figure>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </CardContent>
          </Card>
        )}
        {window.cordova && videos.length > 0 && (
          <Card className={classes.card}>
            <CardContent>
              <Typography type="subheading" component="h3" className={classes.cardMenu}>
                Vidéos
                <IconButton
                  className={this.state.isVideosExpanded ? classes.expandOpen : classes.expand}
                  onClick={() => this.toggleMenu('Videos')}
                  aria-expanded={this.state.isVideosExpanded}
                  aria-label="Show more"
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Typography>
              <Collapse in={this.state.isVideosExpanded} transitionDuration="auto">
                <List>
                  {videos.map((video, index) => (
                    <ListItem
                      key={video.id}>
                      <figure className={classes.figure}>
                        <Button key={video.id} className={classes.contentButton}
                                onContextMenu={() => this.handleVideoItem(video.id)}>
                          <div>{video.content}</div>
                        </Button>
                        <figcaption>Ajoutée le {video.createdAt}</figcaption>
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
