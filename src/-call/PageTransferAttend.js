import {
  mdiArrowRight,
  mdiPhoneForward,
  mdiPhoneHangup,
  mdiPhoneOff,
} from '@mdi/js';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import { Icon, StyleSheet, Text, TouchableOpacity, View } from '../-/Rn';
import pbx from '../api/pbx';
import sip from '../api/sip';
import g from '../global';
import callStore from '../global/callStore';
import contactStore from '../global/contactStore';
import intl from '../intl/intl';
import Avatar from '../shared/Avatar';
import Layout from '../shared/Layout';

const css = StyleSheet.create({
  Outer: {
    alignItems: `center`,
  },
  Inner: {
    width: `100%`,
    flexDirection: `row`,
    maxWidth: 320,
  },
  Inner__info: {
    maxWidth: 280,
    marginBottom: 100,
  },
  Info: {
    position: `absolute`,
    alignItems: `center`,
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
    marginLeft: `auto`,
    marginRight: `auto`,
    top: 60,
  },

  BtnOuter: {
    width: `${100 / 3}%`,
    alignItems: `center`,
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
});

@observer
class PageTransferAttend extends React.Component {
  @computed get call() {
    return callStore.getRunningCall(this.props.callId);
  }

  resolveMatch = id => {
    const ucUser = contactStore.getUCUser(id) || {};
    return {
      avatar: ucUser.avatar,
      number: id,
    };
  };

  stop = () => {
    pbx
      .stopTalkerTransfer(this.call.pbxTenant, this.call.pbxTalkerId)
      .then(() => {
        callStore.upsertRunning({
          id: this.props.callId,
          transfering: false,
        });
        g.backToPageCallManage();
      })
      .catch(err => {
        g.showError({ message: intl`Failed to stop the transfer`, err });
      });
  };
  hangup = () => {
    sip.hangupSession(this.props.callId);
  };
  conference = () => {
    pbx
      .joinTalkerTransfer(this.call.pbxTenant, this.call.pbxTalkerId)
      .then(() => {
        callStore.upsertRunning({
          id: this.props.callId,
          transfering: false,
        });
        g.backToPageCallManage();
      })
      .catch(err => {
        g.showError({
          message: intl`Failed to make conference for the transfer`,
          err,
        });
      });
  };

  render() {
    const usersource = this.resolveMatch(this.call?.partyNumber);
    const usertarget = this.resolveMatch(this.call?.transfering);
    return (
      <Layout compact onBack={g.backToPageCallManage} title="Attended Transfer">
        <View style={css.Outer}>
          <View style={[css.Inner, css.Inner__info]}>
            <View style={[css.Info, css.Info__from]}>
              <Avatar source={{ uri: usersource?.avatar }} />
              <Text center singleLine small>
                {this.call?.partyName}
              </Text>
            </View>
            <View style={css.Arrow}>
              <Icon path={mdiArrowRight} />
            </View>
            <View style={[css.Info, css.Info__to]}>
              <Avatar source={{ uri: usertarget?.avatar }} />
              <Text center singleLine small>
                {this.call?.transfering}
              </Text>
            </View>
          </View>
          <View style={css.Inner}>
            <View style={css.BtnOuter}>
              <TouchableOpacity
                onPress={this.stop}
                style={[css.Btn, css.Btn__stop]}
              >
                <Icon path={mdiPhoneOff} />
              </TouchableOpacity>
              <Text center singleLine small>
                CANCEL
              </Text>
            </View>
            <View style={css.BtnOuter}>
              <TouchableOpacity
                onPress={this.hangup}
                style={[css.Btn, css.Btn__hangup]}
              >
                <Icon path={mdiPhoneHangup} />
              </TouchableOpacity>
              <Text center singleLine small>
                TRANSFER
              </Text>
            </View>
            <View style={css.BtnOuter}>
              <TouchableOpacity
                onPress={this.conference}
                style={[css.Btn, css.Btn__conference]}
              >
                <Icon path={mdiPhoneForward} />
              </TouchableOpacity>
              <Text center singleLine small>
                CONFERENCE
              </Text>
            </View>
          </View>
        </View>
      </Layout>
    );
  }
}

export default PageTransferAttend;
