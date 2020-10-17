import { mdiPhoneIncoming, mdiPhoneMissed, mdiPhoneOutgoing } from '@mdi/js'
import React from 'react'

import g from '../global'
import intl from '../intl/intl'
import { Icon, StyleSheet, Text, TouchableOpacity, View } from '../Rn'
import Avatar from '../shared/Avatar'

const css = StyleSheet.create({
  Outer: {
    borderBottomWidth: 1,
    borderColor: g.borderBg,
  },
  Inner: {
    flexDirection: 'row',
    paddingLeft: 10,
  },
  Inner_selected: {
    backgroundColor: g.colors.primaryFn(0.5),
  },
  //
  WithSpace: {
    marginVertical: 5,
  },
  //
  Text: {
    flex: 1,
    paddingTop: 7,
    paddingLeft: 10,
  },
  NameWithStatus: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  Status: {
    top: 2,
    left: 3,
    color: g.subColor,
  },
  //
  Detail: {
    flexDirection: 'row',
  },
  CallIcon: {
    flex: null as any,
  },
  CallCreatedAt: {
    left: 3,
    color: g.subColor,
  },
  //
  ButtonIcon: {
    padding: 10,
  },
  LastDate: {
    marginVertical: 10,
    marginRight: 15,
    paddingTop: 7,
  },
})

const UserItem = p0 => {
  const {
    answered,
    avatar,
    created,
    iconFuncs,
    icons,
    id,
    incoming,
    isRecentCall,
    isRecentChat,
    lastMessage,
    lastMessageDate,
    name,
    partyNumber,
    selected,
    statusText,
    ...p
  } = p0
  return (
    <View style={css.Outer}>
      <View style={[css.Inner, selected && css.Inner_selected]}>
        <Avatar source={{ uri: avatar }} {...p} style={css.WithSpace} />
        <View style={[css.Text, css.WithSpace]}>
          <View style={css.NameWithStatus}>
            <Text black bold singleLine>
              {name || partyNumber || id}
            </Text>
            {!!statusText && (
              <Text normal singleLine small style={css.Status}>
                {statusText}
              </Text>
            )}
          </View>
          {!isRecentCall && !!lastMessage && (
            <Text normal singleLine small>
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
              <Text normal small style={css.CallCreatedAt}>
                {intl`at`} {created}
              </Text>
            </View>
          )}
        </View>
        {!isRecentCall && !!lastMessage && isRecentChat && (
          <View style={css.LastDate}>
            <Text normal singleLine small>
              {lastMessageDate}
            </Text>
          </View>
        )}
        {icons?.map((v, i) => (
          <TouchableOpacity key={i} onPress={iconFuncs?.[i]}>
            <Icon path={v} style={css.ButtonIcon} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
export default UserItem
