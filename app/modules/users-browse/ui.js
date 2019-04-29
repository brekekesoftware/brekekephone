import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity as Button,
  Text,
  Image,
  TextInput,
} from 'react-native';
import { std } from '../../styleguide';
import UserLanguage from '../../language/UserLanguage';

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
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: std.color.shade2,
    padding: std.gap.md,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    paddingVertical: 0,
    paddingHorizontal: std.gap.lg,
    height: std.textSize.md + std.gap.lg * 2,
    color: std.color.shade9,
    textAlign: 'center',
    backgroundColor: std.color.shade0,
    borderRadius: std.gap.sm,
  },
  searchClear: {
    position: 'absolute',
    top: 0,
    right: std.gap.lg,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  users: {
    flex: 1,
  },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: std.gap.lg,
    paddingVertical: std.gap.lg,
    backgroundColor: std.color.shade0,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  userAvatar: {
    width: std.iconSize.lg * 2,
    height: std.iconSize.lg * 2,
    borderRadius: std.iconSize.lg,
    borderColor: std.color.shade4,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: std.gap.lg,
  },
  userBody: {
    flex: 1,
  },
  userName: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },
  userMood: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
    color: std.color.shade5,
  },
  userOpt: {
    justifyContent: 'center',
    alignItems: 'center',
    width: std.iconSize.md * 2,
    height: std.iconSize.md * 2,
    borderRadius: std.iconSize.md,
    borderColor: std.color.shade4,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: std.gap.md,
  },
  optIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
  },
  userCallHolding: {
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
  userCallTalking: {
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
  userCallCalling: {
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
  userCallRinging: {
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
  userChatOffline: {
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
  userChatOnline: {
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
  userChatIdle: {
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
  userChatBusy: {
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
  profileSubtitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    lineHeight: std.textSize.sm + std.gap.sm * 2,
    color: std.color.shade5,
  },
});

const pure = Component =>
  class extends PureComponent {
    render = () => <Component {...this.props} />;
  };

const Navbar = pure(p => (
  <View style={st.navbar}>
    <Text style={st.navbarTitle}>
      {UserLanguage.getUserzMessage_s(
        'com.brekeke.phone.app.modules.users-browse.USERS',
      )}
    </Text>
  </View>
));

const Search = pure(p => (
  <View style={st.search}>
    <TextInput
      style={st.searchInput}
      placeholder={UserLanguage.getUserzMessage_s(
        'com.brekeke.phone.app.modules.users-browse.SEARCH',
      )}
      value={p.value}
      onChangeText={p.setValue}
    />
    {!!p.value && (
      <Button style={st.searchClear} onPress={() => p.setValue('')}>
        <Text style={st.optIcon}>icon_x_circle</Text>
      </Button>
    )}
  </View>
));

const User = pure(p => (
  <View style={st.user}>
    {p.chatEnabled && (
      <Image style={st.userAvatar} source={{ uri: p.avatar }} />
    )}
    <View style={st.userBody}>
      {(() => {
        if (p.name) {
          return <Text style={st.userName}>{p.name}</Text>;
        } else {
          return <Text style={st.userName}>{p.id}</Text>;
        }
      })()}
      <Text style={st.profileSubtitle}>{p.id}</Text>
      {(() => {
        if (p.mood) {
          return <Text style={st.userMood}>{p.mood}</Text>;
        }
      })()}
    </View>
    <Button style={st.userOpt} onPress={p.callVideo}>
      <Text style={st.optIcon}>icon_video_on</Text>
      {p.callHolding && <View style={st.userCallHolding} />}
      {p.callTalking && <View style={st.userCallTalking} />}
      {p.callRinging && <View style={st.userCallRinging} />}
      {p.callCalling && <View style={st.userCallCalling} />}
    </Button>
    {p.chatEnabled && (
      <Button style={st.userOpt} onPress={p.chat}>
        <Text style={st.optIcon}>icon_message_circle</Text>
        {p.chatOffline && <View style={st.userChatOffline} />}
        {p.chatOnline && <View style={st.userChatOnline} />}
        {p.chatIdle && <View style={st.userChatIdle} />}
        {p.chatBusy && <View style={st.userChatBusy} />}
      </Button>
    )}
    <Button style={st.userOpt} onPress={p.callVoice}>
      <Text style={st.optIcon}>icon_phone_pick</Text>
      {p.callHolding && <View style={st.userCallHolding} />}
      {p.callTalking && <View style={st.userCallTalking} />}
    </Button>
  </View>
));

const Users = pure(p => (
  <ScrollView style={st.users}>
    {p.ids.map(id => (
      <User
        key={id}
        {...p.resolve(id)}
        callVoice={() => p.callVoice(id)}
        callVideo={() => p.callVideo(id)}
        chat={() => p.chat(id)}
      />
    ))}
  </ScrollView>
));

const UsersBrowse = p => (
  <View style={st.main}>
    <Navbar />
    <Search value={p.searchText} setValue={p.setSearchText} />
    <Users
      ids={p.userIds}
      resolve={p.resolveUser}
      callVoice={p.callVoice}
      callVideo={p.callVideo}
      chat={p.chat}
    />
  </View>
);

export default UsersBrowse;
