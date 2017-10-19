import {schema} from 'normalizr';
import {speakerSchema} from '../../Speaker/schema';

export const sessionSchema = new schema.Entity('sessions', {
  speakers: [speakerSchema],
});
