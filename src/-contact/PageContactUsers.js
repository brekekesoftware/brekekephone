import { mdiPhone, mdiVideo } from '@mdi/js';
import orderBy from 'lodash/orderBy';
import uniq from 'lodash/uniq';
import { observer } from 'mobx-react';
import React from 'react';

import sip from '../api/sip';
import avatarPlaceholderUrl from '../assets/avatar-placeholder.png';
import g from '../global';
import authStore from '../global/authStore';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';
import { TouchableOpacity } from '../native/Rn';
import Field from '../shared/Field';
import Layout from '../shared/Layout';
import Search from '../shared/Search';
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
    u.avatar = u.avatar || avatarPlaceholderUrl;
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
    const txt = contactStore.searchText.toLowerCase();
    return (
      userId.includes(txt) ||
      pbxUserName.includes(txt) ||
      ucUserName.includes(txt)
    );
  };
  callVoice = userId => {
    sip.createSession(userId);
    g.goToPageCallManage();
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
      u.name = u.name || u.id;
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
        footer={{
          navigation: {
            menu: `contact`,
            subMenu: `users`,
          },
        }}
        header={{
          title: `Users`,
          description: (() => {
            let desc = `PBX users, ${allUsers.length} total`;
            if (allUsers.length && ucEnabled) {
              desc = desc.replace(`PBX`, `PBX/UC`);
              desc = desc.replace(
                `${allUsers.length} total`,
                `${onlineUsers.length}/${allUsers.length} online`,
              );
            }
            return desc;
          })(),
          navigation: {
            menu: `contact`,
            subMenu: `users`,
          },
        }}
      >
        {ucEnabled && (
          <Field
            label="SHOW OFFLINE USERS"
            onValueChange={v => {
              g.upsertProfile({
                id: authStore.currentProfile?.id,
                displayOfflineUsers: v,
              });
            }}
            type={`Switch`}
            value={authStore.currentProfile?.displayOfflineUsers}
          />
        )}
        <Search
          onValueChange={contactStore.setF(`searchText`)}
          value={contactStore.searchText}
        />
        {groups.map(_g => (
          <React.Fragment key={_g.key}>
            <Field isGroup label={_g.key} />
            {_g.users.map((u, i) => (
              <TouchableOpacity
                key={i}
                onPress={
                  authStore.currentProfile?.ucEnabled
                    ? () => g.goToPageChatDetail({ buddy: u.id })
                    : null
                }
              >
                <UserItem
                  detail={true}
                  function={[
                    () => this.callVoice(u.id),
                    () => this.callVideo(u.id),
                  ]}
                  icon={[mdiPhone, mdiVideo]}
                  last={i === _g.users.length - 1}
                  lastmess={this.getLastMessageChat(u.id)}
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
