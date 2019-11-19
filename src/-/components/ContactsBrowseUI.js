import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity as Button,
  View,
} from 'react-native';

import { rem, std } from '../styleguide';

const st = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: `center`,
    alignItems: `center`,
  },

  emptyMessage: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade5,
    lineHeight: std.textSize.md + std.gap.md * 2,
  },

  main: {
    flex: 1,
    backgroundColor: std.color.shade3,
  },

  navbar: {
    backgroundColor: std.color.shade1,
    alignItems: `center`,
    justifyContent: `center`,
    paddingVertical: std.gap.sm,
    borderColor: std.color.shade4,
    borderBottomWidth: 1,
  },

  navbarTitle: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },

  navbarLeftOpt: {
    alignItems: `center`,
    justifyContent: `center`,
    position: `absolute`,
    left: std.gap.lg,
    top: 0,
    bottom: 0,
    paddingRight: std.gap.lg,
  },

  navbarRightOpt: {
    alignItems: `center`,
    justifyContent: `center`,
    position: `absolute`,
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

  search: {
    flexDirection: `row`,
    alignItems: `center`,
    backgroundColor: std.color.shade2,
    paddingVertical: std.gap.md,
    paddingHorizontal: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: 1,
  },

  searchInput: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: std.textSize.md + std.gap.lg * 2,
    color: std.color.shade9,
    textAlign: `center`,
    backgroundColor: std.color.shade0,
    borderRadius: std.gap.sm,
  },

  searchClear: {
    position: `absolute`,
    top: 0,
    right: std.gap.lg + std.gap.sm,
    bottom: 0,
    justifyContent: `center`,
    alignItems: `center`,
  },

  searchClearIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
  },

  contacts: {
    flex: 1,
  },

  contact: {
    backgroundColor: std.color.shade0,
    borderColor: std.color.shade4,
    borderWidth: 1,
    borderRadius: std.gap.lg,
    overflow: `hidden`,
    margin: std.gap.lg,
  },

  contactLoading: {
    justifyContent: `center`,
    alignItems: `center`,
    position: `absolute`,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: std.color.shade0,
    opacity: 0.5,
  },

  contactHead: {
    flexDirection: `row`,
    alignItems: `center`,
    height: std.textSize.md * 2 + std.gap.md * 6,
    paddingHorizontal: std.gap.lg,
    backgroundColor: std.color.shade1,
  },

  contactHeadInfo: {
    flex: 1,
  },

  contactAction: {
    justifyContent: `center`,
    alignItems: `center`,
    width: std.iconSize.md * 2,
    height: std.iconSize.md * 2,
    borderRadius: std.iconSize.md,
    borderColor: std.color.shade4,
    borderWidth: 1,
  },

  contactActionIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
  },

  fieldHeadText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    fontWeight: `bold`,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },

  fieldHeadEdit: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    fontWeight: `bold`,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: std.textSize.md + std.gap.md * 2,
    color: std.color.shade5,
  },

  field: {
    flexDirection: `row`,
    alignItems: `center`,
    height: std.iconSize.md * 2 + std.gap.md * 2,
    paddingHorizontal: std.gap.lg,
    borderBottomWidth: 1,
    borderColor: std.color.shade2,
  },

  fieldIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.shade4,
  },

  fieldBodyText: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade5,
    paddingHorizontal: std.gap.lg,
  },

  fieldBodyEdit: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.shade5,
    paddingHorizontal: std.gap.lg,
  },

  fieldTBA: {
    height: std.textSize.md,
    width: rem(128),
    backgroundColor: std.color.shade1,
    marginHorizontal: std.gap.lg,
  },

  fieldAction: {
    justifyContent: `center`,
    alignItems: `center`,
    width: std.iconSize.md * 2,
    height: std.iconSize.md * 2,
    borderRadius: std.iconSize.md,
    borderColor: std.color.shade4,
    borderWidth: 1,
  },

  actionIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
  },

  loading: {
    flex: 1,
    justifyContent: `center`,
    alignItems: `center`,
  },

  paging: {
    justifyContent: `center`,
    alignItems: `center`,
    padding: std.gap.lg,
    backgroundColor: std.color.shade1,
    borderColor: std.color.shade4,
    borderWidth: 1,
    borderRadius: std.gap.md,
    margin: std.gap.lg,
  },

  pagingText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    color: std.color.action,
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
    <Button onPress={p.back} style={st.navbarLeftOpt}>
      <Text style={st.navbarOptText}>Back</Text>
    </Button>
    <Text style={st.navbarTitle}>
      {p.book} {p.shared && `(Shared)`}
    </Text>
    {p.canCreate && (
      <Button onPress={p.create} style={st.navbarRightOpt}>
        <Text style={st.navbarOptText}>Create</Text>
      </Button>
    )}
  </View>
));

