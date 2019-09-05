import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity as Button,
  View,
} from 'react-native';

import { std } from '../../-/styleguide';

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

  fieldValue: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade9,
    lineHeight: std.textSize.md + std.gap.md * 2,
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

  buddyAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    width: std.iconSize.lg * 2 + StyleSheet.hairlineWidth * 2,
    height: std.iconSize.lg * 2 + StyleSheet.hairlineWidth * 2,
    borderRadius: std.iconSize.lg,
    backgroundColor: std.color.shade1,
    borderColor: std.color.shade4,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: std.gap.lg,
  },

  buddyAvatarImage: {
    width: std.iconSize.lg * 2,
    height: std.iconSize.lg * 2,
    borderRadius: std.iconSize.lg,
  },

  buddyName: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },

  buddyStatusText: {
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
  class extends React.PureComponent {
    render() {
      return <Component {...this.props} />;
    }
  };

const Navbar = pure(p => (
  <View style={st.navbar}>
    <Button style={st.navbarLeftOpt} onPress={p.back}>
      <Text style={st.navbarOptText}>Back</Text>
    </Button>
    <Text style={st.navbarTitle}>Inviting Group Member</Text>
    <Button style={st.navbarRightOpt} onPress={p.invite}>
      <Text style={st.navbarOptText}>Invite</Text>
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
    <View style={st.buddyAvatar}>
      <Image
        style={st.buddyAvatarImage}
        source={{
          uri: p.avatar,
        }}
      />
      {p.status === 'offline' && <View style={st.buddyOffline} />}
      {p.status === 'online' && <View style={st.buddyOnline} />}
      {p.status === 'idle' && <View style={st.buddyIdle} />}
      {p.status === 'busy' && <View style={st.buddyBusy} />}
    </View>
    <View>
      {(() => {
        if (p.name) {
          return <Text style={st.buddyName}>{p.name}</Text>;
        } else {
          return <Text style={st.buddyName}>{p.id}</Text>;
        }
      })()}
      <Text style={st.buddyStatusText}>{p.statusText}</Text>
    </View>
  </Button>
));

const Buddies = pure(p => (
  <ScrollView style={st.buddies}>
    {p.ids.map(id => (
      <Buddy
        key={id}
        {...p.resolve(id)}
        selected={p.selected[id]}
        toggle={() => p.toggle(id)}
      />
    ))}
  </ScrollView>
));

const ChatGroupInvite = p => (
  <View style={st.main}>
    <Navbar back={p.back} invite={p.invite} />
    <Divider>GROUP</Divider>
    <View style={st.field}>
      <Text style={st.fieldValue}>{p.groupName}</Text>
    </View>
    <Divider>BUDDIES</Divider>
    <Buddies
      ids={p.buddies}
      selected={p.selectedBuddy}
      resolve={p.resolveBuddy}
      toggle={p.toggleBuddy}
    />
  </View>
);

export default ChatGroupInvite;
