import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

@observer
@createModelView(
  getter => state => ({
    chatsEnabled: (authStore.profile || {}).ucEnabled,
    runningIds: getter.runningCalls.idsByOrder(state),
  }),
  action => emit => ({}),
)
@observer
class View extends Component {
  render = () => (
    <UI
      chatsEnabled={this.props.chatsEnabled}
      pressCallsManage={routerUtils.goToCallsManage}
      pressCallsCreate={routerUtils.goToCallsCreate}
      pressSettings={routerUtils.goToSettings}
      pressUsers={routerUtils.goToUsersBrowse}
      pressChats={routerUtils.goToChatsRecent}
      pressBooks={routerUtils.goToPhonebooksBrowse}
      runningIds={this.props.runningIds}
    />
  );
}

export default View;
