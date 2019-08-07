import { observer } from 'mobx-react';
import React from 'react';
import { createModelView } from 'redux-model';

import FooterTabs from '../../components-Home/FooterTabs';
import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';

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
