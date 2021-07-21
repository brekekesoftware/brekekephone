import {
  mdiAccountGroup,
  mdiPhoneIncoming,
  mdiPhoneMissed,
  mdiPhoneOutgoing,
} from '@mdi/js'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'

import { Conference } from '../api/brekekejs'
import uc, { Constants } from '../api/uc'
import chatStore from '../stores/chatStore'
import intl, { intlDebug } from '../stores/intl'
import Nav from '../stores/Nav'
import RnAlert from '../stores/RnAlert'
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
  IconGroup: {},
  VGroup: {
    overflow: 'hidden',
    backgroundColor: g.borderBg,
    width: 50,
    height: 50,
    borderRadius: 25,
    marginVertical: 5,
    alignItems: 'center',
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
    group: boolean
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
    if (partyNumber?.startsWith('uc')) {
      const groupId = partyNumber.replace('uc', '')
      isGroupAvailable(partyNumber.replace('uc', '')) &&
        Nav().goToPageChatGroupDetail({ groupId })
    } else {
      Nav().goToPageChatDetail({ buddy: partyNumber })
    }
  }

  const onPressIcons = (v: string, i: number) => {
    if (partyNumber?.startsWith('uc')) {
      isGroupAvailable(partyNumber.replace('uc', '')) && iconFuncs?.[i]?.()
    } else {
      iconFuncs?.[i]?.()
    }
  }

  const getGroupNameFromPartyNumber = (partyNumber: string | undefined) => {
    if (!partyNumber) {
      return
    }
    if (partyNumber?.startsWith('uc')) {
      const groupId = partyNumber.replace('uc', '')
      const groupInfo = chatStore.getGroupById(groupId)
      return groupInfo?.name || partyNumber
    } else {
      return partyNumber
    }
  }

  return (
    <Container style={css.Outer} onPress={onPressItem}>
      <View style={[css.Inner, selected && css.Inner_selected]}>
        {group ? (
          <View style={css.VGroup}>
            <RnIcon
              path={mdiAccountGroup}
              size={40}
              color={g.colors.greyTextChat}
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
              {name || getGroupNameFromPartyNumber(partyNumber) || id}
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
        {icons?.map((v, i) => (
          <RnTouchableOpacity key={i} onPress={e => onPressIcons(v, i)}>
            <RnIcon path={v} color={iconColors?.[i]} style={css.ButtonIcon} />
          </RnTouchableOpacity>
        ))}
      </View>
    </Container>
  )
}

export default UserItem
