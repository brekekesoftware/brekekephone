import { mdiPhoneIncoming, mdiPhoneMissed, mdiPhoneOutgoing } from '@mdi/js';
import React from 'react';

import g from '../global';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Avatar from '../shared/Avatar';
import Icon from '../shared/Icon';

const css = StyleSheet.create({
  Item: {
    borderBottomWidth: 1,
    borderColor: g.borderBg,
    height: 80,
    alignItems: `stretch`,
    paddingLeft: 10,
  },
  Item__Bgr: {
    backgroundColor: g.hoverBg,
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
  Item__TxtStatus: {
    fontSize: g.fontSizeSmall,
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
    backgroundColor: g.mainDarkBg,
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
    <View
      style={[css.Item, p.last && css.Item__last, p.selected && css.Item__Bgr]}
    >
      {p.avatar && <Avatar source={{ uri: p.avatar }} {...p} />}
      <View style={[css.Item_Name, !p.avatar && css.Item__noAvatar]}>
        <Text black subTitle>
          {p.name || p.partyNumber || p.id}
        </Text>
        <Text style={css.Item__TxtStatus}>{p.statusText}</Text>
      </View>
      {p.detail && (
        <View style={[css.Item_Detail, !p.avatar && css.Item__noAvatar]}>
          {p.incoming && p.answered && (
            <Icon color={g.callBg} noFlex path={mdiPhoneIncoming} size={18} />
          )}
          {p.incoming && !p.answered && (
            <Icon color={g.redBg} noFlex path={mdiPhoneMissed} size={18} />
          )}
          {!p.incoming && !p.park && !p.lastmess && (
            <Icon color={g.mainBg} noFlex path={mdiPhoneOutgoing} size={18} />
          )}
          {p.created && (
            <Text style={css.Item_Detail_Text}>at {p.created}</Text>
          )}
          {p.park && (
            <Text
              style={[css.Item_Detail_Text, !p.avatar && css.Item__pdLeft0]}
            >
              {p.park}
            </Text>
          )}
          {p.lastmess && (
            <Text numberOfLines={20} style={[!p.avatar && css.Item__pdLeft0]}>
              {p.lastmess.text}
            </Text>
          )}
        </View>
      )}
    </View>
    {p.selected && <View style={css.Item__Selected} />}
    <View style={css.Item_Icon}>
      {p.icon &&
        p.function &&
        p.icon.map((v, i) => (
          <TouchableOpacity key={i} onPress={p.function[i]}>
            <Icon path={v} style={css.Item_Icon__pd} />
          </TouchableOpacity>
        ))}
      {p.icon &&
        !p.function &&
        p.icon.map(v => <Icon path={v} style={css.Item_Icon__pd} />)}
    </View>
  </View>
);

export default UserItem;
