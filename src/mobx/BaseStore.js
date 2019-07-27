import set from 'lodash/set';
import { runInAction } from 'mobx';

const mobxSet = (store, key, value) => {
  runInAction(() => {
    set(store, key, value);
  });
};

const closureMobxSet = (store, key) => value => {
  mobxSet(store, key, value);
};

class BaseStore {
  set = (key, value) => {
    mobxSet(this, key, value);
  };
}

export { mobxSet, closureMobxSet };
export default BaseStore;
