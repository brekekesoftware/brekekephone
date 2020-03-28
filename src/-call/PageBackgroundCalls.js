import { mdiPhoneHangup } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import { TouchableOpacity } from '../-/Rn';
import UserItem from '../-contact/UserItem';
import g from '../global';
import callStore from '../global/callStore';
import intl from '../intl/intl';
import Field from '../shared/Field';
import Layout from '../shared/Layout';
import formatDuration from '../utils/formatDuration';

const PageBackgroundCalls = observer(() => (
  <Layout
    compact
    onBack={g.backToPageCallManage}
    title={intl`Background Calls`}
  >
    <Field isGroup label={intl`CURRENT CALL`} />
    {[callStore.currentCall].map(c => (
      <TouchableOpacity key={c.id} onPress={g.backToPageCallManage}>
        <UserItem
          iconFuncs={[c.hangupWithUnhold]}
          icons={[mdiPhoneHangup]}
          key={c.id}
          lastMessage={
            !c.answered ? intl`Dialing...` : formatDuration(c.duration)
          }
          selected
          {...c}
        />
      </TouchableOpacity>
    ))}

    <Field hasMargin isGroup label={intl`BACKGROUND CALLS`} />
    {callStore.backgroundCalls.map(c => (
      <TouchableOpacity
        key={c.id}
        onPress={() => callStore.selectBackgroundCall(c)}
      >
        <UserItem
          iconFuncs={[c.hangupWithUnhold]}
          icons={[mdiPhoneHangup]}
          key={c.id}
          lastMessage={
            !c.answered
              ? intl`Dialing...`
              : c.transferring
              ? intl`Transferring`
              : intl`On Hold`
          }
          {...c}
        />
      </TouchableOpacity>
    ))}
  </Layout>
));

export default PageBackgroundCalls;
