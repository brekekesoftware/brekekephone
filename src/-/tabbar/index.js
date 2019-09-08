import { observer } from 'mobx-react';
import React from 'react';

import authStore from '../../shared/authStore';
import callStore from '../../shared/callStore';
import routerStore from '../../shared/routerStore';
import FooterTabs from '../components-Home/FooterTabs';

@observer
class View extends React.Component {
  render() {
    return (
      <FooterTabs
        chatsEnabled={authStore.profile?.ucEnabled}
        pressCallsManage={routerStore.goToCallsManage}
        pressCallsRecent={routerStore.goToCallsRecent}
        pressCallsCreate={routerStore.goToCallsCreate}
        pressSettings={routerStore.goToSettings}
        pressUsers={routerStore.goToUsersBrowse}
        pressChats={routerStore.goToChatsRecent}
        pressBooks={routerStore.goToPhonebooksBrowse}
        runningIds={callStore.runnings.map(c => c.id)}
      />
    );
  }
}

export default View;
