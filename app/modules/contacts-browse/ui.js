import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity as Button,
  Text,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { std, rem } from '../styleguide';

const st = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: std.color.shade2,
    paddingVertical: std.gap.md,
    paddingHorizontal: std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: std.textSize.md + std.gap.lg * 2,
    color: std.color.shade9,
    textAlign: 'center',
    backgroundColor: std.color.shade0,
    borderRadius: std.gap.sm,
  },
  searchClear: {
    position: 'absolute',
    top: 0,
    right: std.gap.lg + std.gap.sm,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: std.gap.lg,
    overflow: 'hidden',
    margin: std.gap.lg,
  },
  contactLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: std.color.shade0,
    opacity: 0.5,
  },
  contactHead: {
    flexDirection: 'row',
    alignItems: 'center',
    height: std.textSize.md * 2 + std.gap.md * 6,
    paddingHorizontal: std.gap.lg,
    backgroundColor: std.color.shade1,
  },
  contactHeadInfo: {
    flex: 1,
  },
  contactAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: std.iconSize.md * 2,
    height: std.iconSize.md * 2,
    borderRadius: std.iconSize.md,
    borderColor: std.color.shade4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  contactActionIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
  },
  fieldHeadText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    fontWeight: 'bold',
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.shade9,
  },
  fieldHeadEdit: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    fontWeight: 'bold',
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: std.textSize.md + std.gap.md * 2,
    color: std.color.shade5,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: std.iconSize.md * 2 + std.gap.md * 2,
    paddingHorizontal: std.gap.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    justifyContent: 'center',
    alignItems: 'center',
    width: std.iconSize.md * 2,
    height: std.iconSize.md * 2,
    borderRadius: std.iconSize.md,
    borderColor: std.color.shade4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionIcon: {
    fontFamily: std.font.icon,
    fontSize: std.iconSize.md,
    color: std.color.action,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paging: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: std.gap.lg,
    backgroundColor: std.color.shade1,
    borderColor: std.color.shade4,
    borderWidth: StyleSheet.hairlineWidth,
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
  class extends PureComponent {
    render = () => <Component {...this.props} />;
  };

const Navbar = pure(p => (
  <View style={st.navbar}>
    <Button style={st.navbarLeftOpt} onPress={p.back}>
      <Text style={st.navbarOptText}>Back</Text>
    </Button>
    <Text style={st.navbarTitle}>
      {p.book} {p.shared && '(Shared)'}
    </Text>
    {p.canCreate && (
      <Button style={st.navbarRightOpt} onPress={p.create}>
        <Text style={st.navbarOptText}>Create</Text>
      </Button>
    )}
  </View>
));

const Search = pure(p => (
  <View style={st.search}>
    <TextInput
      style={st.searchInput}
      placeholder="Search"
      value={p.value}
      onChangeText={p.setValue}
    />
    {!!p.value && (
      <Button style={st.searchClear} onPress={() => p.setValue('')}>
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
          style={st.fieldHeadEdit}
          placeholderTextColor={std.color.shade4}
          placeholder="First Name"
          value={p.firstName}
          onChangeText={v => p.setFirstName(p.id, v)}
        />
        <TextInput
          style={st.fieldHeadEdit}
          placeholderTextColor={std.color.shade4}
          placeholder="Last Name"
          value={p.lastName}
          onChangeText={v => p.setLastName(p.id, v)}
        />
      </View>
      <Button style={st.contactAction} onPress={() => p.save(p.id)}>
        <Text style={st.contactActionIcon}>icon_check</Text>
      </Button>
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_user</Text>
      <TextInput
        style={st.fieldBodyEdit}
        placeholderTextColor={std.color.shade4}
        placeholder="Job Title"
        value={p.job}
        onChangeText={v => p.setJob(p.id, v)}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_users</Text>
      <TextInput
        style={st.fieldBodyEdit}
        placeholderTextColor={std.color.shade4}
        placeholder="Company"
        value={p.company}
        onChangeText={v => p.setCompany(p.id, v)}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_map_pin</Text>
      <TextInput
        style={st.fieldBodyEdit}
        placeholderTextColor={std.color.shade4}
        placeholder="Address"
        value={p.address}
        onChangeText={v => p.setAddress(p.id, v)}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_briefcase</Text>
      <TextInput
        style={st.fieldBodyEdit}
        placeholderTextColor={std.color.shade4}
        placeholder="Work Number"
        value={p.workNumber}
        onChangeText={v => p.setWorkNumber(p.id, v)}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_smartphone</Text>
      <TextInput
        style={st.fieldBodyEdit}
        placeholderTextColor={std.color.shade4}
        placeholder="Cell Number"
        value={p.cellNumber}
        onChangeText={v => p.setCellNumber(p.id, v)}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_home</Text>
      <TextInput
        style={st.fieldBodyEdit}
        placeholderTextColor={std.color.shade4}
        placeholder="Home Number"
        value={p.homeNumber}
        onChangeText={v => p.setHomeNumber(p.id, v)}
      />
    </View>
    <View style={st.field}>
      <Text style={st.fieldIcon}>icon_mail</Text>
      <TextInput
        style={st.fieldBodyEdit}
        placeholderTextColor={std.color.shade4}
        placeholder="Email"
        value={p.email}
        onChangeText={v => p.setEmail(p.id, v)}
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
        <Button style={st.contactAction} onPress={() => p.edit(p.id)}>
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
        <Button style={st.fieldAction} onPress={() => p.call(p.workNumber)}>
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
        <Button style={st.fieldAction} onPress={() => p.call(p.cellNumber)}>
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
        <Button style={st.fieldAction} onPress={() => p.call(p.homeNumber)}>
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
      <Button style={st.paging} onPress={p.goPrevPage}>
        <Text style={st.pagingText}>Previous Page</Text>
      </Button>
    )}
    {p.ids.map(id => (
      <Contact
        key={id}
        {...p.resolve(id)}
        editable={p.editable}
        edit={p.edit}
        setFirstName={p.setFirstName}
        setLastName={p.setLastName}
        setJob={p.setJob}
        setCompany={p.setCompany}
        setAddress={p.setAddress}
        setWorkNumber={p.setWorkNumber}
        setCellNumber={p.setCellNumber}
        setHomeNumber={p.setHomeNumber}
        setEmail={p.setEmail}
        save={p.save}
        call={p.call}
      />
    ))}
    {p.hasNextPage && (
      <Button style={st.paging} onPress={p.goNextPage}>
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

const ContactsBrowse = p => (
  <KeyboardAvoidingView style={st.main}>
    <Navbar
      canCreate={!p.shared}
      book={p.book}
      shared={p.shared}
      back={p.back}
      create={p.create}
    />
    {!p.loading && <Search value={p.searchText} setValue={p.setSearchText} />}
    {p.contactIds.length ? (
      <Contacts
        ids={p.contactIds}
        editable={!p.shared}
        resolve={p.resolveContact}
        edit={p.editContact}
        setFirstName={p.setContactFirstName}
        setLastName={p.setContactLastName}
        setJob={p.setContactJob}
        setCompany={p.setContactCompany}
        setAddress={p.setContactAddress}
        setWorkNumber={p.setContactWorkNumber}
        setCellNumber={p.setContactCellNumber}
        setHomeNumber={p.setContactHomeNumber}
        setEmail={p.setContactEmail}
        save={p.saveContact}
        hasNextPage={p.hasNextPage}
        hasPrevPage={p.hasPrevPage}
        goNextPage={p.goNextPage}
        goPrevPage={p.goPrevPage}
        call={p.call}
      />
    ) : p.loading ? (
      <Loading />
    ) : (
      <Empty />
    )}
  </KeyboardAvoidingView>
);

export default ContactsBrowse;
