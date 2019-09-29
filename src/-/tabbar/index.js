import { observer } from 'mobx-react';
import React from 'react';

import g from '../../global';
import authStore from '../authStore';
import callStore from '../callStore';
import FooterTabs from '../components-Home/FooterTabs';

@observer
class View extends React.Component {
  render() {
    return (
      <FooterTabs
        chatsEnabled={authStore.profile?.ucEnabled}
        pressCallsManage={g.goToCallsManage}
        pressCallsRecent={g.goToCallsRecent}
        pressCallsCreate={g.goToCallsCreate}
        pressSettings={g.goToPageProfileCurrent}
        pressUsers={g.goToUsersBrowse}
        pressChats={g.goToChatsRecent}
        pressBooks={g.goToPhonebooksBrowse}
        runningIds={callStore.runnings.map(c => c.id)}
      />
    );
  }
}

export default View;
