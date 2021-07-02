import { mdiPhoneIncoming, mdiPhoneMissed, mdiPhoneOutgoing } from '@mdi/js'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'

import intl from '../stores/intl'
import Nav from '../stores/Nav'
import Avatar from './Avatar'
import { RnIcon, RnText, RnTouchableOpacity } from './Rn'
import g from './variables'

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

const UserItem: FC<
  Partial<{
    answered: boolean
    avatar: string
    created: string
    icons: string[]
    iconColors: string[]
    iconFuncs: Function[]
    id: string
    incoming: boolean
    isRecentCall: boolean
    isRecentChat: boolean
    lastMessage: string
    lastMessageDate: string
    name: string
    partyNumber: string
    selected: boolean
    statusText: string
    canChat: boolean
  }>
> = p0 => {
  const {
    answered,
    avatar,
    created,
    icons,
    iconColors,
    iconFuncs,
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
    canChat,
    ...p
  } = p0
  const Container = canChat ? RnTouchableOpacity : View
  return (
    <Container
      style={css.Outer}
      onPress={() => Nav().goToPageChatDetail({ buddy: partyNumber })}
    >
      <View style={[css.Inner, selected && css.Inner_selected]}>
        <Avatar
          source={{ uri: avatar as string }}
          {...p}
          style={css.WithSpace}
        />
        <View style={[css.Text, css.WithSpace]}>
          <View style={css.NameWithStatus}>
            <RnText black bold singleLine>
              {name || partyNumber || id}
            </RnText>
            {!!statusText && (
              <RnText normal singleLine small style={css.Status}>
                {statusText}
              </RnText>
            )}
          </View>
          {!isRecentCall && !!lastMessage && (
            <RnText normal singleLine small>
              {lastMessage}
            </RnText>
          )}
          {isRecentCall && !lastMessage && (
            <View style={css.Detail}>
              <RnIcon
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
              <RnText normal small style={css.CallCreatedAt}>
                {intl`at`} {created}
              </RnText>
            </View>
          )}
        </View>
        {!isRecentCall && !!lastMessage && isRecentChat && (
          <View style={css.LastDate}>
            <RnText normal singleLine small>
              {lastMessageDate}
            </RnText>
          </View>
        )}
        {icons?.map((v, i) => (
          <RnTouchableOpacity key={i} onPress={e => iconFuncs?.[i]?.()}>
            <RnIcon path={v} color={iconColors?.[i]} style={css.ButtonIcon} />
          </RnTouchableOpacity>
        ))}
      </View>
    </Container>
  )
}
export default UserItem
