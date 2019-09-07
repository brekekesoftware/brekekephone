import set from 'lodash/set';
import { runInAction } from 'mobx';

class BaseStore {
  set = (key, value) => {
    runInAction(() => {
      set(this, key, value);
    });
  };
  setFn = (...args) => value => {
    this.set(args[0], args.length < 2 ? value : args[1]);
  };
}

export default BaseStore;
