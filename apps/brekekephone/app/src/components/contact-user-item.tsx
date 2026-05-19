import Clipboard from '@react-native-clipboard/clipboard'
import { decode } from 'html-entities'
import { observer } from 'mobx-react'
import type { FC, ReactNode } from 'react'
import { Platform, Pressable, View as RNView } from 'react-native'
import { isEmpty } from '@/shared/lodash'

import { View } from '@/rn/core/components/view'
import {
  mdiAccountGroup,
  mdiContentCopy,
  mdiPhoneIncoming,
  mdiPhoneMissed,
  mdiPhoneOutgoing,
} from '#/assets/icons'
import type { Conference } from '#/brekekejs'
import { Constants } from '#/brekekejs/ucclient'
import { Avatar } from '#/components/avatar'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { RnCheckBox } from '#/components/rn-checkbox'
import { v } from '#/components/variables'
import { isWeb } from '#/config'
import type { Phonebook } from '#/stores/contact-store'
import { getPbxName } from '#/stores/contact-store'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import type { RnPickerOption } from '#/stores/rn-picker'
import { RnPicker } from '#/stores/rn-picker'

const callIconStyle = {
  flex: null as any,
  ...Platform.select({
    web: {
      flex: 0,
      paddingLeft: 6,
      paddingRight: 10,
    },
  }),
}

export const UserItem: FC<
  Partial<{
    answered: boolean
    avatar: string
    created: string
    icons: string[]
    iconColors: string[]
    iconFuncs: Function[]
    loadings?: number[] | true
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
    loadings,
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
  const Container = canTouch ? (isWeb ? Pressable : RnTouchableOpacity) : RNView

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
      style={{ borderBottomWidth: 1, borderColor: v.borderBg, opacity: disabled ? 0.5 : 1 }}
      onPress={onPressItem}
      onLongPress={onLongPressItem}
    >
      <View
        className={['flex-row pl-2.5', selected && 'bg-primary-100']}
      >
        {group ? (
          <View className='overflow-hidden bg-border w-12.5 h-12.5 rounded-full my-1.25 items-center'>
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
            className='my-1.25'
          />
        ) : null}
        <View className='flex-1 pt-1.75 pl-2.5 my-1.25'>
          <View className='flex-row flex-nowrap'>
            <RnText
              bold
              singleLine
              className={
                name === intl`<Unnamed>` ? 'text-[#9e9e9e]' : 'text-black'
              }
            >
              {partyName ||
                name ||
                getPbxName({ partyNumber }) ||
                partyNumber ||
                id}
            </RnText>
            {!!statusText && (
              <RnText
                normal
                singleLine
                small
                className='top-0.5 left-0.75 text-foreground-muted'
              >
                {statusText}
              </RnText>
            )}
          </View>
          {!!parkNumber && (
            <RnText normal small className='left-0.75 text-foreground-muted'>
              {intl`Park number: ` + `${parkNumber}`}
            </RnText>
          )}

          {!!phonebook && (
            <RnText normal small className='left-0.75 text-foreground-muted'>
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
            <View className='flex-row'>
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
                style={callIconStyle}
              />
              <RnText normal small className='left-0.75 text-foreground-muted'>
                {isVoicemail
                  ? intl`Voicemail`
                  : intl`${reason} at ${created}`.trim()}
              </RnText>
            </View>
          )}
        </View>
        {!isRecentCall && !!lastMessage && isRecentChat && (
          <View className='my-2.5 mr-3.75 pt-1.75'>
            <RnText normal singleLine small>
              {lastMessageDate}
            </RnText>
          </View>
        )}
        {icons?.map((_, i) => (
          <RnTouchableOpacity
            disabled={ctx.call.isStartingCall}
            loading={loadings === true || loadings?.[i]}
            key={i}
            onPress={() => onPressIcons(i)}
          >
            <RnIcon path={_} color={iconColors?.[i]} className='p-2.5' />
          </RnTouchableOpacity>
        ))}

        {!!isSelection && (
          <View className='items-center flex-row mr-3.75'>
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
