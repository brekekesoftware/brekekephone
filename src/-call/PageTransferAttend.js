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

import g from '../global';
import callStore from '../global/callStore';
import contactStore from '../global/contactStore';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Avatar from '../shared/Avatar';
import Icon from '../shared/Icon';
import Layout from '../shared/Layout';

const s = StyleSheet.create({
  PageTransferAttend: {
    flexDirection: `row`,
  },
  PageTransferAttend__spaceAround: {
    justifyContent: `space-around`,
  },
  PageTransferAttend_Spacing: {
    flex: 1,
    maxHeight: `40%`,
  },
  PageTransferAttend_Info: {
    position: `absolute`,
    alignItems: `center`,
  },
  PageTransferAttend_InfoFrom: {
    left: 20,
    top: 30,
  },
  PageTransferAttend_InfoTo: {
    right: 20,
    top: 30,
  },
  PageTransferAttend_InfoArr: {
    marginLeft: `auto`,
    marginRight: `auto`,
    top: 60,
  },

  PageTransferAttend_BtnOuter: {
    flexDirection: `column`,
    alignItems: `center`,
  },
  PageTransferAttend_Txt__pdt20: {
    paddingTop: 20,
  },
  PageTransferAttend_Txt__pdt10: {
    paddingTop: 10,
  },
  PageTransferAttend_Btn: {
    borderWidth: 1,
    borderRadius: 25,
    padding: 5,
    width: 50,
    height: 50,
  },
});

@observer
class PageTransferAttend extends React.Component {
  @computed get call() {
    return callStore.getRunningCall(this.props.callId);
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
          onBackBtnPress: g.goToPageCallManage,
          title: `Attended Transfer`,
        }}
      >
        <View style={s.PageTransferAttend}>
          <View
            style={[s.PageTransferAttend_Info, s.PageTransferAttend_InfoFrom]}
          >
            <Avatar source={{ uri: usersource?.avatar }} />
            <Text style={s.PageTransferAttend_Txt__pdt20}>From</Text>
            <Text>{this.call?.partyName}</Text>
          </View>
          <View style={s.PageTransferAttend_InfoArr}>
            <Icon path={mdiArrowRight} />
          </View>
          <View
            style={[s.PageTransferAttend_Info, s.PageTransferAttend_InfoTo]}
          >
            <Avatar source={{ uri: usertarget?.avatar }} />
            <Text style={s.PageTransferAttend_Txt__pdt20}>To</Text>
            <Text>{this.call?.transfering}</Text>
          </View>
        </View>
        <View style={s.PageTransferAttend_Spacing} />
        <View style={[s.PageTransferAttend, s.PageTransferAttend__spaceAround]}>
          <View style={s.PageTransferAttend_BtnOuter}>
            <TouchableOpacity
              onPress={this.hangup}
              style={[s.PageTransferAttend_Btn]}
            >
              <Icon path={mdiPhoneOff} />
            </TouchableOpacity>
            <Text style={s.PageTransferAttend_Txt__pdt10}>CANCEL</Text>
            <Text>TRANSFER</Text>
          </View>
          <View style={s.PageTransferAttend_BtnOuter}>
            <TouchableOpacity
              onPress={this.stop}
              style={[s.PageTransferAttend_Btn]}
            >
              <Icon path={mdiPhoneHangup} />
            </TouchableOpacity>
            <Text style={s.PageTransferAttend_Txt__pdt10}>END CALL &</Text>
            <Text>COMPLETE TRANSFER</Text>
          </View>
          <View style={s.PageTransferAttend_BtnOuter}>
            <TouchableOpacity
              onPress={this.join}
              style={[s.PageTransferAttend_Btn]}
            >
              <Icon path={mdiPhoneForward} />
            </TouchableOpacity>
            <Text style={s.PageTransferAttend_Txt__pdt10}>CONFERENCE</Text>
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
    const call = callStore.getRunningCall(this.props.callId);

    pbx
      .joinTalkerTransfer(call.pbxTenant, call.pbxTalkerId)
      .then(this.onJoinSuccess)
      .catch(this.onJoinFailure);
  };

  onJoinSuccess = () => {
    callStore.upsertRunning({
      id: this.props.callId,
      transfering: false,
    });

    g.goToPageCallManage();
  };

  onJoinFailure = err => {
    g.showError({ err, message: `join the transfer` });
  };

  stop = () => {
    const { pbx } = this.context;
    const call = callStore.getRunningCall(this.props.callId);
    pbx
      .stopTalkerTransfer(call.pbxTenant, call.pbxTalkerId)
      .then(this.onStopSuccess)
      .catch(this.onStopFailure);
  };

  onStopSuccess = () => {
    callStore.upsertRunning({
      id: this.props.callId,
      transfering: false,
    });

    g.goToPageCallManage();
  };

  onStopFailure = err => {
    g.showError({ err, message: `stop the transfer` });
  };
}

export default PageTransferAttend;
