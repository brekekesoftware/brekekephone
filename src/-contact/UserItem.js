import { mdiPhoneIncoming, mdiPhoneMissed, mdiPhoneOutgoing } from '@mdi/js';
import React from 'react';

import { Icon, StyleSheet, Text, TouchableOpacity, View } from '../-/Rn';
import g from '../global';
import Avatar from '../shared/Avatar';

const css = StyleSheet.create({
  Outer: {
    borderBottomWidth: 1,
    borderColor: g.borderBg,
    paddingLeft: 10,
  },
  Outer__noButtons: {
    paddingRight: 10,
  },
  Inner: {
    flexDirection: `row`,
  },
  Inner_selected: {
    borderRightWidth: 5,
    borderColor: g.colors.primary,
    backgroundColor: g.hoverBg,
  },
  //
  WithSpace: {
    marginVertical: 5,
  },
  //
  Text: {
    flex: 1,
    paddingTop: 5,
    paddingLeft: 10,
  },
  NameWithStatus: {
    top: 3,
    flexDirection: `row`,
    flexWrap: `nowrap`,
  },
  Status: {
    top: 2,
    left: 3,
    fontSize: g.fontSizeSmall,
    color: g.subColor,
  },
  LastMessage: {
    fontSize: g.fontSizeSmall,
  },
  //
  Detail: {
    flexDirection: `row`,
  },
  CallIcon: {
    flex: null,
  },
  CallCreatedAt: {
    left: 3,
    fontSize: g.fontSizeSmall,
    color: g.subColor,
  },
  //
  ButtonIcon: {
    padding: 10,
  },
});

const UserItem = ({
  answered,
  avatar,
  created,
  iconFuncs,
  icons,
  id,
  incoming,
  isRecentCall,
  lastMessage,
  name,
  park,
  partyNumber,
  selected,
  statusText,
  ...p
}) => (
  <View style={[css.Outer, !icons?.length && css.Outer__noButtons]}>
    <View style={[css.Inner, selected && css.Inner_selected]}>
      <Avatar source={{ uri: avatar }} {...p} style={css.WithSpace} />
      <View style={[css.Text, css.WithSpace]}>
        <View style={css.NameWithStatus}>
          <Text numberOfLines={1} subTitle>
            {name || partyNumber || id}
          </Text>
          {!!statusText && (
            <Text numberOfLines={1} style={css.Status}>
              {statusText}
            </Text>
          )}
        </View>
        {!isRecentCall && !!lastMessage && (
          <Text numberOfLines={1} style={css.LastMessage}>
            {lastMessage}
          </Text>
        )}
        {isRecentCall && !lastMessage && (
          <View style={css.Detail}>
            <Icon
              color={
                incoming && !answered
                  ? g.colors.danger
                  : incoming && answered
                  ? g.colors.primary
                  : g.colors.warning
              }
              path={
                incoming && !answered
                  ? mdiPhoneMissed
                  : incoming && answered
                  ? mdiPhoneIncoming
                  : mdiPhoneOutgoing
              }
              size={14}
              style={css.CallIcon}
            />
            <Text style={css.CallCreatedAt}>at {created}</Text>
            {!!park && <Text small>{park}</Text>}
          </View>
        )}
      </View>
      {icons?.map((v, i) => (
        <TouchableOpacity key={i} onPress={iconFuncs?.[i]}>
          <Icon path={v} style={css.ButtonIcon} />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default UserItem;
