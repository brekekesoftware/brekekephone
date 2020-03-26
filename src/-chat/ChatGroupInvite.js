import { mdiCheck, mdiClose } from '@mdi/js';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import { StyleSheet, Text, View } from '../-/Rn';
import uc from '../api/uc';
import g from '../global';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
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

const Notify = observer(({ call: c, ...p }) => {
  return (
    <View style={css.Notify}>
      {p.type && (
        <React.Fragment>
          <View style={css.Notify_Info}>
            <Text bold>{p.name}</Text>
            <Text>{intl`Group chat invited by ${p.inviter}`}</Text>
          </View>
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
        </React.Fragment>
      )}
    </View>
  );
});

@observer
class ChatGroupInvite extends React.Component {
  @computed get GroupIds() {
    return chatStore.groups.filter(g => !g.jointed).map(g => g.id);
  }

  render() {
    return this.GroupIds.map(group => (
      <Notify
        key={group}
        {...this.formatGroup(group)}
        accept={this.accept}
        reject={this.reject}
        type="inviteChat"
      />
    ));
  }
  formatGroup = group => {
    const { id, inviter, name } = chatStore.getGroup(group) || {};
    const inviterName = contactStore.getUCUser(inviter)?.name;
    return {
      id: id,
      name,
      inviter: inviterName || inviter,
    };
  };
  // TODO: rejected but existed in chat home => error when click.
  reject = group => {
    uc.leaveChatGroup(group)
      .then(this.onRejectSuccess)
      .catch(this.onRejectFailure);
  };
  onRejectSuccess = res => {
    chatStore.removeGroup(res.id);
  };
  onRejectFailure = err => {
    g.showError({
      message: intl.debug`Failed to reject the group chat`,
      err,
    });
  };
  accept = group => {
    uc.joinChatGroup(group).catch(this.onAcceptFailure);
  };
  onAcceptFailure = err => {
    g.showError({
      message: intl.debug`Failed to accept the group chat`,
      err,
    });
  };
}

export default ChatGroupInvite;
