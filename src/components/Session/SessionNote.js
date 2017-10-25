import React from 'react';
import {withStyles} from 'material-ui/styles';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Card, {CardContent} from 'material-ui/Card';
import List, {ListItem} from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import AddAPhoto from 'material-ui-icons/AddAPhoto';
import Photo from 'material-ui-icons/Photo';
import Mic from 'material-ui-icons/Mic';
import Videocam from 'material-ui-icons/Videocam';
import Camera from 'cordova-plugin-camera/www/CameraConstants';
import {loadNoteContent, saveNoteContent, loadMedia, saveMedia, deleteMedia} from './helpers';
import MediaType from './helpers/MediaType';

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
    content: '',
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
      const content = localStorage.getItem(session.id) || '';

      this.setState({content, isLoading: false});

      return;
    }

    const loadMedias = [
      MediaType.PHOTO,
      MediaType.RECORD,
      MediaType.VIDEO,
    ].map(mediaType => loadMedia(session.id, mediaType));

    loadNoteContent(session.id)
      .then(resultSet => this.onLoadNoteContent(resultSet))
      .then(() => Promise.all(loadMedias))
      .then(data => this.onLoadMedias(data))
      .then(() => this.setState({isLoading: false}))
      .catch(error => {
        console.error('[SQLException] Fail to load note data:', error);
        this.setState({error});
      });
  }

  onLoadNoteContent(content) {
    this.setState({content});
  }

  onLoadMedias(data) {
    const nextState = {};

    data.forEach(({mediaType, medias}) => {
      const {stateKey} = mediaType;

      for (let i = 0; i < medias.length; i++) {
        nextState[stateKey] = [...(nextState[stateKey] || []), medias[i]];
      }
    });

    this.setState(nextState);
  }

  handleNoteContentChanges = event => {
    this.setState({content: event.target.value, saveDisabled: false});
  };

  handleSaveNote = () => {
    if (!window.cordova) {
      localStorage.setItem(this.props.session.id, this.state.content);
      this.setState({saveDisabled: true});

      return;
    }

    saveNoteContent(this.props.session.id, this.state.content)
      .then(() => this.setState({saveDisabled: true}))
      .catch(error => {
        console.error('[SQLException]', error);
        // @todo toast error
      });
  };

  handleDeleteMedia = (mediaType, mediaId) => {
    const {stateKey} = mediaType;

    deleteMedia(mediaType, mediaId)
      .then(() => {
        const nextState = {[stateKey]: this.state[stateKey].filter(media => media.id !== mediaId)};

        this.setState(nextState);
      })
      .catch(error => {
        console.error('[SQLException] (', stateKey, '):', error);
        // @todo toast error
      });
  };

  handlePhotoMedia = mediaId => {
    this.handleMedia("Que faire de la photo ?", MediaType.PHOTO, mediaId);
  };

  handleRecordMedia = mediaId => {
    this.handleMedia("Que faire de l'enregistrement ?", MediaType.RECORD, mediaId);
  };

  handleVideoMedia = mediaId => {
    this.handleMedia("Que faire de la video ?", MediaType.VIDEO, mediaId);
  };

  handleMedia = (title, mediaType, mediaId) => {
    const {stateKey} = mediaType;

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
      title,
      buttonLabels: actionSheetButtons,
      androidEnableCancelButton: true,
      winphoneEnableCancelButton: true,
      addCancelButtonWithLabel: 'Annuler',
      addDestructiveButtonWithLabel: 'Supprimer',
      destructiveButtonLast: true,
    };

    const onContextMenuClick = index => {
      const media = this.state[stateKey].filter(item => item.id === mediaId)[0];
      const file = (mediaType === MediaType.PHOTO) ? `data:image/png;base64,${media.content}` : media.content;

      switch (index) {
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

          const onShareSuccess = (result) => {};
          const onShareError = (msg) => {
            console.error("[ShareException]", msg);
          };

          window.plugins.socialsharing.shareWithOptions(shareOptions, onShareSuccess, onShareError);
          break;
        case ActionSheetButtonsIndex.delete:
          this.handleDeleteMedia(mediaType, mediaId);
          break;
        default:
      }
    };

    window.plugins.actionsheet.show(actionSheetOptions, onContextMenuClick);
  };

  handleSaveMedia = (mediaType, content) => {
    const {stateKey} = mediaType;

    saveMedia(mediaType, this.props.session.id, content)
      .then(media => {
        const nextMedias = [...this.state[stateKey], media];

        this.setState({
          [stateKey]: nextMedias,
        });
      })
      .catch(error => {
        console.error('[SQLException]', error);
        // @todo toast error
      });
  };

  toggleMenu = mediaType => {
    this.setState({[mediaType.stateMenuKey]: !this.state[mediaType.stateMenuKey]});
  };

  addAPhoto = () => this.getPicture({
    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
    mediaType: Camera.MediaType.PICTURE,
    destinationType: Camera.DestinationType.DATA_URL,
    encodingType: Camera.EncodingType.PNG,
  });

  takeAPhoto = () => this.getPicture({
    sourceType: Camera.PictureSourceType.CAMERA,
    destinationType: Camera.DestinationType.DATA_URL,
    encodingType: Camera.EncodingType.PNG,
  });

  getPicture = options => {
    const onError = message => {
      console.error('[PictureException] Fail to add a photo:', message);
    };

    navigator.camera.getPicture(data => this.handleSaveMedia(MediaType.PHOTO, data), onError, options);
  };

  captureAudio = () => this.capture(MediaType.RECORD);

  captureVideo = () => this.capture(MediaType.VIDEO);

  capture = mediaType => {
    const onSuccess = medias => {
      for (let i = 0, len = medias.length; i < len; i += 1) {
        const path = medias[i].fullPath;
        this.handleSaveMedia(mediaType, path);
      }
    };

    const onError = error => {
      console.error('[CaptureExeption]', error);
    };

    switch (mediaType) {
      case MediaType.RECORD:
        navigator.device.capture.captureAudio(onSuccess, onError, {limit: 1});
        break;
      case MediaType.VIDEO:
        navigator.device.capture.captureVideo(onSuccess, onError, {limit: 1});
        break;
      default:
    }
  };

  renderNote() {
    const {classes} = this.props;
    const {content, isNoteExpanded, saveDisabled} = this.state;

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography type="subheading" component="h3" className={classes.cardMenu}>
            Note
            <IconButton
              className={isNoteExpanded ? classes.expandOpen : classes.expand}
              onClick={() => this.toggleMenu(MediaType.NOTE)}
              aria-expanded={isNoteExpanded}
              aria-label="Show more">
              <ExpandMoreIcon />
            </IconButton>
          </Typography>
          <Collapse in={isNoteExpanded} transitionDuration="auto">
            <TextField
              className={classes.input}
              multiline={true}
              margin="normal"
              placeholder="Saisir une note"
              value={content}
              onChange={event => this.handleNoteContentChanges(event)}
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
    )
  }

  renderPhotos() {
    const {classes} = this.props;
    const {photos, isPhotosExpanded} = this.state;

    return photos.length > 0 && (
      <Card className={classes.card}>
        <CardContent>
          <Typography type="subheading" component="h3" className={classes.cardMenu}>
            Photos
            <IconButton
              className={isPhotosExpanded ? classes.expandOpen : classes.expand}
              onClick={() => this.toggleMenu(MediaType.PHOTO)}
              aria-expanded={isPhotosExpanded}
              aria-label="Show more">
              <ExpandMoreIcon />
            </IconButton>
          </Typography>
          <Collapse in={isPhotosExpanded} transitionDuration="auto">
            <List>
              {photos.map((photo, index) => (
                <ListItem key={photo.id}>
                  <figure className={classes.figure}>
                    <Button className={classes.itemWrapper} onContextMenu={() => this.handlePhotoMedia(photo.id)}>
                      <img className={classes.img} alt={`n°${index + 1}`}
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
    )
  }

  renderRecords() {
    const {classes} = this.props;
    const {records, isRecordsExpanded} = this.state;

    return records.length > 0 && (
      <Card className={classes.card}>
        <CardContent>
          <Typography type="subheading" component="h3" className={classes.cardMenu}>
            Enregistrements
            <IconButton
              className={isRecordsExpanded ? classes.expandOpen : classes.expand}
              onClick={() => this.toggleMenu(MediaType.RECORD)}
              aria-expanded={isRecordsExpanded}
              aria-label="Show more">
              <ExpandMoreIcon />
            </IconButton>
          </Typography>
          <Collapse in={isRecordsExpanded} transitionDuration="auto">
            <List>
              {records.map(record => (
                <ListItem key={record.id}>
                  <figure className={classes.figure}>
                    <audio controls
                           className={classes.itemWrapper}
                           onContextMenu={() => this.handleRecordMedia(record.id)}>
                      <source src={record.content}/>
                    </audio>
                    <figcaption>Ajouté le {record.createdAt}</figcaption>
                  </figure>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </CardContent>
      </Card>
    )
  }

  renderVideos() {
    const {classes} = this.props;
    const {videos, isVideosExpanded} = this.state;

    return videos.length > 0 && (
      <Card className={classes.card}>
        <CardContent>
          <Typography type="subheading" component="h3" className={classes.cardMenu}>
            Vidéos
            <IconButton
              className={isVideosExpanded ? classes.expandOpen : classes.expand}
              onClick={() => this.toggleMenu(MediaType.VIDEO)}
              aria-expanded={isVideosExpanded}
              aria-label="Show more">
              <ExpandMoreIcon />
            </IconButton>
          </Typography>
          <Collapse in={isVideosExpanded} transitionDuration="auto">
            <List>
              {videos.map(video => (
                <ListItem key={video.id}>
                  <figure className={classes.figure}>
                    <video controls
                           className={classes.itemWrapper}
                           onContextMenu={() => this.handleVideoMedia(video.id)}>
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
    )
  }

  renderMenu() {
    const {classes} = this.props;

    return (
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
    )
  }

  render() {
    const {classes, session: {title}} = this.props;
    const {isLoading, error} = this.state;
    const {cordova} = window;

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
              {title}
            </Typography>
          </CardContent>
        </Card>
        {cordova && this.renderMenu()}
        {this.renderNote()}
        {cordova && this.renderPhotos()}
        {cordova && this.renderRecords()}
        {cordova && this.renderVideos()}
      </div>
    );
  }
}

export default withStyles(styles)(SessionNote);
