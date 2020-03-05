import { observable } from 'mobx';

import BaseStore from './BaseStore';

class DebugStore extends BaseStore {
  @observable captureDebugLog = false;

  saveDebugLog = () => {
    // TODO
  };
}

export default new DebugStore();
