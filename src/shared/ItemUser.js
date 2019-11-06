import { mdiPhoneIncoming, mdiPhoneMissed, mdiPhoneOutgoing } from '@mdi/js';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text, TouchableOpacity } from '../native/Rn';
import v from '../variables';
import Avatar from './Avatar';
import Icon from './Icon';

const s = StyleSheet.create({
  Item: {
    borderBottomWidth: 1,
    borderColor: v.borderBg,
    height: 80,
    alignItems: `stretch`,
  },
  Item__Bgr: {
    backgroundColor: v.hoverBg,
  },
  Item__last: {
    borderBottomWidth: 0,
  },
  Item_Name: {
    position: `absolute`,
    top: 20,
    left: 70,
    fontSize: v.fontSizeSubTitle,
    color: v.subColor,
  },
  Item_Detail: {
    flexDirection: `row`,
    position: `absolute`,
    top: 50,
    left: 70,
    fontSize: v.fontSizeSmall,
    color: v.subColor,
  },
  Item_Detail_Text: {
    paddingLeft: 10,
  },
  Item_Icon: {
    position: `absolute`,
    flexDirection: `row`,
    top: 20,
    right: 15,
  },
  Item_Icon__pd: {
    paddingLeft: 20,
  },
  Item__Selected: {
    position: `absolute`,
    right: 0,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: v.mainDarkBg,
  },
});

const renderItem = p => (
  <View>
    <View style={[s.Item, p.last && s.Item__last, p.selected && s.Item__Bgr]}>
      <Avatar source={{ uri: p.avatar }} {...p} />
      <Text style={s.Item_Name}>{p.name || p.partyNumber || p.id}</Text>
      {p.detail && (
        <View style={s.Item_Detail}>
          {p.incoming && p.answered && (
            // TODO: change icon to match with status phone.
            <Icon path={mdiPhoneIncoming} size={18} color={v.callBg} />
          )}
          {p.incoming && !p.answered && (
            <Icon path={mdiPhoneMissed} size={18} color={v.redBg} />
          )}
          {!p.incoming && (
            <Icon path={mdiPhoneOutgoing} size={18} color={v.mainBg} />
          )}
          <Text style={s.Item_Detail_Text}>at {p.created}</Text>
        </View>
      )}
    </View>
    {p.selected && <View style={s.Item__Selected} />}
    <View style={s.Item_Icon}>
      {p.icon &&
        p.icon.map((v, i) => (
          <TouchableOpacity onPress={p.function[i]}>
            <Icon path={v} style={s.Item_Icon__pd} />
          </TouchableOpacity>
        ))}
    </View>
  </View>
);

const Item = p => {
  return renderItem({
    ...p,
  });
};

export default Item;
