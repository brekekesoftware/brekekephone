import { createModel } from '@thenewvu/redux-model';
import immutable from '@thenewvu/immutable';
import pick from 'lodash.pick';

const allowedToCreateFields = [
  'id',
  'pbxHostname',
  'pbxPort',
  'pbxTenant',
  'pbxUsername',
  'pbxPassword',
  'parks',
  'ucEnabled',
  'ucHostname',
  'ucPort',
];
const validateCreatingData = data => pick(data, allowedToCreateFields);

const allowedToUpdateFields = [
  'pbxHostname',
  'pbxPort',
  'pbxTenant',
  'pbxUsername',
  'pbxPassword',
  'parks',
  'ucEnabled',
  'ucHostname',
  'ucPort',
];
const validateUpdatingData = data => pick(data, allowedToUpdateFields);

export default createModel({
  prefix: 'profiles',
  origin: {
    idsByOrder: [],
    detailMapById: {},
  },
  getter: {
    idsByOrder: state => state.idsByOrder,
    detailMapById: state => state.detailMapById,
  },
  action: {
    create: (prevState, profile) =>
      immutable.on(prevState)(
        immutable.fset('idsByOrder', ids => [...ids, profile.id]),
        immutable.vset(
          `detailMapById.${profile.id}`,
          validateCreatingData(profile),
        ),
      ),
    update: (prevState, profile) =>
      immutable.on(prevState)(
        immutable.fset(`detailMapById.${profile.id}`, old => ({
          ...old,
          ...validateUpdatingData(profile),
        })),
      ),
    remove: (prevState, id) =>
      immutable.on(prevState)(
        immutable.fset('idsByOrder', ids => ids.filter(_id => _id !== id)),
        immutable.fset('detailMapById', ({ [id]: removed, ...rest }) => rest),
      ),
  },
});
