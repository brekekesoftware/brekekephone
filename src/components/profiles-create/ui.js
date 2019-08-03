import React, { Fragment, PureComponent } from 'react';
import {
  KeyboardAvoidingView,
  Picker,
  Platform,
  ScrollView as Scroll,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity as Button,
  View,
} from 'react-native';
import ModalPicker from 'react-native-modal-selector';

import { std } from '../../styleguide';

const st = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: std.color.shade3,
  },

  navbar: {
    backgroundColor: std.color.shade1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: std.gap.sm,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  navbarBack: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: std.gap.lg,
    top: 0,
    bottom: 0,
    paddingRight: std.gap.lg,
  },

  navbarOptText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.action,
  },

  navbarTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },

  navbarSave: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: std.gap.lg,
    top: 0,
    bottom: 0,
    paddingLeft: std.gap.lg,
  },

  scroll: {
    flex: 1,
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

  fieldLabel: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade5,
    lineHeight: std.textSize.md + std.gap.md * 2,
  },

  fieldValueTextInput: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade9,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: std.textSize.md + std.gap.md * 2,
    textAlign: 'right',
  },

  pickerNative: {
    flex: 1,
    height: std.textSize.md + std.gap.md * 2,
  },

  pickerNativeText: {
    textAlign: 'right',
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade9,
    lineHeight: std.textSize.md + std.gap.md * 2,
  },

  pickerNativeTextSelected: {
    color: std.color.shade9,
  },

  pickerNativeCancelTextStyle: {
    color: std.color.danger,
  },

  pickerWeb: {
    flex: 1,
    color: std.color.shade9,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: std.textSize.md + std.gap.md * 2,

    ...Platform.select({
      web: {
        fontFamily: std.font.text,
        fontSize: std.textSize.md,
        color: std.color.shade9,
        appearance: 'none',
        backgroundColor: 'white',
        borderStyle: 'none',
        direction: 'rtl',
      },
    }),
  },

  fieldSwitch: {
    marginLeft: 'auto',
  },

  parkNumber: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade9,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: std.textSize.md + std.gap.md * 2,
  },

  parkAdd: {
    paddingLeft: std.gap.lg,
  },

  parkAddIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
  },

  parkRemove: {
    paddingLeft: std.gap.lg,
  },

  parkRemoveIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.danger,
  },
});

const phoneIndexes = [1, 2, 3, 4].map(k => ({
  label: `Phone ${k}`,
  key: `${k}`,
}));

const PhoneIndexPickerNative = p => {
  const selected = phoneIndexes.find(t => t.key === p.value) || phoneIndexes[0];

  return (
    <ModalPicker
      style={st.pickerNative}
      selectedItemTextStyle={st.pickerNativeTextSelected}
      cancelText="Cancel"
      cancelTextStyle={st.pickerNativeCancelTextStyle}
      backdropPressToClose
      animationType="none"
      data={phoneIndexes}
      onChange={t => p.onChange(t.key)}
      selectedKey={selected.key}
    >
      <Text style={st.pickerNativeText}>{selected.label}</Text>
    </ModalPicker>
  );
};

const PhoneIndexPickerWeb = p => {
  const value = p.value || phoneIndexes[0].key;

  return (
    <Picker
      style={st.pickerWeb}
      selectedValue={value}
      onValueChange={v => p.onChange(v)}
    >
      {phoneIndexes.map(t => (
        <Picker.Item key={t.key} label={t.label} value={t.key} />
      ))}
    </Picker>
  );
};

export const PhoneIndexPicker =
  Platform.OS === 'web' ? PhoneIndexPickerWeb : PhoneIndexPickerNative;

const pure = Component =>
  class extends PureComponent {
    render = () => <Component {...this.props} />;
  };

const Navbar = pure(p => (
  <View style={st.navbar}>
    <Button style={st.navbarBack} onPress={p.back}>
      <Text style={st.navbarOptText}>Back</Text>
    </Button>
    <Text style={st.navbarTitle}>Creating Profile</Text>
    <Button style={st.navbarSave} onPress={p.save}>
      <Text style={st.navbarOptText}>Save</Text>
    </Button>
  </View>
));

const Divider = pure(({ children }) => (
  <View style={st.divider}>
    <Text style={st.dividerTitle}>{children}</Text>
  </View>
));

