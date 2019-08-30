import { mdiMessage, mdiPhone, mdiVideo } from '@mdi/js';
import orderBy from 'lodash/orderBy';
import { Body, Button, Left, ListItem, Right, Text, View } from 'native-base';
import React from 'react';
import { Platform } from 'react-native';

import Avatar from '../components-shared/Avatar';
import Modal from '../components-shared/NativeModal';
import SvgIcon from '../components-shared/SvgIcon';
import SearchContact from './SearchContact';

class TabUsers extends React.Component {
  render() {
    const p = this.props;
    const users = p.userIds.map(p.resolveUser);
    const map = {};
    users.forEach(u => {
      u.name = u.name || u.id;
      let c0 = u.name.charAt(0).toUpperCase();
      if (!/[A-Z]/.test(c0)) {
        c0 = '#';
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

    groups = orderBy(groups, 'key');
    groups.forEach(g => {
      g.users = orderBy(g.users, 'name');
    });

    return (
      <React.Fragment>
        <SearchContact value={p.searchText} setValue={p.setSearchText} />
        {groups.map(g => (
          <React.Fragment key={g.key}>
            <ListItem itemDivider>
              <Text>{g.key}</Text>
            </ListItem>
            {g.users.map(u => (
              <ListItem key={u.id} listUser>
                <Left>
                  <Avatar
                    source={u.avatar}
                    online={u.chatOnline}
                    offline={u.chatOffline}
                    busy={u.chatBusy}
                  />
                </Left>
                <Body>
                  <Text>{u.name}</Text>
                  <Text note>{u.id}</Text>
                </Body>
                <Right>
                  <Button onPress={() => p.chat(u.id)}>
                    <SvgIcon path={mdiMessage} />
                  </Button>
                  {Platform.OS !== 'web' && (
                    <Button onPress={() => p.toggleModal(u.id)}>
                      <SvgIcon path={mdiPhone} />
                    </Button>
                  )}
                  {Platform.OS === 'web' && (
                    <Button onPress={() => p.callVoice(u.id)}>
                      <SvgIcon path={mdiPhone} />
                    </Button>
                  )}
                </Right>
              </ListItem>
            ))}
          </React.Fragment>
        ))}
        {Platform.OS !== 'web' && (
          <View style={{ flex: 1 }}>
            <Modal
              isVisible={p.isModalVisible}
              swipeDirection={['up', 'left', 'right', 'down']}
              style={{ justifyContent: 'flex-end', margin: 0 }}
            >
              <View callModal>
                <View>
                  <ListItem listUser onPress={() => p.callVoice(p.iduser)}>
                    <Left>
                      <SvgIcon path={mdiPhone} />
                    </Left>
                    <Body>
                      <Text>VOICE CALLING</Text>
                    </Body>
                  </ListItem>
                  <ListItem listUser onPress={() => p.callVideo(p.iduser)}>
                    <Left>
                      <SvgIcon path={mdiVideo} />
                    </Left>
                    <Body>
                      <Text>VIDEO CALLING</Text>
                    </Body>
                  </ListItem>
                  <ListItem listUser onPress={p.exitModal}>
                    <Left></Left>
                    <Body>
                      <Text>CANCEL</Text>
                    </Body>
                  </ListItem>
                </View>
              </View>
            </Modal>
          </View>
        )}
      </React.Fragment>
    );
  }
}

export default TabUsers;
