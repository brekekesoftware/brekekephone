import { createModel } from '@thenewvu/redux-model';
import immutable from '@thenewvu/immutable';
import pickProps from 'lodash.pick';

const allowedToCreateProps = [
  'id',
  'name',
  'size',
  'incoming',
  'transferPercent',
  'transferWaiting',
  'transferStarted',
  'transferSuccess',
  'transferStopped',
  'transferFailure',
];
const allowedToUpdateProps = [
  'transferPercent',
  'transferWaiting',
  'transferStarted',
  'transferSuccess',
  'transferStopped',
  'transferFailure',
];
const validateCreatingFile = file => pickProps(file, allowedToCreateProps);
const validateUpdatingFile = file => pickProps(file, allowedToUpdateProps);

export default createModel({
  prefix: 'chatFiles',
  origin: {
    byId: {},
  },
  getter: {
    byId: (state, id) => (id ? state.byId[id] : state.byId),
  },
  action: {
    create: (prevState, file) =>
      immutable.on(prevState)(
        immutable.vset(`byId.${file.id}`, validateCreatingFile(file)),
      ),
    update: (prevState, file) =>
      immutable.on(prevState)(
        immutable.fset(`byId.${file.id}`, old => ({
          ...old,
          ...validateUpdatingFile(file),
        })),
      ),
    remove: (prevState, id) =>
      immutable.on(prevState)(
        immutable.fset('byId', ({ [id]: removed, ...rest }) => rest),
      ),
  },
});
