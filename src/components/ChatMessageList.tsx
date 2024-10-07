import { sortBy, uniqBy } from 'lodash'
import { observer } from 'mobx-react'
import type { FC } from 'react'
import { StyleSheet, View } from 'react-native'

import type { ChatMessage } from '../stores/chatStore'
import { contactStore } from '../stores/contactStore'
import { Avatar } from './Avatar'
import { groupByTimestamp } from './chatConfig'
import { Message } from './ChatMessage'
import { RnText } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  DateGroup: {
    marginTop: 20,
  },
  DateGroup__first: {
    marginTop: 0,
  },
  Date: {
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
  //
  Border: {
    position: 'absolute',
    top: v.lineHeight / 2,
    left: 2,
    right: 2,
    height: 1,
    backgroundColor: v.hoverBg,
  },
  //
  TimeGroup: {
    flexDirection: 'row',
    marginTop: 10,
    paddingLeft: 10,
  },
  TimeGroup__first: {
    marginTop: 0,
    paddingLeft: 10,
  },
  Time: {
    paddingHorizontal: 4,
    color: v.subColor,
    fontSize: v.fontSizeSmall,
  },
  //
  Creator: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingLeft: 10,
  },
  Right: {
    flexDirection: 'column',
  },
})

export const MessageList: FC<{
  acceptFile: Function
  list: ChatMessage[]
  loadMore: Function
  rejectFile: Function
  resolveChat: Function
  isGroupChat?: boolean
}> = observer(p => {
  const { acceptFile, loadMore, rejectFile, resolveChat } = p
  let { list } = p
  // TODO unique and sort right after fetching
  if (!Array.isArray(list)) {
    list = []
  }
  list = uniqBy(list, 'id')
  list = sortBy(list, 'created')

  return (
    <>
      {groupByTimestamp(list).map(({ date, groupByTime }, i) => (
        <View key={date} style={[css.DateGroup, !i && css.DateGroup__first]}>
          <View style={css.Border} />
          <RnText style={css.Date}>{date}</RnText>
          {groupByTime.map(({ messages, time }, j) => {
            const id = messages[0]?.id
            const c0 = resolveChat(id) as ChatMessage & {
              creatorName: string
              creatorAvatar: string
              creatorId: string
            }
            const name = c0?.creatorName
            const status = contactStore.getUcUserById(c0.creatorId)?.status
            return (
              <View
                key={`${time}${id}`}
                style={[css.TimeGroup, !j && css.TimeGroup__first]}
              >
                <Avatar
                  source={{ uri: c0.creatorAvatar as string }}
                  status={status}
                />
                <View style={css.Right}>
                  <View style={css.Creator}>
                    <RnText bold singleLine>
                      {name}
                    </RnText>
                    <RnText style={css.Time}>{time}</RnText>
                  </View>
                  <View>
                    {messages.map(m => (
                      <Message
                        {...resolveChat(m.id)}
                        acceptFile={acceptFile}
                        key={m.id}
                        loadMore={loadMore}
                        rejectFile={rejectFile}
                      />
                    ))}
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      ))}
    </>
  )
})
