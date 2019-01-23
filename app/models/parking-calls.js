import { createModel } from '@thenewvu/redux-model';

export default createModel({
  prefix: 'parkingCalls',
  origin: [],
  getter: {
    idsByOrder: state => state,
  },
  action: {
    create: (state, id) => [...state, id],
    remove: (state, id) => state.filter(_ => _ !== id),
  },
});
