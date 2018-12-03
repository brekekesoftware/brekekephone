import React, {PureComponent} from 'react'
import {StyleSheet, View, ScrollView, TouchableOpacity as Button, Text, TextInput} from 'react-native'
import {std, rem} from '../styleguide'

const st = {
  signout: {
    flex: 1,
    backgroundColor: std.color.shade3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  signoutMessage: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade5,
    lineHeight: std.textSize.md + std.gap.md * 2
  },
  main: {
    flex: 1,
    backgroundColor: std.color.shade3
  },
  navbar: {
    backgroundColor: std.color.shade1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: std.gap.sm,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  navbarTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9
  },
  divider: {
    paddingLeft: std.gap.lg,
    paddingTop: std.gap.lg * 2,
    paddingBottom: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  dividerTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    color: std.color.shade5
  },
  list: {
    flex: 1
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: std.gap.lg,
    backgroundColor: std.color.shade0,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  fieldLabelNormal: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade9,
    lineHeight: std.textSize.md + std.gap.md * 2
  },
  fieldLabelDanger: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.danger,
    lineHeight: std.textSize.md + std.gap.md * 2
  },
  fieldValueText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade5,
    lineHeight: std.textSize.md + std.gap.md * 2,
    marginLeft: 'auto'
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto'
  },
  switchItemActive: {
    backgroundColor: std.color.action,
    borderColor: std.color.action
  },
  switchItemNormal: {
    alignItems: 'center',
    width: rem(64),
    backgroundColor: std.color.shade0,
    borderColor: std.color.action,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth
  },
  switchItemMostLeft: {
    borderTopLeftRadius: std.gap.sm,
    borderBottomLeftRadius: std.gap.sm
  },
  switchItemMostRight: {
    borderTopRightRadius: std.gap.sm,
    borderBottomRightRadius: std.gap.sm,
    borderRightWidth: StyleSheet.hairlineWidth
  },
  switchItemTextNormal: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.action,
    lineHeight: std.textSize.md + std.gap.md * 2
  },
  switchItemTextActive: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade0,
    lineHeight: std.textSize.md + std.gap.md * 2
  },
  fieldInput: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade9,
    paddingVertical: 0,
    paddingRight: 0,
    paddingLeft: std.gap.md,
    height: std.textSize.md + std.gap.md * 2,
    textAlign: 'right'
  }
}

const pure = (Component) => (
  class extends PureComponent {
    render = () => <Component {...this.props}/>
  }
)

const Divider = pure(({children}) => (
  <View style={st.divider}>
    <Text style={st.dividerTitle}>
      {children}
    </Text>
  </View>
))

const NopParent = ({children}) => children

const PBXProfile = pure((p) => (<NopParent>
  <Divider>PBX</Divider>
  <View style={st.field}>
    <Text style={st.fieldLabelNormal}>
      Hostname
    </Text>
    <Text style={st.fieldValueText}>
      {p.hostname}
    </Text>
  </View>
  <View style={st.field}>
    <Text style={st.fieldLabelNormal}>
      Port
    </Text>
    <Text style={st.fieldValueText}>
      {p.port}
    </Text>
  </View>
  {p.tenant && (
    <View style={st.field}>
      <Text style={st.fieldLabelNormal}>
        Tenant
      </Text>
      <Text style={st.fieldValueText}>
        {p.tenant}
      </Text>
    </View>
  )}
  <View style={st.field}>
    <Text style={st.fieldLabelNormal}>
      Username
    </Text>
    <Text style={st.fieldValueText}>
      {p.username}
    </Text>
  </View>
</NopParent>))

const UCProfile = pure((p) => (<NopParent>
  <Divider>UC</Divider>
  <View style={st.field}>
    <Text style={st.fieldLabelNormal}>
      Hostname
    </Text>
    <Text style={st.fieldValueText}>
      {p.hostname}
    </Text>
  </View>
  <View style={st.field}>
    <Text style={st.fieldLabelNormal}>
      Port
    </Text>
    <Text style={st.fieldValueText}>
      {p.port}
    </Text>
  </View>
</NopParent>))

const StatusSwitch = pure((p) => (
  <View style={st.switch}>
    <Button
      style={[
        st.switchItemNormal,
        st.switchItemMostLeft,
        p.offline && st.switchItemActive]}
      onPress={p.setOffline}
      disabled={p.offline}>
      <Text style={[
        st.switchItemTextNormal,
        p.offline && st.switchItemTextActive]}>
        Offline
      </Text>
    </Button>
    <Button
      style={[
        st.switchItemNormal,
        p.online && st.switchItemActive]}
      onPress={p.setOnline}
      disabled={p.online}>
      <Text style={[
        st.switchItemTextNormal,
        p.online && st.switchItemTextActive]}>
        Online
      </Text>
    </Button>
    <Button
      style={[
        st.switchItemNormal,
        st.switchItemMostRight,
        p.busy && st.switchItemActive]}
      onPress={p.setBusy}
      disabled={p.busy}>
      <Text style={[
        st.switchItemTextNormal,
        p.busy && st.switchItemTextActive]}>
        Busy
      </Text>
    </Button>
  </View>
))

class CustomTextInput extends PureComponent {
  render= () => <TextInput
    {...this.props}
    onBlur={this.onBlur}
  />

  onBlur = () => {
    const {onSubmitEditing} = this.props
    if (typeof onSubmitEditing === 'function') {
      onSubmitEditing()
    }
  }
}

const Chat = pure((p) => (<NopParent>
  <Divider>CHAT</Divider>
  <View style={st.field}>
    <Text style={st.fieldLabelNormal}>
      Status
    </Text>
    <StatusSwitch
      offline={p.offline}
      online={p.online}
      busy={p.busy}
      setOffline={p.setOffline}
      setOnline={p.setOnline}
      setBusy={p.setBusy}
    />
  </View>
  <View style={st.field}>
    <Text style={st.fieldLabelNormal}>
      Mood
    </Text>
    <CustomTextInput style={st.fieldInput}
      placeholder='Type your mood'
      selectTextOnFocus={true}
      value={p.mood}
      onChangeText={p.setMood}
      onSubmitEditing={p.submitMood}
    />
  </View>
</NopParent>))

const Main = (p) => (
  <View style={st.main}>
    <View style={st.navbar}>
      <Text style={st.navbarTitle}>
        Settings
      </Text>
    </View>
    <ScrollView style={st.list}>
      {p.profile.ucEnabled && (
        <Chat
          offline={p.chatOffline}
          online={p.chatOnline}
          busy={p.chatBusy}
          mood={p.chatMood}
          setOffline={p.setChatOffline}
          setOnline={p.setChatOnline}
          setBusy={p.setChatBusy}
          setMood={p.setChatMood}
          submitMood={p.submitChatMood}
        />
      )}
      <PBXProfile
        hostname={p.profile.pbxHostname}
        port={p.profile.pbxPort}
        tenant={p.profile.pbxTenant}
        username={p.profile.pbxUsername}
      />
      {p.profile.ucEnabled && (
        <UCProfile
          hostname={p.profile.ucHostname}
          port={p.profile.ucPort}
        />
      )}
      <Divider />
      <Button style={st.field} onPress={p.signout}>
        <Text style={st.fieldLabelDanger}>
          Sign out
        </Text>
      </Button>
    </ScrollView>
  </View>
)

const SignedOut = (p) => (
  <View style={st.signout}>
    <Text style={st.signoutMessage}>
      The profile is signed out
    </Text>
  </View>
)

const Settings = (p) => p.profile
  ? <Main {...p} />
  : <SignedOut />

export default Settings
