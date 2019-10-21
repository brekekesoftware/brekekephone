import {
  mdiArrowRight,
  mdiPhoneForward,
  mdiPhoneHangup,
  mdiPhoneOff,
} from '@mdi/js';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import callStore from '../-/callStore';
import contactStore from '../-/contactStore';
import g from '../global';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Avatar from '../shared/Avatar';
import Icon from '../shared/Icon';
import Layout from '../shared/Layout';

const s = StyleSheet.create({
  TransferAttend: {
    flexDirection: `row`,
  },
  TransferAttend__spaceAround: {
    justifyContent: `space-around`,
  },
  TransferAttend_Spacing: {
    flex: 1,
    maxHeight: `40%`,
  },
  TransferAttend_Info: {
    position: `absolute`,
    alignItems: `center`,
  },
  TransferAttend_InfoFrom: {
    left: 20,
    top: 30,
  },
  TransferAttend_InfoTo: {
    right: 20,
    top: 30,
  },
  TransferAttend_InfoArr: {
    marginLeft: `auto`,
    marginRight: `auto`,
    top: 60,
  },

  TransferAttend_BtnOuter: {
    flexDirection: `column`,
    alignItems: `center`,
  },
  TransferAttend_Txt__pdt20: {
    paddingTop: 20,
  },
  TransferAttend_Txt__pdt10: {
    paddingTop: 10,
  },
  TransferAttend_Btn: {
    borderWidth: 1,
    borderRadius: 25,
    padding: 5,
    width: 50,
    height: 50,
  },
});

@observer
class TransferAttend extends React.Component {
  @computed get call() {
    return callStore.getRunningCall(this.props.match.params.call);
  }
  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  render() {
    const usersource = this.resolveMatch(this.call?.partyNumber);
    const usertarget = this.resolveMatch(this.call?.transfering);
    return (
      <Layout
        header={{
          onBackBtnPress: g.goToCallsManage,
          title: `Attended Transfer`,
        }}
      >
        <View style={s.TransferAttend}>
          <View style={[s.TransferAttend_Info, s.TransferAttend_InfoFrom]}>
            <Avatar source={{ uri: usersource?.avatar }} />
            <Text style={s.TransferAttend_Txt__pdt20}>From</Text>
            <Text>{this.call?.partyName}</Text>
          </View>
          <View style={s.TransferAttend_InfoArr}>
            <Icon path={mdiArrowRight} />
          </View>
          <View style={[s.TransferAttend_Info, s.TransferAttend_InfoTo]}>
            <Avatar source={{ uri: usertarget?.avatar }} />
            <Text style={s.TransferAttend_Txt__pdt20}>To</Text>
            <Text>{this.call?.transfering}</Text>
          </View>
        </View>
        <View style={s.TransferAttend_Spacing} />
        <View style={[s.TransferAttend, s.TransferAttend__spaceAround]}>
          <View style={s.TransferAttend_BtnOuter}>
            <TouchableOpacity
              style={[s.TransferAttend_Btn]}
              onPress={this.hangup}
            >
              <Icon path={mdiPhoneOff} />
            </TouchableOpacity>
            <Text style={s.TransferAttend_Txt__pdt10}>CANCEL</Text>
            <Text>TRANSFER</Text>
          </View>
          <View style={s.TransferAttend_BtnOuter}>
            <TouchableOpacity
              style={[s.TransferAttend_Btn]}
              onPress={this.stop}
            >
              <Icon path={mdiPhoneHangup} />
            </TouchableOpacity>
            <Text style={s.TransferAttend_Txt__pdt10}>END CALL &</Text>
            <Text>COMPLETE TRANSFER</Text>
          </View>
          <View style={s.TransferAttend_BtnOuter}>
            <TouchableOpacity
              style={[s.TransferAttend_Btn]}
              onPress={this.join}
            >
              <Icon path={mdiPhoneForward} />
            </TouchableOpacity>
            <Text style={s.TransferAttend_Txt__pdt10}>CONFERENCE</Text>
          </View>
        </View>
      </Layout>
    );
  }

  resolveMatch = id => {
    const ucUser = contactStore.getUCUser(id) || {};

    return {
      avatar: ucUser.avatar,
      number: id,
    };
  };

  hangup = () => {
    const { sip } = this.context;

    sip.hangupSession(this.props.selectedId);
  };

  join = () => {
    const { pbx } = this.context;
    const call = callStore.getRunningCall(this.props.match.params.call);

    pbx
      .joinTalkerTransfer(call.pbxTenant, call.pbxTalkerId)
      .then(this.onJoinSuccess, this.onJoinFailure);
  };

  onJoinSuccess = () => {
    callStore.upsertRunning({
      id: this.props.match.params.call,
      transfering: false,
    });

    g.goToCallsManage();
  };

  onJoinFailure = err => {
    g.showError({ err, message: `join the transfer` });
  };

  stop = () => {
    const { pbx } = this.context;
    const call = callStore.getRunningCall(this.props.match.params.call);
    pbx
      .stopTalkerTransfer(call.pbxTenant, call.pbxTalkerId)
      .then(this.onStopSuccess, this.onStopFailure);
  };

  onStopSuccess = () => {
    callStore.upsertRunning({
      id: this.props.match.params.call,
      transfering: false,
    });

    g.goToCallsManage();
  };

  onStopFailure = err => {
    g.showError({ err, message: `stop the transfer` });
  };
}

export default TransferAttend;
