import { mdiPhone, mdiVideo } from '@mdi/js';
import orderBy from 'lodash/orderBy';
import uniq from 'lodash/uniq';
import { observer } from 'mobx-react';
import React from 'react';

import sip from '../api/sip';
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
  state = {
    showOfflineUsers: false,
  };
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
    return {
      id: id,
      name: pbxUser.name || ucUser.name,
      statusText: ucUser.statusText,
      avatar: ucUser.avatar,
      callTalking: !!pbxUser.talkers?.filter(t => t.status === `calling`)
        .length,
      callHolding: !!pbxUser.talkers?.filter(t => t.status === `ringing`)
        .length,
      callRinging: !!pbxUser.talkers?.filter(t => t.status === `talking`)
        .length,
      callCalling: !!pbxUser.talkers?.filter(t => t.status === `holding`)
        .length,
      chatEnabled: authStore.currentProfile?.ucEnabled,
    };
  };
  setHiddenContact = value => {
    this.setState({
      showOfflineUsers: value,
    });
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
    const users = this.state.showOfflineUsers
      ? this.getMatchUserIds().map(this.resolveUser)
      : this.getMatchUserIds()
          .map(this.resolveUser)
          .filter(i => !i.status === `offline`);
    const map = {};
    users.forEach(u => {
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
          description: `PBX/UC users (${users.length})`,
          navigation: {
            menu: `contact`,
            subMenu: `users`,
          },
        }}
      >
        <Field
          label="SHOW OFFLINE CONTACTS"
          onValueChange={this.setHiddenContact}
          type={`Switch`}
          value={this.state.showOfflineUsers}
        />
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
