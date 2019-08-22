import {
  mdiAccount,
  mdiDelete,
  mdiDesktopClassic,
  mdiHome,
  mdiPencil,
  mdiUsb,
} from '@mdi/js';
import {
  Body,
  Button,
  Left,
  ListItem,
  Right,
  Switch,
  Text,
  View,
} from 'native-base';
import React from 'react';
import { FlatList } from 'react-native';

import SvgIcon from '../components-shared/SvgIcon';

const NoServer = p => (
  <View noServer>
    <ListItem itemNoServer>
      <Body>
        <SvgIcon path={mdiDesktopClassic} />
        <Text>No Server</Text>
      </Body>
    </ListItem>
    <ListItem itemNoServer>
      <Text numberOfLines={4}>
        There is no server created. Tap the button below to make the first one.
      </Text>
    </ListItem>
    <ListItem itemNoServer>
      <Body>
        <Button onPress={p.create}>
          <Text>NEW SERVER</Text>
        </Button>
      </Body>
    </ListItem>
  </View>
);

const Server = p => (
  <View listServer>
    <ListItem infoUser>
      <Left>
        <SvgIcon path={mdiAccount} />
      </Left>
      <Body>
        <Text note>USERNAME</Text>
        <Text>{p.pbxUsername}</Text>
      </Body>
    </ListItem>
    <ListItem infoUser>
      <Left>
        <SvgIcon path={mdiHome} />
      </Left>
      <Body>
        <Text note>TENANT</Text>
        <Text>{p.pbxTenant}</Text>
      </Body>
    </ListItem>
    <ListItem infoUser>
      <Left>
        <SvgIcon path={mdiDesktopClassic} />
      </Left>
      <Body>
        <Text note>HOST NAME</Text>
        <Text>{p.pbxHostname}</Text>
      </Body>
    </ListItem>
    <ListItem infoUser>
      <Left>
        <SvgIcon path={mdiUsb} />
      </Left>
      <Body>
        <Text note>PORT</Text>
        <Text>{p.pbxPort}</Text>
      </Body>
    </ListItem>
    <ListItem statusUc>
      <Left>
        <Text>UC STATUS</Text>
      </Left>
      <Right>
        <Switch value={p.ucEnabled} />
      </Right>
    </ListItem>
    <ListItem btnlistServer>
      <Left>
        <Button onPress={() => p.remove(p.id)}>
          <SvgIcon path={mdiDelete} />
        </Button>
      </Left>
      <Body>
        <Button onPress={() => p.update(p.id)}>
          <SvgIcon path={mdiPencil} />
        </Button>
      </Body>
      <Right>
        <Button onPress={() => p.signin(p.id)}>
          <Text>SIGN IN</Text>
        </Button>
      </Right>
    </ListItem>
  </View>
);

class ListServer extends React.Component {
  render() {
    const p = this.props;
    return (
      <View>
        {p.profileIds.length ? (
          <FlatList
            data={p.profileIds}
            horizontal
            style={{ top: '10%' }}
            renderItem={({ item: rowData, index }) => {
              return (
                <Server
                  {...p.resolveProfile(p.profileIds[index])}
                  remove={p.remove}
                  update={p.update}
                  signin={p.signin}
                />
              );
            }}
          />
        ) : (
          <NoServer create={p.create} />
        )}
      </View>
    );
  }
}

export default ListServer;
