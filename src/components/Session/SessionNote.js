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
import {loadNote, loadMedia, saveNote} from "./helpers";
import ItemType from "./helpers/ItemType";

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
    margin: 0,
  },
  itemWrapper: {
    padding: 0,
    width: '100%',
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
    photos: [],
    records: [],
    videos: [],
    isNoteExpanded: true,
    isPhotosExpanded: true,
    isRecordsExpanded: true,
    isVideosExpanded: true,
  };

  componentWillMount() {
    const {session} = this.props;

    if (!window.cordova) {
      const note = localStorage.getItem(session.id) || '';

      this.setState({note, isLoading: false});

      return;
    }

    const loadMedias = [
      ItemType.PHOTO,
      ItemType.RECORD,
      ItemType.VIDEO,
    ].map(itemType => loadMedia(session, itemType));

    loadNote(session.id)
      .then(resultSet => this.handleNoteData(resultSet))
      .then(() => Promise.all(loadMedias))
      .then(data => this.handleMediasTypeData(data))
      .then(() => this.setState({isLoading: false}))
      .catch(error => {
        console.error('[SQLException] Fail to load note data:', error);
        this.setState({error});
      });
  }

  handleNoteData(content) {
    this.setState({note: content});
  }

  handleMediasTypeData(data) {
    const nextState = {};

    data.forEach(({itemType, resultSet}) => {
      if (resultSet.rows.length !== 0) {
        const {stateKey} = itemType;

        for (let i = 0; i < resultSet.rows.length; i++) {
          const item = resultSet.rows.item(i);

          nextState[stateKey] = [...(nextState[stateKey] || []), {
            id: item.id,
            content: item.content,
            createdAt: item.createdAt
          }];
        }
      }
    });

    this.setState(nextState);
  }

  handleChanges = (event) => {
    this.setState({note: event.target.value, saveDisabled: false});
  };

  toggleMenu = (itemType) => {
    this.setState({[itemType.stateMenuKey]: !this.state[itemType.stateMenuKey]});
  };

  handleSaveNote = () => {
    if (!window.cordova) {
      localStorage.setItem(this.props.session.id, this.state.note);
      this.setState({saveDisabled: true});

      return;
    }

    saveNote(this.props.session, this.state.note)
      .then(resultSet => {
        if (resultSet.rowsAffected === 0) {
          console.error('[NotModifiedException] Fail to save notes:', 'no record saved');
        }

        this.setState({saveDisabled: true});
      })
      .catch(error => {
        console.error('[SQLException]', error.message);
      });
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

    navigator.camera.getPicture((imageData) => this.saveItem(ItemType.PHOTO, imageData), onCameraError, cameraOptions);
  };

  saveItem = (itemType, itemContent) => {
    const db = window.sqlitePlugin.openDatabase({name: 'conference.db', location: 'default'});

    const {stateKey, dbEntity, dbJoinEntity, dbJoinPrimaryKey} = itemType;

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

        const childQuery = `INSERT INTO ${dbJoinEntity} (noteId, ${dbJoinPrimaryKey}) VALUES (?, ?)`;
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

  deleteItem = (itemType, itemId) => {
    const db = window.sqlitePlugin.openDatabase({name: 'conference.db', location: 'default'});

    const {stateKey, dbEntity} = itemType;

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

  captureAudio = () => this.capture(ItemType.RECORD);

  captureVideo = () => this.capture(ItemType.VIDEO);

  capture = (itemType) => {
    const onCaptureSuccess = (mediaFiles) => {
      for (let i = 0, len = mediaFiles.length; i < len; i += 1) {
        const path = mediaFiles[i].fullPath;
        this.saveItem(itemType, path);
      }
    };

    const onCaptureError = (error) => {
      console.error('[CaptureExeption]', error);
    };

    switch (itemType) {
      case ItemType.RECORD:
        navigator.device.capture.captureAudio(onCaptureSuccess, onCaptureError, {limit: 1});
        break;
      case ItemType.VIDEO:
        navigator.device.capture.captureAudio(onCaptureSuccess, onCaptureError, {limit: 1});
        break;
      default:
    }
  };

  handlePhotoItem = (itemId) => {
    this.handleItem("Que faire de la photo ?", ItemType.PHOTO, itemId);
  };

  handleRecordItem = (itemId) => {
    this.handleItem("Que faire de l'enregistrement ?", ItemType.RECORD, itemId);
  };

  handleVideoItem = (itemId) => {
    this.handleItem("Que faire de la video ?", ItemType.VIDEO, itemId);
  };

  handleItem = (title, itemType, itemId) => {
    const {stateKey} = itemType;

    const actionSheetButtons = [];

    const ActionSheetButtonsIndex = {
      open: 1,
      share: 2,
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

    addButton(actionSheetButtons, ActionSheetButtonsIndex.open, 'Ouvrir');
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
      const item = this.state[stateKey].filter(item => item.id === itemId)[0];
      const file = (itemType === ItemType.PHOTO) ? `data:image/png;base64,${item.content}` : item.content;

      switch (buttonIndex) {
        case ActionSheetButtonsIndex.open:
          const onOpenError = code => {
            (code === 1) && console.error('[OpenException] No file handler found');
          };
          window.cordova.plugins.disusered.open(file, null, onOpenError);
          break;
        case ActionSheetButtonsIndex.share:
          const shareOptions = {
            files: [file],
          };

          const onShareSuccess = (result) => {
          };
          const onShareError = (msg) => {
            console.error("[ShareException]", msg);
          };

          window.plugins.socialsharing.shareWithOptions(shareOptions, onShareSuccess, onShareError);
          break;
        case ActionSheetButtonsIndex.delete:
          this.deleteItem(itemType, itemId);
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
                onClick={() => this.toggleMenu(ItemType.NOTE)}
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
                onChange={event => this.handleChanges(event)}
              />
              <Button
                raised
                disabled={saveDisabled}
                color="accent"
                className={classes.button}
                onClick={() => this.handleSaveNote()}>
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
                  onClick={() => this.toggleMenu(ItemType.PHOTO)}
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
                        <Button key={photo.id} className={classes.itemWrapper}
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
                  onClick={() => this.toggleMenu(ItemType.RECORD)}
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
                        <audio className={classes.itemWrapper} key={record.id}
                               onContextMenu={() => this.handleRecordItem(record.id)} controls>
                          <source src={record.content}/>
                        </audio>
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
                  onClick={() => this.toggleMenu(ItemType.VIDEO)}
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
                        <video className={classes.itemWrapper} key={video.id}
                               onContextMenu={() => this.handleVideoItem(video.id)} controls>
                          <source src={video.content}/>
                        </video>
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
