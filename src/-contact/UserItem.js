import { mdiPhoneIncoming, mdiPhoneMissed, mdiPhoneOutgoing } from '@mdi/js';
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Avatar from '../shared/Avatar';
import Icon from '../shared/Icon';
import v from '../variables';

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
    flexDirection: `row`,
    position: `absolute`,
    top: 20,
    left: 70,
  },
  Item__TxtName: {
    fontSize: v.fontSizeSubTitle,
    color: v.subColor,
    fontWeight: `600`,
  },
  Item__TxtStatus: {
    fontSize: v.fontSizeSmall,
    paddingLeft: 10,
  },
  Item_Detail: {
    flexDirection: `row`,
    position: `absolute`,
    top: 50,
    left: 70,
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

const UserItem = p => (
  <View>
    <View style={[s.Item, p.last && s.Item__last, p.selected && s.Item__Bgr]}>
      {p.avatar && <Avatar source={{ uri: p.avatar }} {...p} />}
      <View style={[s.Item_Name, !p.avatar && s.Item__noAvatar]}>
        <Text style={s.Item__TxtName}>{p.name || p.partyNumber || p.id}</Text>
        <Text style={s.Item__TxtStatus}>{p.statusText}</Text>
      </View>
      {p.detail && (
        <View style={[s.Item_Detail, !p.avatar && s.Item__noAvatar]}>
          {p.incoming && p.answered && (
            <Icon color={v.callBg} noFlex path={mdiPhoneIncoming} size={18} />
          )}
          {p.incoming && !p.answered && (
            <Icon color={v.redBg} noFlex path={mdiPhoneMissed} size={18} />
          )}
          {!p.incoming && !p.park && !p.lastmess && (
            <Icon color={v.mainBg} noFlex path={mdiPhoneOutgoing} size={18} />
          )}
          {p.created && <Text style={s.Item_Detail_Text}>at {p.created}</Text>}
          {p.park && (
            <Text style={[s.Item_Detail_Text, !p.avatar && s.Item__pdLeft0]}>
              {p.park}
            </Text>
          )}
          {p.lastmess && (
            <Text numberOfLines={20} style={[!p.avatar && s.Item__pdLeft0]}>
              {p.lastmess.text}
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

export default UserItem;
