import { observer } from 'mobx-react'
import { FC, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { Constants, uc } from '../api/uc'
import { mdiClose } from '../assets/icons'
import { Conference } from '../brekekejs'
import { chatStore } from '../stores/chatStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { Duration } from '../stores/timerStore'
import { RnIcon, RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  Row: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: v.borderBg,
  },
  Column: {
    // flex:1,
    padding: 5,
  },
  BtnText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    minWidth: 80,
    backgroundColor: v.colors.primary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  Text: {
    paddingLeft: 10,
    paddingHorizontal: 5,
    paddingVertical: 10,
    textAlign: 'left',
    minWidth: 80,
  },
  TextMessage: {
    flex: 1,
  },
  icon: {
    padding: 10,
  },
  bgUnread: {
    backgroundColor: v.colors.primaryFn(0.5),
  },
})

export const WebchatItem: FC<{
  data: Conference
}> = observer(({ data }) => {
  // const data = p.webchat
  // CONF_STATUS_INACTIVE: 0 => disable all , show close
  // CONF_STATUS_INVITED: 1 => enabled join
  // CONF_STATUS_JOINED: 2 => enable show
  // CONF_STATUS_INVITED_WEBCHAT: 5 => enabled answer
  const messages = chatStore.getMessagesByThreadId(data.conf_id)
  const isEnabledAnswer =
    data.conf_status === Constants.CONF_STATUS_INVITED_WEBCHAT
  const isEnabledJoin = data.conf_status === Constants.CONF_STATUS_INVITED
  const isDisplayClose = data.conf_status === Constants.CONF_STATUS_INACTIVE
  const isDisplayShow = data.conf_status === Constants.CONF_STATUS_JOINED
  const textDisplay = messages.slice(Math.max(messages.length - 5, 0))

  const answerPress = useCallback(() => {
    uc.answerWebchatConference(data.conf_id)
    Nav().goToPageChatGroupDetail({ groupId: data.conf_id })
  }, [data.conf_id])

  const showPress = useCallback(() => {
    Nav().goToPageChatGroupDetail({ groupId: data.conf_id })
  }, [data.conf_id])

  const joinPress = useCallback(() => {
    uc.joinWebchatConference(data.conf_id)
    Nav().goToPageChatGroupDetail({ groupId: data.conf_id })
  }, [data.conf_id])

  const closePress = useCallback(() => {
    chatStore.removeWebchatItem(data.conf_id)
  }, [data.conf_id])

  return (
    <View style={[css.Row, isEnabledAnswer ? css.bgUnread : null]}>
      <View style={css.Column}>
        {isEnabledAnswer ? (
          <RnTouchableOpacity onPress={answerPress} style={css.BtnText}>
            <RnText normal white bold>
              {intl`Answer`}
            </RnText>
          </RnTouchableOpacity>
        ) : (
          <RnTouchableOpacity
            // disabled={!isDisplayShow}
            onPress={showPress}
            style={[
              css.BtnText,
              { backgroundColor: isDisplayShow ? v.layerBg : v.borderBg },
            ]}
          >
            <RnText normal white bold>
              {intl`Show`}
            </RnText>
          </RnTouchableOpacity>
        )}
        <RnTouchableOpacity
          disabled={!isEnabledJoin}
          onPress={joinPress}
          style={[
            css.BtnText,
            { backgroundColor: isEnabledJoin ? v.layerBg : v.borderBg },
          ]}
        >
          <RnText normal white bold>
            {intl`Join`}
          </RnText>
        </RnTouchableOpacity>
      </View>
      {!isEnabledAnswer ? (
        <RnText normal singleLine small style={css.Text}>
          {data.assigned.user_id || ''}
        </RnText>
      ) : (
        <Duration normal singleLine small style={css.Text}>
          {data.created_tstamp}
        </Duration>
      )}

      <RnText normal singleLine small style={css.Text}>
        {data.webchatinfo.profinfo_formatted || ''}
      </RnText>
      <RnText
        normal
        small
        style={[css.Text, css.TextMessage]}
        // numberOfLines={5}
      >
        {textDisplay.map((text, i, { length }) => {
          return `${text.text}${i === length - 1 ? '' : '\n'}`
        })}
      </RnText>
      {isDisplayClose && (
        <RnTouchableOpacity onPress={closePress}>
          <RnIcon path={mdiClose} style={css.icon} />
        </RnTouchableOpacity>
      )}
    </View>
  )
})
