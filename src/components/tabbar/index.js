import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

const mapGetter = getter => state => ({
  chatsEnabled: (getter.auth.profile(state) || {}).ucEnabled,
  runningIds: getter.runningCalls.idsByOrder(state),
});

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

export default createModelView(mapGetter)(View);
