import { createModel } from '@thenewvu/redux-model';

export default createModel({
  prefix: 'usersBrowsing',
  origin: {
    searchText: '',
  },
  getter: {
    searchText: s => s.searchText,
  },
  action: {
    setSearchText: (s, searchText) => ({ searchText }),
  },
});
