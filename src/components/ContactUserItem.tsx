import {
  mdiAccountGroup,
  mdiGroup,
  mdiHomeGroup,
  mdiPhoneIncoming,
  mdiPhoneMissed,
  mdiPhoneOutgoing,
} from '@mdi/js'
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
  IconGroup: {},
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
  return (
    <Container
      style={css.Outer}
      onPress={() => Nav().goToPageChatDetail({ buddy: partyNumber })}
    >
      <View style={[css.Inner, selected && css.Inner_selected]}>
        {group ? (
          <RnIcon
            path={mdiAccountGroup}
            size={25}
            color={'black'}
            style={css.IconGroup}
          />
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

const iconGroup =
  'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%2224px%22%20height%3D%2224px%22%20viewBox%3D%220%200%2024%2024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3C!--%20Generator%3A%20Sketch%2051.2%20(57519)%20-%20http%3A%2F%2Fwww.bohemiancoding.com%2Fsketch%20--%3E%3Ctitle%3Eicon%2Fconference-foreground-selected%3C%2Ftitle%3E%3Cdesc%3ECreated%20with%20Sketch.%3C%2Fdesc%3E%3Cdefs%3E%3Cpath%20d%3D%22M12%2C8.66666665%20C10.8958333%2C8.66666665%209.99999999%2C9.56249998%209.99999999%2C10.6666667%20C9.99999999%2C11.7708333%2010.8958333%2C12.6666667%2012%2C12.6666667%20C13.1041667%2C12.6666667%2014%2C11.7708333%2014%2C10.6666667%20C14%2C9.56249998%2013.1041667%2C8.66666665%2012%2C8.66666665%20Z%20M6.99999997%2C9.33333332%20C6.0781253%2C9.33333332%205.33333329%2C10.0781253%205.33333329%2C11%20C5.33333329%2C11.9218753%206.0781253%2C12.6666667%206.99999997%2C12.6666667%20C7.92187531%2C12.6666667%208.66666665%2C11.9218753%208.66666665%2C11%20C8.66666665%2C10.0781253%207.92187531%2C9.33333332%206.99999997%2C9.33333332%20Z%20M17%2C9.33333332%20C16.0781254%2C9.33333332%2015.3333334%2C10.0781253%2015.3333334%2C11%20C15.3333334%2C11.9218753%2016.0781254%2C12.6666667%2017%2C12.6666667%20C17.9218754%2C12.6666667%2018.6666667%2C11.9218753%2018.6666667%2C11%20C18.6666667%2C10.0781253%2017.9218754%2C9.33333332%2017%2C9.33333332%20Z%20M6.99999997%2C10.6666667%20C7.18489597%2C10.6666667%207.3333333%2C10.815104%207.3333333%2C11%20C7.3333333%2C11.184896%207.18489597%2C11.3333333%206.99999997%2C11.3333333%20C6.81510397%2C11.3333333%206.66666663%2C11.184896%206.66666663%2C11%20C6.66666663%2C10.815104%206.81510397%2C10.6666667%206.99999997%2C10.6666667%20Z%20M17%2C10.6666667%20C17.184896%2C10.6666667%2017.3333334%2C10.815104%2017.3333334%2C11%20C17.3333334%2C11.184896%2017.184896%2C11.3333333%2017%2C11.3333333%20C16.815104%2C11.3333333%2016.6666667%2C11.184896%2016.6666667%2C11%20C16.6666667%2C10.815104%2016.815104%2C10.6666667%2017%2C10.6666667%20Z%20M6.93749997%2C13.3333333%20C4.58333329%2C13.3333333%203.99999995%2C15.3333334%203.99999995%2C15.3333334%20L3.99999995%2C16.6666667%20L7.99999997%2C16.6666667%20L7.99999997%2C15.4375%20L8.04166664%2C15.3333334%20L5.45833329%2C15.3333334%20C5.45833329%2C15.3333334%205.76041663%2C14.6666667%206.93749997%2C14.6666667%20C7.66145864%2C14.6666667%207.94791664%2C14.9114587%208.12499998%2C15.1041667%20C8.24479198%2C14.8489587%208.48697931%2C14.4192707%208.89583331%2C13.9791667%20C8.44791664%2C13.625%207.82552064%2C13.3333333%206.93749997%2C13.3333333%20Z%20M12%2C13.3333333%20C9.46874998%2C13.3333333%208.66666665%2C15.5625%208.66666665%2C15.5625%20L8.66666665%2C16.6666667%20L15.3333334%2C16.6666667%20L15.3333334%2C15.5625%20C15.3333334%2C15.5625%2014.53125%2C13.3333333%2012%2C13.3333333%20Z%20M17.0625%2C13.3333333%20C16.1744794%2C13.3333333%2015.5520834%2C13.625%2015.1041667%2C13.9791667%20C15.5130207%2C14.4192707%2015.7552087%2C14.8489587%2015.875%2C15.1041667%20C16.0546874%2C14.9114587%2016.338542%2C14.6666667%2017.0625%2C14.6666667%20C18.2395834%2C14.6666667%2018.5416667%2C15.3333334%2018.5416667%2C15.3333334%20L15.9583334%2C15.3333334%20L16%2C15.4375%20L16%2C16.6666667%20L20.0000001%2C16.6666667%20L20.0000001%2C15.3333334%20C20.0000001%2C15.3333334%2019.4166667%2C13.3333333%2017.0625%2C13.3333333%20Z%22%20id%3D%22path-1%22%3E%3C%2Fpath%3E%3C%2Fdefs%3E%3Cg%20id%3D%22icon%2Fconference-foreground-selected%22%20stroke%3D%22none%22%20stroke-width%3D%221%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cmask%20id%3D%22mask-2%22%20fill%3D%22white%22%3E%3Cuse%20xlink%3Ahref%3D%22%23path-1%22%3E%3C%2Fuse%3E%3C%2Fmask%3E%3Cg%20id%3D%22conference-foreground-selected%22%20fill-rule%3D%22nonzero%22%3E%3C%2Fg%3E%3Cg%20id%3D%22colors%2Fdefault%2Fblack%22%20mask%3D%22url(%23mask-2)%22%20fill%3D%22%23212121%22%3E%3Crect%20id%3D%22Rectangle%22%20x%3D%220%22%20y%3D%220%22%20width%3D%2224%22%20height%3D%2224%22%3E%3C%2Frect%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