const PBX = pure(p => (
  <Fragment>
    <Divider>PBX</Divider>
    <View style={st.field}>
      <Text style={st.fieldLabel}>Hostname</Text>
      <TextInput
        style={st.fieldValueTextInput}
        placeholder="Required"
        keyboardType="default"
        value={p.hostname}
        onChangeText={p.setHostname}
        onSubmitEditing={p.submit}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldLabel}>Port</Text>
      <TextInput
        style={st.fieldValueTextInput}
        placeholder="Required"
        keyboardType="numeric"
        value={p.port}
        onChangeText={p.setPort}
        onSubmitEditing={p.submit}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldLabel}>Tenant</Text>
      <TextInput
        style={st.fieldValueTextInput}
        placeholder="Optional"
        keyboardType="default"
        value={p.tenant}
        onChangeText={p.setTenant}
        onSubmitEditing={p.submit}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldLabel}>Username</Text>
      <TextInput
        style={st.fieldValueTextInput}
        placeholder="Required"
        keyboardType="default"
        value={p.username}
        onChangeText={p.setUsername}
        onSubmitEditing={p.submit}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldLabel}>Password</Text>
      <TextInput
        style={st.fieldValueTextInput}
        placeholder="Required"
        keyboardType="default"
        secureTextEntry={true}
        value={p.password}
        onChangeText={p.setPassword}
        onSubmitEditing={p.submit}
        password="true"
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldLabel}>Phone</Text>
      <PhoneIndexPicker value={p.phoneIndex} onChange={p.setPhoneIndex} />
    </View>
    <View style={st.field}>
      <Text style={st.fieldLabel}>TURN</Text>
      <Switch
        style={st.fieldSwitch}
        value={p.turnEnabled}
        onValueChange={p.setTurnEnabled}
      />
    </View>
  </Fragment>
));

const UC = pure(p => (
  <Fragment>
    <Divider>UC</Divider>
    <View style={st.field}>
      <Text style={st.fieldLabel}>UC</Text>
      <Switch
        style={st.fieldSwitch}
        value={p.enabled}
        onValueChange={p.setEnabled}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldLabel}>Hostname</Text>
      <TextInput
        style={st.fieldValueTextInput}
        placeholder={p.enabled ? 'Required' : 'Optional'}
        keyboardType="default"
        value={p.hostname}
        onChangeText={p.setHostname}
        onSubmitEditing={p.submit}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldLabel}>Port</Text>
      <TextInput
        style={st.fieldValueTextInput}
        placeholder={p.enabled ? 'Required' : 'Optional'}
        keyboardType="numeric"
        value={p.port}
        onChangeText={p.setPort}
        onSubmitEditing={p.submit}
      />
    </View>
  </Fragment>
));

const Park = pure(p => (
  <View style={st.field}>
    <Text style={st.parkNumber}>{p.number}</Text>
    <Button style={st.parkRemove} onPress={p.remove}>
      <Text style={st.parkRemoveIcon}>icon_x</Text>
    </Button>
  </View>
));

const Parks = pure(p => (
  <Fragment>
    <Divider>PARKS</Divider>
    <View style={st.field}>
      <TextInput
        style={st.parkNumber}
        placeholder="Type park number"
        blurOnSubmit={false}
        keyboardType="numeric"
        value={p.adding}
        onChangeText={p.setAdding}
        onSubmitEditing={p.submitAdding}
      />
      <Button style={st.parkAdd} onPress={p.submitAdding}>
        <Text style={st.parkAddIcon}>icon_plus</Text>
      </Button>
    </View>
    {p.ids.map(id => (
      <Park key={id} number={id} remove={() => p.remove(id)} />
    ))}
  </Fragment>
));

const ProfilesCreate = p => (
  <KeyboardAvoidingView style={st.main}>
    <Navbar save={p.save} back={p.back} />
    <Scroll style={st.scroll}>
      <PBX
        hostname={p.pbxHostname}
        port={p.pbxPort}
        tenant={p.pbxTenant}
        username={p.pbxUsername}
        password={p.pbxPassword}
        phoneIndex={p.pbxPhoneIndex}
        turnEnabled={p.pbxTurnEnabled}
        setHostname={p.setPBXHostname}
        setPort={p.setPBXPort}
        setTenant={p.setPBXTenant}
        setUsername={p.setPBXUsername}
        setPassword={p.setPBXPassword}
        setPhoneIndex={p.setPBXPhoneIndex}
        setTurnEnabled={p.setPBXTurnEnabled}
        submit={p.save}
      />
      <UC
        enabled={p.ucEnabled}
        hostname={p.ucHostname}
        port={p.ucPort}
        setEnabled={p.setUCEnabled}
        setHostname={p.setUCHostname}
        setPort={p.setUCPort}
        submit={p.save}
      />
      <Parks
        ids={p.parks}
        adding={p.addingPark}
        submitAdding={p.submitAddingPark}
        setAdding={p.setAddingPark}
        remove={p.removePark}
      />
    </Scroll>
  </KeyboardAvoidingView>
);

export default ProfilesCreate;
