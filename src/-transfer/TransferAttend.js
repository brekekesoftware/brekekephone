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
          <View>
            <Avatar source={{ uri: usersource?.avatar }} />
            <Text>From</Text>
            <Text>{this.call?.partyName}</Text>
          </View>
          <View>
            <Icon path={mdiArrowRight} />
          </View>
          <View>
            <Avatar source={{ uri: usertarget?.avatar }} />
            <Text>To</Text>
            <Text>{this.call?.transfering}</Text>
          </View>
        </View>
        <View>
          <View>
            <TouchableOpacity onPress={this.hangup}>
              <Icon path={mdiPhoneOff} />
            </TouchableOpacity>
            <View>
              <Text>CANCEL</Text>
              <Text>TRANSFER</Text>
            </View>
          </View>
          <View>
            <TouchableOpacity onPress={this.stop}>
              <Icon path={mdiPhoneHangup} />
            </TouchableOpacity>
            <View>
              <Text>END CALL &</Text>
              <Text>COMPLETE TRANSFER</Text>
            </View>
          </View>
          <View>
            <TouchableOpacity onPress={this.join}>
              <Icon path={mdiPhoneForward} />
            </TouchableOpacity>
            <View>
              <Text>CONFERENCE</Text>
            </View>
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
