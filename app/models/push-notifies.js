import { createModel } from 'redux-model';
import immutable from 'immutable';

export default createModel({
  prefix: 'pushNotifies',
  origin: {
    notifDatas: [],
  },
  getter: {
    notifDatas: s => s.notifDatas,
  },
  action: {
    add: function(state, notifData) {
      const obj = immutable.on(state)(
        immutable.fset('notifDatas', datas => [...datas, notifData]),
      );
      return obj;
    },
    removeAt: function(state, index) {
      const a = state.notifDatas.slice(0, index);
      const b = state.notifDatas.slice(index + 1, state.length);
      const c = a.concat(b);

      return { notifDatas: c };
    },
    clear: () => ({
      notifDatas: [],
    }),
  },
});
