import { mdiPhone } from '@mdi/js';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import UserItem from '../-contact/UserItem';
import g from '../global';
import callStore from '../global/callStore';
import intl from '../intl/intl';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';

@observer
class PageOtherCall extends React.Component {
  @computed get runningIds() {
    return callStore.runnings.map(c => c.id);
  }
  @computed get runningById() {
    return arrToMap(callStore.runnings, `id`, c => c);
  }
  setSelectedId = id => {
    callStore.set(`selectedId`, id);
    g.backToPageCallManage();
  };
  render() {
    const u = callStore.runnings.map(c => {
      return this.runningById[c.id];
    });
    return (
      <Layout
        compact
        noScroll
        onBack={g.backToPageCallManage}
        title={intl`Other call`}
      >
        {u.map(call => (
          <UserItem
            iconFuncs={[() => this.setSelectedId(call?.id)]}
            icons={[mdiPhone]}
            key={call?.id}
            {...call}
          />
        ))}
      </Layout>
    );
  }
}

export default PageOtherCall;
