import { mdiPhoneIncoming, mdiPhoneMissed, mdiPhoneOutgoing } from '@mdi/js';
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import v from '../variables';
import Avatar from './Avatar';
import Icon from './Icon';

const s = StyleSheet.create({
  Item: {
    borderBottomWidth: 1,
    borderColor: v.borderBg,
    height: 80,
    alignItems: `stretch`,
    paddingLeft: 10,
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
    fontWeight: `600`,
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
  Item__noAvatar: {
    left: 15,
  },
  Item__pdLeft0: {
    paddingLeft: 0,
  },
});

const renderItem = p => (
  <View>
    <View style={[s.Item, p.last && s.Item__last, p.selected && s.Item__Bgr]}>
      {p.avatar && <Avatar source={{ uri: p.avatar }} {...p} />}
      <Text style={[s.Item_Name, !p.avatar && s.Item__noAvatar]}>
        {p.name || p.partyNumber || p.id}
      </Text>
      {p.detail && (
        <View style={[s.Item_Detail, !p.avatar && s.Item__noAvatar]}>
          {p.incoming && p.answered && (
            <Icon path={mdiPhoneIncoming} noFlex size={18} color={v.callBg} />
          )}
          {p.incoming && !p.answered && (
            <Icon path={mdiPhoneMissed} noFlex size={18} color={v.redBg} />
          )}
          {!p.incoming && !p.park && (
            <Icon path={mdiPhoneOutgoing} noFlex size={18} color={v.mainBg} />
          )}
          {p.created && <Text style={s.Item_Detail_Text}>at {p.created}</Text>}
          {p.park && (
            <Text style={[s.Item_Detail_Text, !p.avatar && s.Item__pdLeft0]}>
              {p.park}
            </Text>
          )}
        </View>
      )}
    </View>
    {p.selected && <View style={s.Item__Selected} />}
    <View style={s.Item_Icon}>
      {p.icon &&
        p.function &&
        p.icon.map((v, i) => (
          <TouchableOpacity key={i} onPress={p.function[i]}>
            <Icon path={v} style={s.Item_Icon__pd} />
          </TouchableOpacity>
        ))}
      {p.icon &&
        !p.function &&
        p.icon.map(v => <Icon path={v} style={s.Item_Icon__pd} />)}
    </View>
  </View>
);

const Item = p => {
  return renderItem({
    ...p,
  });
};

export default Item;