const Search = pure(p => (
  <View style={st.search}>
    <TextInput
      onChangeText={p.setValue}
      placeholder="Search"
      style={st.searchInput}
      value={p.value}
    />
    {!!p.value && (
      <Button onPress={() => p.setValue(``)} style={st.searchClear}>
        <Text style={st.searchClearIcon}>icon_x_circle</Text>
      </Button>
    )}
  </View>
));

const ContactEdit = pure(p => (
  <View style={st.contact}>
    <View style={st.contactHead}>
      <View style={st.contactHeadInfo}>
        <TextInput
          onChangeText={v => p.setFirstName(p.id, v)}
          placeholder="First Name"
          placeholderTextColor={std.color.shade4}
          style={st.fieldHeadEdit}
          value={p.firstName}
        />
        <TextInput
          onChangeText={v => p.setLastName(p.id, v)}
          placeholder="Last Name"
          placeholderTextColor={std.color.shade4}
          style={st.fieldHeadEdit}
          value={p.lastName}
        />
      </View>
      <Button onPress={() => p.save(p.id)} style={st.contactAction}>
        <Text style={st.contactActionIcon}>icon_check</Text>
      </Button>
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_user</Text>
      <TextInput
        onChangeText={v => p.setJob(p.id, v)}
        placeholder="Job Title"
        placeholderTextColor={std.color.shade4}
        style={st.fieldBodyEdit}
        value={p.job}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_users</Text>
      <TextInput
        onChangeText={v => p.setCompany(p.id, v)}
        placeholder="Company"
        placeholderTextColor={std.color.shade4}
        style={st.fieldBodyEdit}
        value={p.company}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_map_pin</Text>
      <TextInput
        onChangeText={v => p.setAddress(p.id, v)}
        placeholder="Address"
        placeholderTextColor={std.color.shade4}
        style={st.fieldBodyEdit}
        value={p.address}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_briefcase</Text>
      <TextInput
        onChangeText={v => p.setWorkNumber(p.id, v)}
        placeholder="Work Number"
        placeholderTextColor={std.color.shade4}
        style={st.fieldBodyEdit}
        value={p.workNumber}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_smartphone</Text>
      <TextInput
        onChangeText={v => p.setCellNumber(p.id, v)}
        placeholder="Cell Number"
        placeholderTextColor={std.color.shade4}
        style={st.fieldBodyEdit}
        value={p.cellNumber}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_home</Text>
      <TextInput
        onChangeText={v => p.setHomeNumber(p.id, v)}
        placeholder="Home Number"
        placeholderTextColor={std.color.shade4}
        style={st.fieldBodyEdit}
        value={p.homeNumber}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_mail</Text>
      <TextInput
        onChangeText={v => p.setEmail(p.id, v)}
        placeholder="Email"
        placeholderTextColor={std.color.shade4}
        style={st.fieldBodyEdit}
        value={p.email}
      />
    </View>
    {p.loading && (
      <View style={st.contactLoading}>
        <ActivityIndicator />
      </View>
    )}
  </View>
));

