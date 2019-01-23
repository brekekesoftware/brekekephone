import { createModel } from '@thenewvu/redux-model';
import immutable from '@thenewvu/immutable';
import pickProps from 'lodash.pick';

const allowedToCreateProps = ['id', 'name', 'inviter', 'jointed', 'members'];
const propDefault = { members: [] };
const validateCreatingGroup = group => ({
  ...propDefault,
  ...pickProps(group, allowedToCreateProps),
});

const allowedToUpdateProps = ['name', 'jointed', 'members'];
const validateUpdatingGroup = group => pickProps(group, allowedToUpdateProps);

const uniqArray = arr => Array.from(new Set(arr));

export default createModel({
  prefix: 'chatGroups',
  origin: {
    idsByOrder: [],
    detailMapById: {},
  },
  getter: {
    idsByOrder: state => state.idsByOrder,
    detailMapById: state => state.detailMapById,
  },
  action: {
    clearAll: () => ({ idsByOrder: [], detailMapById: {} }),
    create: (prevState, group) =>
      immutable.on(prevState)(
        immutable.fset('idsByOrder', idsByOrder =>
          uniqArray([group.id, ...idsByOrder]),
        ),
        immutable.vset(
          `detailMapById.${group.id}`,
          validateCreatingGroup(group),
        ),
      ),
    update: (prevState, group) =>
      immutable.on(prevState)(
        immutable.fset(`detailMapById.${group.id}`, old => ({
          ...old,
          ...validateUpdatingGroup(group),
        })),
      ),
    remove: (prevState, id) =>
      immutable.on(prevState)(
        immutable.fset('idsByOrder', idsByOrder =>
          idsByOrder.filter(_ => _ !== id),
        ),
        immutable.fset('detailMapById', ({ [id]: removed, ...rest }) => rest),
      ),
  },
});
