import {
  mdiAccountGroup,
  mdiPhoneIncoming,
  mdiPhoneMissed,
  mdiPhoneOutgoing,
} from '@mdi/js'
import React, { FC, ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { Conference } from '../api/brekekejs'
import { Constants, uc } from '../api/uc'
import { contactStore } from '../stores/contactStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { Avatar } from './Avatar'
import { RnIcon, RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  Outer: {
    borderBottomWidth: 1,
    borderColor: v.borderBg,
  },
  Inner: {
    flexDirection: 'row',
    paddingLeft: 10,
  },
  Inner_selected: {
    backgroundColor: v.colors.primaryFn(0.5),
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
    color: v.subColor,
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
    color: v.subColor,
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
  IconGroup: {},
  VGroup: {
    overflow: 'hidden',
    backgroundColor: v.borderBg,
    width: 50,
    height: 50,
    borderRadius: 25,
    marginVertical: 5,
    alignItems: 'center',
  },
})

export const UserItem: FC<
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
    lastMessage: ReactNode
    lastMessageDate: string
    name: string
    partyNumber: string
    selected: boolean
    statusText: string
    canChat: boolean
    group: boolean
    partyName: string
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
    group,
    partyName,
    ...p
  } = p0
  const Container = canChat ? RnTouchableOpacity : View

  const isGroupAvailable = (groupId: string) => {
    const groupInfo: Conference = uc.getChatGroupInfo(groupId)
    const groupStatus = groupInfo.conf_status
    if (
      groupStatus === Constants.CONF_STATUS_INACTIVE ||
      groupStatus === Constants.CONF_STATUS_INVITED
    ) {
      RnAlert.error({
        message: intlDebug`You have rejected this group or this group has been deleted`,
      })
      return false
    } else {
      return true
    }
  }
  const onPressItem = () => {
    if (!partyNumber) {
      return
    }
    if (partyNumber.startsWith('uc')) {
      const groupId = partyNumber.replace('uc', '')
      isGroupAvailable(partyNumber.replace('uc', '')) &&
        Nav().goToPageChatGroupDetail({ groupId })
    } else {
      Nav().goToPageChatDetail({ buddy: partyNumber })
    }
  }

  const onPressIcons = (i: number) => {
    if (partyNumber?.startsWith('uc')) {
      isGroupAvailable(partyNumber.replace('uc', '')) && iconFuncs?.[i]?.()
    } else {
      iconFuncs?.[i]?.()
    }
  }
  const template = name || partyName || partyNumber || id
  // check phone exists inside contacts to display origin name
  const displayName =
    contactStore.getPhoneBookByPhoneNumber(template)?.name || template

  return (
    <Container style={css.Outer} onPress={onPressItem}>
      <View style={[css.Inner, selected && css.Inner_selected]}>
        {group ? (
          <View style={css.VGroup}>
            <RnIcon
              path={mdiAccountGroup}
              size={40}
              color={v.colors.greyTextChat}
              style={css.IconGroup}
            />
          </View>
        ) : (
          <Avatar
            source={{ uri: avatar as string }}
            {...p}
            style={css.WithSpace}
          />
        )}
        <View style={[css.Text, css.WithSpace]}>
          <View style={css.NameWithStatus}>
            <RnText black bold singleLine>
              {displayName}
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
                    ? v.colors.danger
                    : incoming && answered
                    ? v.colors.primary
                    : v.colors.warning
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
                {intl`at ${created}`}
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
        {icons?.map((_, i) => (
          <RnTouchableOpacity key={i} onPress={e => onPressIcons(i)}>
            <RnIcon path={_} color={iconColors?.[i]} style={css.ButtonIcon} />
          </RnTouchableOpacity>
        ))}
      </View>
    </Container>
  )
}
