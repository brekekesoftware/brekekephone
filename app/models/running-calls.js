import immutable from 'immutable';
import pickProps from 'lodash/pick';
import { createModel } from 'redux-model';

const allowedToCreateProps = [
  'id',
  'incoming',
  'partyName',
  'partyNumber',
  'localVideoEnabled',
  'remoteVideoStreamURL',
  'remoteVideoStreamObject',
  'createdAt',
];
const validateCreatingCall = call => pickProps(call, allowedToCreateProps);

const allowedToUpdateProps = [
  'incoming',
  'answered',
  'holding',
  'recording',
  'loudspeaker',
  'transfering',
  'partyName',
  'partyNumber',
  'pbxTenant',
  'pbxTalkerId',
  'voiceStreamObject',
  'localVideoEnabled',
  'remoteVideoStreamURL', //deprecated
  'remoteVideoStreamObject',
  'remoteVideoEnabled',
];
const validateUpdatingCall = call => pickProps(call, allowedToUpdateProps);

export default createModel({
  prefix: 'runningCalls',
  origin: {
    idsByOrder: [],
    detailMapById: {},
  },
  getter: {
    idsByOrder: state => state.idsByOrder,
    detailMapById: state => state.detailMapById,
  },
  action: {
    create: function(state, call) {
      const obj = immutable.on(state)(
        immutable.fset('idsByOrder', ids => [...ids, call.id]),
        immutable.vset(`detailMapById.${call.id}`, validateCreatingCall(call)),
      );
      return obj;
    },
    update: function(state, call) {
      const obj = immutable.on(state)(
        immutable.fset(`detailMapById.${call.id}`, old => ({
          ...old,
          ...validateUpdatingCall(call),
        })),
      );
      return obj;
    },
    remove: function(state, id) {
      const obj = immutable.on(state)(
        immutable.fset('idsByOrder', ids => ids.filter(_id => _id !== id)),
        immutable.fset('detailMapById', ({ [id]: removed, ...rest }) => rest),
      );
      return obj;
    },
  },
});
