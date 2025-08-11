import Clipboard from '@react-native-clipboard/clipboard'
import { decode } from 'html-entities'
import { isEmpty } from 'lodash'
import { observer } from 'mobx-react'
import type { FC, ReactNode } from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'

import {
  mdiAccountGroup,
  mdiContentCopy,
  mdiPhoneIncoming,
  mdiPhoneMissed,
  mdiPhoneOutgoing,
} from '#/assets/icons'
import type { Conference } from '#/brekekejs'
import { Constants } from '#/brekekejs/ucclient'
import { Avatar } from '#/components/Avatar'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/Rn'
import { RnCheckBox } from '#/components/RnCheckbox'
import { v } from '#/components/variables'
import { isWeb } from '#/config'
import type { Phonebook } from '#/stores/contactStore'
import { getPartyName } from '#/stores/contactStore'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import type { RnPickerOption } from '#/stores/RnPicker'
import { RnPicker } from '#/stores/RnPicker'

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
    ...Platform.select({
      web: {
        flex: 0,
        paddingLeft: 6,
        paddingRight: 10,
      },
    }),
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
  VGroup: {
    overflow: 'hidden',
    backgroundColor: v.borderBg,
    width: 50,
    height: 50,
    borderRadius: 25,
    marginVertical: 5,
    alignItems: 'center',
  },
  CheckboxContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 15,
  },
  disableContainer: {
    opacity: 0.5,
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
    canTouch: boolean
    group: boolean
    partyName: string
    isVoicemail?: boolean
    status?: string
    disabled?: boolean
    isSelection?: boolean
    isSelected?: boolean
    parkNumber?: string
    phonebook?: string
    reason?: string
    onSelect?: () => void
    phonebookInfo?: Phonebook
    onPress?: Function | undefined
  }>
> = observer(p0 => {
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
    canTouch,
    group,
    partyName,
    isVoicemail,
    disabled,
    isSelection,
    isSelected,
    parkNumber,
    phonebook,
    reason,
    onSelect,
    phonebookInfo,
    onPress,
    ...p
  } = p0

  // pressable for web with onLongPress
  const Container = canTouch ? (isWeb ? Pressable : RnTouchableOpacity) : View

  const isGroupAvailable = (groupId: string) => {
    const groupInfo: Conference = ctx.uc.getChatGroupInfo(groupId)
    const groupStatus = groupInfo.conf_status
    if (
      groupStatus === Constants.CONF_STATUS_INACTIVE ||
      groupStatus === Constants.CONF_STATUS_INVITED
    ) {
      RnAlert.error({
        message: intlDebug`You have rejected this group or it has been deleted`,
      })
      return false
    } else {
      return true
    }
  }
  const onPressItem = () => {
    if (onPress) {
      return onPress()
    }
    if (!partyNumber) {
      return
    }
    if (partyNumber.startsWith('uc')) {
      const groupId = partyNumber.replace('uc', '')
      if (isGroupAvailable(partyNumber.replace('uc', ''))) {
        ctx.nav.goToPageChatGroupDetail({ groupId })
      }
    } else {
      ctx.nav.goToPageChatDetail({ buddy: partyNumber })
    }
  }

  const onPressIcons = (i: number) => {
    if (partyNumber?.startsWith('uc')) {
      if (isGroupAvailable(partyNumber.replace('uc', ''))) {
        iconFuncs?.[i]?.()
      }
    } else {
      iconFuncs?.[i]?.()
    }
  }

  const onLongPressItem = async () => {
    if (phonebookInfo && isEmpty(phonebookInfo?.info)) {
      const pb = await ctx.pbx.getContact(phonebookInfo.id)
      ctx.contact.upsertPhonebook(pb as Phonebook)
      Object.assign(phonebookInfo, pb)
    }
    const number = partyNumber ?? id
    const numbers = [
      number,
      phonebookInfo?.info?.$tel_home,
      phonebookInfo?.info?.$tel_mobile,
      phonebookInfo?.info?.$tel_work,
    ]
    const options: RnPickerOption['options'] = []
    numbers.forEach((value, index) => {
      // maybe value is '0'
      if (value !== null && value !== undefined && value !== '') {
        options.push({
          key: value,
          label: value,
          icon: mdiContentCopy,
        })
      }
    })

    if (!options.length) {
      return
    }
    RnPicker.open({
      options,
      onSelect: (n: string) => Clipboard.setString(n),
    })
  }

  return (
    <Container
      style={[css.Outer, disabled && css.disableContainer]}
      onPress={onPressItem}
      onLongPress={onLongPressItem}
    >
      <View style={[css.Inner, selected && css.Inner_selected]}>
        {group ? (
          <View style={css.VGroup}>
            <RnIcon
              path={mdiAccountGroup}
              size={40}
              color={v.colors.greyTextChat}
            />
          </View>
        ) : !parkNumber ? (
          <Avatar
            source={{ uri: avatar as string }}
            status={p0.status}
            {...p}
            style={css.WithSpace}
          />
        ) : null}
        <View style={[css.Text, css.WithSpace]}>
          <View style={css.NameWithStatus}>
            <RnText
              black
              bold
              singleLine
              style={{
                color:
                  name === intl`<Unnamed>` ? v.colors.greyTextChat : 'black',
              }}
            >
              {partyName ||
                name ||
                getPartyName({ partyNumber }) ||
                partyNumber ||
                id}
            </RnText>
            {!!statusText && (
              <RnText normal singleLine small style={css.Status}>
                {statusText}
              </RnText>
            )}
          </View>
          {!!parkNumber && (
            <RnText normal small style={css.CallCreatedAt}>
              {intl`Park number: ` + `${parkNumber}`}
            </RnText>
          )}

          {!!phonebook && (
            <RnText normal small style={css.CallCreatedAt}>
              {phonebook}
            </RnText>
          )}
          {!isRecentCall && !!lastMessage && (
            <RnText normal singleLine small>
              {typeof lastMessage === 'string'
                ? decode(lastMessage.trim())
                : lastMessage}
            </RnText>
          )}
          {((isRecentCall && !lastMessage) || isVoicemail) && (
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
                {isVoicemail
                  ? intl`Voicemail`
                  : intl`${reason}${reason ? ' ' : ''}at ${created}`}
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
          <RnTouchableOpacity
            useDebounce={!!iconFuncs}
            key={i}
            onPress={e => onPressIcons(i)}
          >
            <RnIcon path={_} color={iconColors?.[i]} style={css.ButtonIcon} />
          </RnTouchableOpacity>
        ))}

        {!!isSelection && (
          <View style={css.CheckboxContainer}>
            <RnCheckBox
              isSelected={!!isSelected}
              onPress={() => (onSelect ? onSelect() : true)}
              disabled={disabled || false}
            />
          </View>
        )}
      </View>
    </Container>
  )
})
