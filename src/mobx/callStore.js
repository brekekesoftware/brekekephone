import { observable } from 'mobx';

import BaseStore from './BaseStore';

class CallStore extends BaseStore {
  @observable selectedId = '';
}

export default new CallStore();
