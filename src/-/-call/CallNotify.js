import { mdiCheck, mdiClose } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import callStore from '../global/callStore';
import intl from '../intl/intl';
import { StyleSheet, Text, View } from '../Rn';
import ButtonIcon from '../shared/ButtonIcon';

const css = StyleSheet.create({
  Notify: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: g.borderBg,
    backgroundColor: g.hoverBg,
  },
  Notify_Info: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 5,
  },
  Notify_Btn_reject: {
    borderColor: g.colors.danger,
  },
  Notify_Btn_accept: {
    borderColor: g.colors.primary,
  },
});

@observer
class CallNotify extends React.Component {
  render() {
    const c = callStore.incomingCall;
    if (!c) {
      return null;
    }
    return (
      <View style={css.Notify}>
        <View style={css.Notify_Info}>
          <Text bold>{c.partyName || c.partyNumber}</Text>
          <Text>
            {c.remoteVideoEnabled
              ? intl`Incoming video call`
              : intl`Incoming voice call`}
          </Text>
        </View>
        <ButtonIcon
          bdcolor={g.colors.danger}
          color={g.colors.danger}
          onPress={c.hangup}
          path={mdiClose}
          size={20}
          style={css.Notify_Btn_reject}
        />
        <ButtonIcon
          bdcolor={g.colors.primary}
          color={g.colors.primary}
          onPress={() => callStore.answerCall(c)}
          path={mdiCheck}
          size={20}
          style={css.Notify_Btn_accept}
        />
      </View>
    );
  }
}

export default CallNotify;
