import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity as Button,
  Text,
  TextInput,
} from 'react-native';
import { std } from '../styleguide';

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
  navbarTextAction: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.action,
  },
  navbarTextNormal: {
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
  fieldInput: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade9,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: std.textSize.md + std.gap.md * 2,
    textAlign: 'right',
  },
});

const pure = Component =>
  class extends PureComponent {
    render = () => <Component {...this.props} />;
  };

const Navbar = pure(p => (
  <View style={st.navbar}>
    <Button style={st.navbarBack} onPress={p.back}>
      <Text style={st.navbarTextAction}>Back</Text>
    </Button>
    <Text style={st.navbarTextNormal}>Creating Contact</Text>
    {p.saving ? (
      <View style={st.navbarSave}>
        <Text style={st.navbarTextNormal}>Saving...</Text>
      </View>
    ) : (
      <Button style={st.navbarSave} onPress={p.save}>
        <Text style={st.navbarTextAction}>Save</Text>
      </Button>
    )}
  </View>
));

const Field = p => (
  <View style={st.field}>
    {!!p.label && <Text style={st.fieldLabel}>{p.label}</Text>}
    <TextInput
      style={st.fieldInput}
      editable={p.editable}
      placeholderTextColor={std.color.shade5}
      placeholder={p.placeholder}
      value={p.value}
      onChangeText={p.setValue}
      onSubmitEditing={p.submit}
    />
  </View>
);

const ContactsCreate = p => (
  <View style={st.main}>
    <Navbar saving={p.saving} save={p.save} back={p.back} />
    <ScrollView style={st.scroll}>
      <Field
        editable={!p.saving}
        label="Phonebook"
        placeholder="Required"
        value={p.book}
        setValue={p.setBook}
      />
      <Field
        editable={!p.saving}
        label="First Name"
        placeholder="Required"
        value={p.firstName}
        setValue={p.setFirstName}
      />
      <Field
        editable={!p.saving}
        label="Last Name"
        placeholder="Required"
        value={p.lastName}
        setValue={p.setLastName}
      />
      <Field
        editable={!p.saving}
        label="Work Number"
        placeholder="Optional"
        value={p.workNumber}
        setValue={p.setWorkNumber}
      />
      <Field
        editable={!p.saving}
        label="Cell Number"
        placeholder="Optional"
        value={p.cellNumber}
        setValue={p.setCellNumber}
      />
      <Field
        editable={!p.saving}
        label="Home Number"
        placeholder="Optional"
        value={p.homeNumber}
        setValue={p.setHomeNumber}
      />
      <Field
        editable={!p.saving}
        label="Job Title"
        placeholder="Optional"
        value={p.job}
        setValue={p.setJob}
      />
      <Field
        editable={!p.saving}
        label="Company"
        placeholder="Optional"
        value={p.company}
        setValue={p.setCompany}
      />
      <Field
        editable={!p.saving}
        label="Address"
        placeholder="Optional"
        value={p.address}
        setValue={p.setAddress}
      />
      <Field
        editable={!p.saving}
        label="Email"
        placeholder="Optional"
        value={p.email}
        setValue={p.setEmail}
      />
    </ScrollView>
  </View>
);

export default ContactsCreate;
