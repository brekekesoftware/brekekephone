import { createModel } from '@thenewvu/redux-model';
import immutable from '@thenewvu/immutable';
import pickProps from 'lodash.pick';

const allowedToCreateProps = [
  'profile',
  'id',
  'incoming',
  'answered',
  'partyName',
  'partyNumber',
  'created',
];
const validateCreatingCall = call => pickProps(call, allowedToCreateProps);

export default createModel({
  prefix: 'recentCalls',
  origin: {
    idsMapByProfile: {},
    detailMapById: {},
  },
  getter: {
    idsMapByProfile: state => state.idsMapByProfile,
    detailMapById: state => state.detailMapById,
  },
  action: {
    create: (prevState, call) =>
      immutable.on(prevState)(
        immutable.fset(`idsMapByProfile.${call.profile}`, (ids = []) => [
          call.id,
          ...ids,
        ]),
        immutable.vset(`detailMapById.${call.id}`, validateCreatingCall(call)),
      ),
    remove: (prevState, id) =>
      immutable.on(prevState)(
        immutable.fset(
          `idsMapByProfile.${prevState.detailMapById[id] &&
            prevState.detailMapById[id].profile}`,
          (ids = []) => ids.filter(_id => _id !== id),
        ),
        immutable.fset('detailMapById', ({ [id]: removed, ...rest }) => rest),
      ),
  },
});
