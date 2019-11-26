import {
  mdiAccount,
  mdiAccountMultiple,
  mdiBagChecked,
  mdiCellphone,
  mdiEmail,
  mdiHome,
  mdiMapMarker,
  mdiPencil,
} from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Icon from '../shared/Icon';
import v from '../variables';

const s = StyleSheet.create({
  ContactItem: {
    backgroundColor: v.hoverBg,
    borderColor: v.borderBg,
    borderWidth: 1,
    borderRadius: 5,
    overflow: `hidden`,
    margin: 10,
  },
  ContactItem_Header: {
    flexDirection: `row`,
    backgroundColor: v.borderBg,
    alignItems: `center`,
  },
  ContactItem__headerTxt: {
    padding: 10,
  },
  ContactField: {
    flexDirection: `row`,
    alignItems: `center`,
    borderTopWidth: 1,
    borderColor: v.borderBg,
    padding: 10,
  },
  ContactField_Field: {
    paddingLeft: 10,
  },
  ContactField_Loading: {},
});

const ContactField = p =>
  p.fields.map((f, i) => (
    <View key={i} style={s.ContactField}>
      <View>
        <Icon color={v.borderBg} path={p.icons[i]} />
      </View>
      <View style={s.ContactField_Field}>
        <Text>{f}</Text>
      </View>
      <View></View>
    </View>
  ));

const ContactItem = observer(p => {
  return (
    <View style={s.ContactItem}>
      <View style={s.ContactItem_Header}>
        <Text style={s.ContactItem__headerTxt}>{p.name}</Text>
        <TouchableOpacity onPress={() => p.update(p)}>
          <Icon path={mdiPencil} />
        </TouchableOpacity>
      </View>
      <View>
        <ContactField
          fields={[
            p.job,
            p.company,
            p.address,
            p.workNumber,
            p.cellNumber,
            p.homeNumber,
            p.email,
          ]}
          icons={[
            mdiAccount,
            mdiAccountMultiple,
            mdiMapMarker,
            mdiBagChecked,
            mdiCellphone,
            mdiHome,
            mdiEmail,
          ]}
        />
      </View>
    </View>
  );
});

export default ContactItem;
