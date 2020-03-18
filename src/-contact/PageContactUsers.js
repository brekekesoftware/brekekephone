import { mdiMagnify, mdiPhone, mdiVideo } from '@mdi/js';
import orderBy from 'lodash/orderBy';
import uniq from 'lodash/uniq';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import { TouchableOpacity } from '../-/Rn';
import pbx from '../api/pbx';
import sip from '../api/sip';
import g from '../global';
import authStore from '../global/authStore';
import callStore from '../global/callStore';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import intl from '../intl/intl';
import Field from '../shared/Field';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';
import UserItem from './UserItem';

@observer
class PageContactUsers extends React.Component {
  getMatchUserIds() {
    const userIds = uniq([
      ...contactStore.pbxUsers.map(u => u.id),
      ...contactStore.ucUsers.map(u => u.id),
    ]);
    return userIds.filter(this.isMatchUser);
  }
  resolveUser = id => {
    const pbxUser = contactStore.getPBXUser(id) || {};
    const ucUser = contactStore.getUCUser(id) || {};
    const u = {
      ...pbxUser,
      ...ucUser,
    };
    return u;
  };
  isMatchUser = id => {
    if (!id) {
      return false;
    }
    let userId = id;
    let pbxUserName;
    const pbxUser = contactStore.getPBXUser(id);
    if (pbxUser) {
      pbxUserName = pbxUser.name;
    } else {
      pbxUserName = ``;
    }
    let ucUserName;
    const ucUser = contactStore.getUCUser(id);
    if (ucUser) {
      ucUserName = ucUser.name;
    } else {
      ucUserName = ``;
    }
    //
    userId = userId.toLowerCase();
    pbxUserName = pbxUserName.toLowerCase();
    ucUserName = ucUserName.toLowerCase();
    const txt = contactStore.usersSearchTerm.toLowerCase();
    return (
      userId.includes(txt) ||
      pbxUserName.includes(txt) ||
      ucUserName.includes(txt)
    );
  };
  onHoldSuccess = () => {
    callStore.upsertRunning({
      id: callStore.selectedId,
      holding: true,
    });
  };
  onHoldFailure = err => {
    g.showError({
      message: intl.debug`Failed to hold the call`,
      err,
    });
  };
  @computed get runningById() {
    return arrToMap(callStore.runnings, `id`, c => c);
  }
  getListCall = () => {
    const otherCalls = callStore.runnings.map(c => {
      return this.runningById[c.id];
    });
    const id = setInterval(() => {
      const callsActive = callStore.runnings;
      if (callsActive.length === otherCalls.length + 1) {
        callStore.setSelectedId(callsActive[callsActive.length - 1].id);
        g.goToPageCallOthers();
        clearInterval(id);
      }
    }, 300);
  };
  callVoice = userId => {
    const call = this.runningById[callStore.selectedId];
    if (call) {
      pbx
        .holdTalker(call.pbxTenant, call.pbxTalkerId)
        .then(this.onHoldSuccess)
        .then(() => sip.createSession(userId))
        .then(this.getListCall)
        .catch(this.onHoldFailure);
    } else {
      sip.createSession(userId);
      g.goToPageCallManage();
    }
  };
  callVideo = userId => {
    sip.createSession(userId, {
      videoEnabled: true,
    });
    g.goToPageCallManage();
  };
  getLastMessageChat = id => {
    const chats = chatStore.messagesByThreadId[id] || [];
    return chats.length !== 0 ? chats[chats.length - 1] : {};
  };

  render() {
    const allUsers = this.getMatchUserIds().map(this.resolveUser);
    const onlineUsers = allUsers.filter(
      i => i.status && i.status !== `offline`,
    );

    const { displayOfflineUsers, ucEnabled } = authStore.currentProfile;
    const displayUsers =
      !displayOfflineUsers && ucEnabled ? onlineUsers : allUsers;

    const map = {};
    displayUsers.forEach(u => {
      u.name = u.name || u.id || ``;
      let c0 = u.name.charAt(0).toUpperCase();
      if (!/[A-Z]/.test(c0)) {
        c0 = `#`;
      }
      if (!map[c0]) {
        map[c0] = [];
      }
      map[c0].push(u);
    });
    let groups = Object.keys(map).map(k => ({
      key: k,
      users: map[k],
    }));
    groups = orderBy(groups, `key`);
    groups.forEach(g => {
      g.users = orderBy(g.users, `name`);
    });
    return (
      <Layout
        description={(() => {
          let desc = intl`PBX users, ${allUsers.length} total`;
          if (allUsers.length && ucEnabled) {
            desc = desc.replace(`PBX`, `PBX/UC`);
            desc = desc.replace(
              intl`${allUsers.length} total`,
              intl`${onlineUsers.length}/${allUsers.length} online`,
            );
          }
          return desc;
        })()}
        menu="contact"
        subMenu="users"
        title={intl`Users`}
      >
        <Field
          icon={mdiMagnify}
          label={intl`SEARCH FOR USERS`}
          onValueChange={v => {
            contactStore.usersSearchTerm = v;
          }}
          value={contactStore.usersSearchTerm}
        />
        {ucEnabled && (
          <Field
            label={intl`SHOW OFFLINE USERS`}
            onValueChange={v => {
              g.upsertProfile({
                id: authStore.currentProfile.id,
                displayOfflineUsers: v,
              });
            }}
            type="Switch"
            value={authStore.currentProfile.displayOfflineUsers}
          />
        )}
        {groups.map(_g => (
          <React.Fragment key={_g.key}>
            <Field isGroup label={_g.key} />
            {_g.users.map((u, i) => (
              <TouchableOpacity
                key={i}
                onPress={
                  authStore.currentProfile.ucEnabled
                    ? () => g.goToPageChatDetail({ buddy: u.id })
                    : null
                }
              >
                <UserItem
                  iconFuncs={[
                    () => this.callVideo(u.id),
                    () => this.callVoice(u.id),
                  ]}
                  icons={[mdiVideo, mdiPhone]}
                  lastMessage={this.getLastMessageChat(u.id)?.text}
                  {...u}
                />
              </TouchableOpacity>
            ))}
          </React.Fragment>
        ))}
      </Layout>
    );
  }
}

export default PageContactUsers;
