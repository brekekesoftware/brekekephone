import React, { PureComponent } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity as Button,
  View,
} from 'react-native';

import { std } from '../../styleguide';

const st = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: std.color.shade3,
  },

  navbar: {
    backgroundColor: std.color.shade1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: std.gap.sm,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  navbarTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },

  navbarLeftOpt: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: std.gap.lg,
    top: 0,
    bottom: 0,
    paddingRight: std.gap.lg,
  },

  navbarRightOpt: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: std.gap.lg,
    top: 0,
    bottom: 0,
    paddingLeft: std.gap.lg,
  },

  navbarOptText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.action,
  },

  divider: {
    paddingLeft: std.gap.lg,
    paddingTop: std.gap.lg * 2,
    paddingBottom: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  dividerTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    color: std.color.shade5,
  },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: std.gap.lg,
    backgroundColor: std.color.shade0,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  fieldInput: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade9,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: std.textSize.md + std.gap.md * 2,
  },

  buddies: {
    flex: 1,
  },

  buddy: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: std.gap.lg,
    paddingRight: std.gap.sm,
    paddingVertical: std.gap.lg,
    backgroundColor: std.color.shade0,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  buddySelected: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth * 5,
    backgroundColor: std.color.active,
  },

  buddyStatus: {
    marginRight: std.gap.lg,
  },

  buddyAvatar: {
    width: std.iconSize.lg * 2,
    height: std.iconSize.lg * 2,
    borderRadius: std.iconSize.lg,
    borderColor: std.color.shade4,
    borderWidth: StyleSheet.hairlineWidth,
  },

  buddyName: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },

  buddyMood: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
    color: std.color.shade5,
  },

  buddyOffline: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: std.gap.lg,
    height: std.gap.lg,
    borderRadius: std.gap.lg / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.shade0,
    backgroundColor: std.color.shade5,
  },

  buddyOnline: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: std.gap.lg,
    height: std.gap.lg,
    borderRadius: std.gap.lg / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.shade0,
    backgroundColor: std.color.active,
  },

  buddyIdle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: std.gap.lg,
    height: std.gap.lg,
    borderRadius: std.gap.lg / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.shade0,
    backgroundColor: std.color.notice,
  },

  buddyBusy: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: std.gap.lg,
    height: std.gap.lg,
    borderRadius: std.gap.lg / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.shade0,
    backgroundColor: std.color.danger,
  },
});

const pure = Component =>
  class extends PureComponent {
    render = () => <Component {...this.props} />;
  };

const Navbar = pure(p => (
  <View style={st.navbar}>
    <Button style={st.navbarLeftOpt} onPress={p.back}>
      <Text style={st.navbarOptText}>Back</Text>
    </Button>
    <Text style={st.navbarTitle}>Creating Group Chat</Text>
    <Button style={st.navbarRightOpt} onPress={p.create}>
      <Text style={st.navbarOptText}>Create</Text>
    </Button>
  </View>
));

const Divider = pure(({ children }) => (
  <View style={st.divider}>
    <Text style={st.dividerTitle}>{children}</Text>
  </View>
));

const Buddy = pure(p => (
  <Button style={st.buddy} onPress={p.toggle}>
    {p.selected && <View style={st.buddySelected} />}
    <View style={st.buddyStatus}>
      <Image
        style={st.buddyAvatar}
        source={{
          uri: p.avatar,
        }}
      />
      {p.offline && <View style={st.buddyOffline} />}
      {p.online && <View style={st.buddyOnline} />}
      {p.idle && <View style={st.buddyIdle} />}
      {p.busy && <View style={st.buddyBusy} />}
    </View>
    <View>
      {(() => {
        if (p.name) {
          return <Text style={st.buddyName}>{p.name}</Text>;
        } else {
          return <Text style={st.buddyName}>{p.id}</Text>;
        }
      })()}
      <Text style={st.buddyMood}>{p.mood}</Text>
    </View>
  </Button>
));

const Buddies = pure(p => (
  <ScrollView style={st.buddies}>
    {p.ids.map(id => (
      <Buddy
        key={id}
        {...p.byid[id]}
        selected={p.selectedIds.includes(id)}
        toggle={() => p.toggle(id)}
      />
    ))}
  </ScrollView>
));

const ChatGroupsCreate = p => (
  <View style={st.main}>
    <Navbar back={p.back} create={p.create} />
    <Divider>NAME</Divider>
    <View style={st.field}>
      <TextInput
        style={st.fieldInput}
        placeholder="Type group name"
        value={p.name}
        onChangeText={p.setName}
      />
    </View>
    <Divider>MEMBERS</Divider>
    <Buddies
      ids={p.buddyIds}
      selectedIds={p.members}
      byid={p.buddyById}
      toggle={p.toggleBuddy}
    />
  </View>
);

export default ChatGroupsCreate;
