import { observer } from 'mobx-react';
import React from 'react';
import { createModelView } from 'redux-model';

import FooterTabs from '../../components-Home/FooterTabs';
import authStore from '../../mobx/authStore';
import routerStore from '../../mobx/routerStore';

@observer
@createModelView(
  getter => state => ({
    chatsEnabled: (authStore.profile || {}).ucEnabled,
    runningIds: getter.runningCalls.idsByOrder(state),
  }),
  action => emit => ({
    //
  }),
)
@observer
class View extends React.Component {
  render = () => (
    <FooterTabs
      chatsEnabled={this.props.chatsEnabled}
      pressCallsManage={routerStore.goToCallsManage}
      pressCallsRecent={routerStore.goToCallsRecent}
      pressCallsCreate={routerStore.goToCallsCreate}
      pressSettings={routerStore.goToSettings}
      pressUsers={routerStore.goToUsersBrowse}
      pressChats={routerStore.goToChatsRecent}
      pressBooks={routerStore.goToPhonebooksBrowse}
      runningIds={this.props.runningIds}
    />
  );
}

export default View;
