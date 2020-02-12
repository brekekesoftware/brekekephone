import { mdiCheck, mdiClose } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import { StyleSheet, Text, View } from '../-/Rn';
import g from '../global';
import intl from '../intl/intl';
import ButtonIcon from '../shared/ButtonIcon';

const css = StyleSheet.create({
  Notify: {
    flexDirection: `row`,
    alignItems: `center`,
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

const Notify = observer(p => {
  return (
    <View style={css.Notify}>
      {p.type === `call` && (
        <View style={css.Notify_Info}>
          <Text bold>{p.partyName || p.partyNumber}</Text>
          <Text>
            {p.remoteVideoEnabled
              ? intl`Incoming video call`
              : intl`Incoming voice call`}
          </Text>
        </View>
      )}
      {p.type === `inviteChat` && (
        <View style={css.Notify_Info}>
          <Text bold>{p.name}</Text>
          <Text>{intl`Group chat invited by ${p.inviter}`}</Text>
        </View>
      )}
      <ButtonIcon
        bdcolor={g.colors.danger}
        color={g.colors.danger}
        onPress={() => p.reject(p.id)}
        path={mdiClose}
        size={20}
        style={css.Notify_Btn_reject}
      />
      <ButtonIcon
        bdcolor={g.colors.primary}
        color={g.colors.primary}
        onPress={() => p.accept(p.id)}
        path={mdiCheck}
        size={20}
        style={css.Notify_Btn_accept}
      />
    </View>
  );
});

export default Notify;
