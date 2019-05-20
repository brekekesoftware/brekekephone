import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity as Button,
  View,
} from 'react-native';

import Switch from '../components-shared/Switch';
import { rem, std } from '../styleguide';

const st = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: rem(268),
    height: rem(320),
    borderRadius: std.gap.lg,
    backgroundColor: std.color.shade4,
    margin: std.gap.lg,
    marginTop: rem(200),
  },
  containerServer: {
    flex:1,
    flexDirection: 'column',
    width: rem(240),
    borderRadius: std.gap.lg,
    backgroundColor: std.color.shade0,
    margin: std.gap.lg,
    marginTop: rem(200),
  },
  btnNewServer: {
    padding: std.gap.lg,
    backgroundColor: std.color.shade9,
    borderRadius: std.gap.sm,
    marginTop: std.gap.lg,
  },
  textNoServer: {
    fontSize: std.textSize.lg,
    paddingTop: std.gap.lg *2,
    paddingBottom: std.gap.lg,
  },
  btnText: {
    fontSize: std.textSize.sm,
    lineHeight: std.iconSize.md,
    color: std.color.shade0,
    paddingRight: std.gap.md,
    paddingLeft: std.gap.md,
  },
  description: {
    fontSize: std.textSize.md,
    lineHeight: std.iconSize.md,
    paddingTop: std.gap.lg,
    paddingBottom: std.gap.lg,
    paddingRight: std.gap.sm,
    paddingLeft: std.gap.sm,
    color: std.color.shade5,
  },
  tenantcontainer: {
    flexDirection: 'row',
    paddingLeft: std.gap.lg,
    paddingBottom: std.gap.md,
  },
  hostnamecontainer: {
    flexDirection: 'row',
    paddingLeft: std.gap.lg,
    paddingTop: std.gap.md,
    paddingBottom: std.gap.md,
  },
  portcontainer: {
    flexDirection: 'row',
    paddingLeft: std.gap.lg,
    paddingTop: std.gap.md,
    paddingBottom: std.gap.md,
  },
  icons: {
    fontFamily: std.font.icon,
    fontSize: std.textSize.lg,
    paddingTop: std.gap.lg,
    paddingRight: std.gap.lg,
  },
  nameserver: {
    fontSize: std.textSize.md * 2,
    padding: std.gap.lg,
  },
  servertitle: {
    fontSize: std.textSize.sm,
  },
  serverinfo: {
    fontSize: std.textSize.md,
    lineHeight: std.iconSize.md + std.gap.md,
  },
  containerText: {
    paddingLeft: std.gap.lg,
  },
  btncontainer: {
    flexDirection: 'row',
  },
  btnEditandRemove: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '50%',
    paddingTop: std.gap.sm,
  },
  btncontainerSignin: {
    width: '50%',
    alignItems: 'center',
    backgroundColor: std.color.shade9,
    borderBottomRightRadius: std.gap.lg,
  },
  btnSignin: {
    paddingTop: std.gap.lg + std.gap.sm,
    paddingBottom: std.gap.lg + +std.gap.sm,
    color: std.color.shade0,
  },
  iconserver: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.lg *3,
    paddingTop: std.iconSize.lg,
  },
});

const count_server = 0;

const NoServer = () => (
  <View style={st.container}>
    <View>
      <Text style={st.iconserver}>icon_server</Text>
    </View>
    <View>
      <Text style={st.textNoServer}>No Server</Text>
    </View>
    <View>
      <Text style={st.description} numberOfLines={2}>
        There is no server created. Tap the button below to make the first one.
      </Text>
    </View>
    <View>
      <Button style={st.btnNewServer}>
        <Text style={st.btnText}>NEW SERVER</Text>
      </Button>
    </View>
  </View>
);

const Server = p => (
  <View style={st.containerServer}>
    <View>
      <Text style={st.nameserver}>401</Text>
    </View>
    <View style={st.tenantcontainer}>
      <View>
        <Text style={st.icons}>icon_home</Text>
      </View>
      <View style={st.containerText}>
        <Text style={st.servertitle}>TENANT</Text>
        <Text style={st.serverinfo}>Nam</Text>
      </View>
    </View>
    <View style={st.hostnamecontainer}>
      <View>
        <Text style={st.icons}>icon_target</Text>
      </View>
      <View style={st.containerText}>
        <Text style={st.servertitle}>HOST NAME</Text>
        <Text style={st.serverinfo}>apps.brekeke.com</Text>
      </View>
    </View>
    <View style={st.portcontainer}>
      <View>
        <Text style={st.icons}>icon_share_2</Text>
      </View>
      <View style={st.containerText}>
        <Text style={st.servertitle}>PORT</Text>
        <Text style={st.serverinfo}>8443</Text>
      </View>
    </View>
    <View>
      <Switch />
    </View>
    <View style={st.btncontainer}>
      <View style={st.btnEditandRemove}>
        <Button>
          <Text style={st.icons}>icon_trash</Text>
        </Button>
        <Button>
          <Text style={st.icons}>icon_edit_2</Text>
        </Button>
      </View>
      <Button style={st.btncontainerSignin}>
        <Text style={st.btnSignin}>SIGN IN</Text>
      </Button>
    </View>
  </View>
);

const data = [
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something',
  },
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something two',
  },
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something three',
  },
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something four',
  },
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something five',
  },
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something six',
  },
];

class ListServer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: data,
    };
  }

  render() {
    return (
      <View>


        <FlatList
          data={this.state.data}
          horizontal
          renderItem={({ item: rowData }) => {
            return <Server />;
          }}
        />
        {/*<NoServer/>*/}
      </View>
    );
  }
}

export default ListServer;
