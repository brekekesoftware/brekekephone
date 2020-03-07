import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import uc from '../api/uc';
import g from '../global';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import intl from '../intl/intl';
import Notify from './Notify';

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
      message: intl`Failed to reject the group chat`,
      err,
    });
  };
  accept = group => {
    uc.joinChatGroup(group).catch(this.onAcceptFailure);
  };
  onAcceptFailure = err => {
    g.showError({
      message: intl`Failed to accept the group chat`,
      err,
    });
  };
}

export default ChatGroupInvite;
