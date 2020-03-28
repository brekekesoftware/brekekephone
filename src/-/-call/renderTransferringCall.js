import {
  mdiArrowRight,
  mdiPhoneForward,
  mdiPhoneHangup,
  mdiPhoneOff,
} from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import callStore from '../global/callStore';
import contactStore from '../global/contactStore';
import intl from '../intl/intl';
import { Icon, StyleSheet, Text, TouchableOpacity, View } from '../Rn';
import Avatar from '../shared/Avatar';

const css = StyleSheet.create({
  Outer: {
    alignItems: 'center',
    backgroundColor: 'white',
  },
  Inner: {
    width: '100%',
    flexDirection: 'row',
    maxWidth: 320,
  },
  Inner__info: {
    maxWidth: 280,
    marginBottom: 100,
  },
  Info: {
    position: 'absolute',
    alignItems: 'center',
  },
  Info__from: {
    left: 20,
    top: 30,
  },
  Info__to: {
    right: 20,
    top: 30,
  },
  Arrow: {
    marginLeft: 'auto',
    marginRight: 'auto',
    top: 60,
  },

  BtnOuter: {
    width: `${100 / 3}%`,
    alignItems: 'center',
  },
  Btn: {
    borderRadius: 25,
    width: 50,
    height: 50,
  },
  Btn__stop: {
    backgroundColor: g.colors.warning,
  },
  Btn__hangup: {
    backgroundColor: g.colors.danger,
  },
  Btn__conference: {
    backgroundColor: g.colors.primary,
  },
  Space: {
    height: 10,
  },
});

@observer
class PageTransferAttend extends React.Component {
  resolveMatch = id => {
    const ucUser = contactStore.getUCUser(id) || {};
    return {
      avatar: ucUser.avatar,
      number: id,
    };
  };

  render() {
    const c = callStore.currentCall;
    if (!c) {
      return null;
    }
    const usersource = this.resolveMatch(c.partyNumber);
    const usertarget = this.resolveMatch(c.transferring);
    return (
      <View style={css.Outer}>
        <Text center subTitle>{intl`Transferring`}</Text>
        <View style={css.Space} />
        <View style={[css.Inner, css.Inner__info]}>
          <View style={[css.Info, css.Info__from]}>
            <Avatar source={{ uri: usersource?.avatar }} />
            <Text center singleLine small>
              {c.partyName}
            </Text>
          </View>
          <View style={css.Arrow}>
            <Icon path={mdiArrowRight} />
          </View>
          <View style={[css.Info, css.Info__to]}>
            <Avatar source={{ uri: usertarget?.avatar }} />
            <Text center singleLine small>
              {c.transferring}
            </Text>
          </View>
        </View>
        <View style={css.Space} />
        <View style={css.Inner}>
          <View style={css.BtnOuter}>
            <TouchableOpacity
              onPress={c.stopTransferring}
              style={[css.Btn, css.Btn__stop]}
            >
              <Icon path={mdiPhoneOff} />
            </TouchableOpacity>
            <Text center singleLine small>
              {intl`CANCEL`}
            </Text>
          </View>
          <View style={css.BtnOuter}>
            <TouchableOpacity
              onPress={c.hangup}
              style={[css.Btn, css.Btn__hangup]}
            >
              <Icon path={mdiPhoneHangup} />
            </TouchableOpacity>
            <Text center singleLine small>
              {intl`TRANSFER`}
            </Text>
          </View>
          <View style={css.BtnOuter}>
            <TouchableOpacity
              onPress={c.conferenceTransferring}
              style={[css.Btn, css.Btn__conference]}
            >
              <Icon path={mdiPhoneForward} />
            </TouchableOpacity>
            <Text center singleLine small>
              {intl`CONFERENCE`}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

export default PageTransferAttend;
