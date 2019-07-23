import { action } from 'mobx';

const mobxClosureSet = (store, key) =>
  action(value => {
    store[key] = value;
  });

export default mobxClosureSet;
