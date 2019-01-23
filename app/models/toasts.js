import { createModel } from '@thenewvu/redux-model';
import immutable from '@thenewvu/immutable';
import pickProps from 'lodash.pick';

const allowedToCreateProps = ['id', 'message'];
const validateCreatingToast = toast => pickProps(toast, allowedToCreateProps);

export default createModel({
  prefix: 'toasts',
  origin: {
    idsByOrder: [],
    detailMapById: {},
  },
  getter: {
    idsByOrder: state => state.idsByOrder,
    detailMapById: state => state.detailMapById,
  },
  action: {
    create: (prevState, toast) =>
      immutable.on(prevState)(
        immutable.fset('idsByOrder', ids => [...ids, toast.id]),
        immutable.fset('detailMapById', map => ({
          ...map,
          [toast.id]: validateCreatingToast(toast),
        })),
      ),
    remove: (prevState, id) =>
      immutable.on(prevState)(
        immutable.fset('idsByOrder', ids => ids.filter(_id => _id !== id)),
        immutable.fset('detailMapById', ({ [id]: removed, ...rest }) => rest),
      ),
  },
});
