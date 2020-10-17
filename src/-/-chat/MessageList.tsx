import sortBy from 'lodash/sortBy'
import uniqBy from 'lodash/uniqBy'
import { observer } from 'mobx-react'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import g from '../global'
import { RnText } from '../Rn'
import Avatar from '../shared/Avatar'
import { groupByTimestamp } from './config'
import Message from './Message'

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
    top: g.lineHeight / 2,
    left: 2,
    right: 2,
    height: 1,
    backgroundColor: g.hoverBg,
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
    color: g.subColor,
    fontSize: g.fontSizeSmall,
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

const MessageList = observer(p => {
  let { acceptFile, list, loadMore, rejectFile, resolveChat } = p
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
          {(groupByTime as Array<{
            messages: any
            time: any
          }>).map(({ messages, time }, j) => {
            const id = messages[0]?.id
            const c0 = resolveChat(id)
            const name = c0?.creatorName
            return (
              <View
                key={`${time}${id}`}
                style={[css.TimeGroup, !j && css.TimeGroup__first]}
              >
                <Avatar imgSource={c0.creatorAvatar} />
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

export default MessageList
