import { mdiPhoneHangup } from '@mdi/js';
import React from 'react';

import { TouchableOpacity } from '../-/Rn';
import UserItem from '../-contact/UserItem';
import callStore from '../global/callStore';
import intl from '../intl/intl';
import Layout from '../shared/Layout';

const renderBackgroundCalls = () => (
  <Layout
    compact
    onBack={callStore.toggleViewBackgroundCalls}
    title={intl`Background Calls`}
  >
    {callStore.backgroundCalls.map(c => (
      <TouchableOpacity
        key={c.id}
        onPress={() => callStore.selectBackgroundCall(c)}
      >
        <UserItem
          iconFuncs={[c.hangupWithUnhold]}
          icons={[mdiPhoneHangup]}
          key={c.id}
          {...c}
        />
      </TouchableOpacity>
    ))}
  </Layout>
);

export default renderBackgroundCalls;
