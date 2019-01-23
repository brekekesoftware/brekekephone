import { createModel } from '@thenewvu/redux-model';
import immutable from '@thenewvu/immutable';
import pickProps from 'lodash.pick';

const allowedToCreateProps = [
  'id',
  'name',
  'avatar',
  'offline',
  'online',
  'idle',
  'busy',
  'mood',
];
const validateCreatingUser = user => pickProps(user, allowedToCreateProps);

const allowedToUpdateProps = [
  'name',
  'avatar',
  'offline',
  'online',
  'idle',
  'busy',
  'mood',
];
const validateUpdatingUser = user => pickProps(user, allowedToUpdateProps);

const reduceUsersToMapById = users =>
  users.reduce((res, cur) => ({ ...res, [cur.id]: cur }), {});
const mapUsersToIds = users => users.map(({ id }) => id);

export default createModel({
  prefix: 'ucUsers',
  origin: {
    idsByOrder: [],
    detailMapById: {},
  },
  getter: {
    idsByOrder: state => state.idsByOrder,
    detailMapById: state => state.detailMapById,
  },
  action: {
    refill: (prevState, users) => ({
      idsByOrder: mapUsersToIds(users),
      detailMapById: reduceUsersToMapById(users.map(validateCreatingUser)),
    }),
    update: (prevState, user) =>
      immutable.on(prevState)(
        immutable.fset(`detailMapById.${user.id}`, old => ({
          ...old,
          ...validateUpdatingUser(user),
        })),
      ),
  },
});
