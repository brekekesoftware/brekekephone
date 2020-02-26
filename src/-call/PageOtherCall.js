import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from '../-/Rn';
import g from '../global';
import callStore from '../global/callStore';
import intl from '../intl/intl';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';

@observer
class PageOtherCall extends React.Fragment {
  @computed get runningIds() {
    return callStore.runnings.map(c => c.id);
  }
  @computed get runningById() {
    return arrToMap(callStore.runnings, `id`, c => c);
  }
  render() {
    const u = this.runningById[callStore.selectedId];
    return (
      <Layout
        compact
        noScroll
        onBack={g.backToPageCallManage}
        title={intl`OTHER CALL`}
      >
        <React.Fragment>
          <View>
            <TouchableOpacity onPress={g.PageCallManage}>
              <Text></Text>
            </TouchableOpacity>
          </View>
        </React.Fragment>
      </Layout>
    );
  }
}
export default PageOtherCall;
