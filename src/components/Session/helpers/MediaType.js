const MediaType = {
  NOTE: {
    stateKey: 'note',
    stateMenuKey: 'isNoteExpanded',
    dbEntity: 'note',
  },
  PHOTO: {
    stateKey: 'photos',
    stateMenuKey: 'isPhotosExpanded',
    dbEntity: 'photo',
    dbJoinEntity: 'notePhoto',
    dbJoinPrimaryKey: 'photoId',
  },
  RECORD: {
    stateKey: 'records',
    stateMenuKey: 'isRecordsExpanded',
    dbEntity: 'record',
    dbJoinEntity: 'noteRecord',
    dbJoinPrimaryKey: 'recordId',
  },
  VIDEO: {
    stateKey: 'videos',
    stateMenuKey: 'isVideosExpanded',
    dbEntity: 'video',
    dbJoinEntity: 'noteVideo',
    dbJoinPrimaryKey: 'videoId',
  },
};

export default MediaType;
