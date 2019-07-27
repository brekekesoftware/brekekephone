import { createModel } from 'redux-model';

export default createModel({
  prefix: 'callsManaging',

  origin: {
    selectedId: null,
  },

  getter: {
    selectedId: s => s.selectedId,
  },

  action: {
    setSelectedId: (s, selectedId) => ({
      selectedId,
    }),
  },
});