const ContactView = pure(p => (
  <View style={st.contact}>
    <View style={st.contactHead}>
      <View style={st.contactHeadInfo}>
        <Text style={st.fieldHeadText}>{p.name}</Text>
      </View>
      {p.editable && (
        <Button onPress={() => p.edit(p.id)} style={st.contactAction}>
          <Text style={st.contactActionIcon}>icon_edit_2</Text>
        </Button>
      )}
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_user</Text>
      {p.job ? (
        <Text style={st.fieldBodyText}>{p.job}</Text>
      ) : (
        <View style={st.fieldTBA} />
      )}
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_users</Text>
      {p.company ? (
        <Text style={st.fieldBodyText}>{p.company}</Text>
      ) : (
        <View style={st.fieldTBA} />
      )}
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_map_pin</Text>
      {p.address ? (
        <Text style={st.fieldBodyText}>{p.address}</Text>
      ) : (
        <View style={st.fieldTBA} />
      )}
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_briefcase</Text>
      {p.workNumber ? (
        <Text style={st.fieldBodyText}>{p.workNumber}</Text>
      ) : (
        <View style={st.fieldTBA} />
      )}
      {!!p.workNumber && (
        <Button onPress={() => p.call(p.workNumber)} style={st.fieldAction}>
          <Text style={st.actionIcon}>icon_phone_pick</Text>
        </Button>
      )}
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_smartphone</Text>
      {p.cellNumber ? (
        <Text style={st.fieldBodyText}>{p.cellNumber}</Text>
      ) : (
        <View style={st.fieldTBA} />
      )}
      {!!p.cellNumber && (
        <Button onPress={() => p.call(p.cellNumber)} style={st.fieldAction}>
          <Text style={st.actionIcon}>icon_phone_pick</Text>
        </Button>
      )}
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_home</Text>
      {p.homeNumber ? (
        <Text style={st.fieldBodyText}>{p.homeNumber}</Text>
      ) : (
        <View style={st.fieldTBA} />
      )}
      {!!p.homeNumber && (
        <Button onPress={() => p.call(p.homeNumber)} style={st.fieldAction}>
          <Text style={st.actionIcon}>icon_phone_pick</Text>
        </Button>
      )}
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_mail</Text>
      {p.email ? (
        <Text style={st.fieldBodyText}>{p.email}</Text>
      ) : (
        <View style={st.fieldTBA} />
      )}
    </View>
    {p.loading && (
      <View style={st.contactLoading}>
        <ActivityIndicator />
      </View>
    )}
  </View>
));

const Contact = p =>
  p.editing ? <ContactEdit {...p} /> : <ContactView {...p} />;

const Contacts = p => (
  <ScrollView style={st.contacts}>
    {p.hasPrevPage && (
      <Button onPress={p.goPrevPage} style={st.paging}>
        <Text style={st.pagingText}>Previous Page</Text>
      </Button>
    )}
    {p.ids.map(id => (
      <Contact
        key={id}
        {...p.resolve(id)}
        call={p.call}
        edit={p.edit}
        editable={p.editable}
        save={p.save}
        setAddress={p.setAddress}
        setCellNumber={p.setCellNumber}
        setCompany={p.setCompany}
        setEmail={p.setEmail}
        setFirstName={p.setFirstName}
        setHomeNumber={p.setHomeNumber}
        setJob={p.setJob}
        setLastName={p.setLastName}
        setWorkNumber={p.setWorkNumber}
      />
    ))}
    {p.hasNextPage && (
      <Button onPress={p.goNextPage} style={st.paging}>
        <Text style={st.pagingText}>Next Page</Text>
      </Button>
    )}
  </ScrollView>
);

const Empty = p => (
  <View style={st.empty}>
    <Text style={st.emptyMessage}>Empty</Text>
  </View>
);

const Loading = () => (
  <View style={st.loading}>
    <ActivityIndicator />
  </View>
);

const ContactsBrowseUI = p => (
  <KeyboardAvoidingView style={st.main}>
    <Navbar
      back={p.back}
      book={p.book}
      canCreate={!p.shared}
      create={p.create}
      shared={p.shared}
    />
    {!p.loading && <Search setValue={p.setSearchText} value={p.searchText} />}
    {p.contactIds.length ? (
      <Contacts
        call={p.call}
        edit={p.editContact}
        editable={!p.shared}
        goNextPage={p.goNextPage}
        goPrevPage={p.goPrevPage}
        hasNextPage={p.hasNextPage}
        hasPrevPage={p.hasPrevPage}
        ids={p.contactIds}
        resolve={p.resolveContact}
        save={p.saveContact}
        setAddress={p.setContactAddress}
        setCellNumber={p.setContactCellNumber}
        setCompany={p.setContactCompany}
        setEmail={p.setContactEmail}
        setFirstName={p.setContactFirstName}
        setHomeNumber={p.setContactHomeNumber}
        setJob={p.setContactJob}
        setLastName={p.setContactLastName}
        setWorkNumber={p.setContactWorkNumber}
      />
    ) : p.loading ? (
      <Loading />
    ) : (
      <Empty />
    )}
  </KeyboardAvoidingView>
);

export default ContactsBrowseUI;
