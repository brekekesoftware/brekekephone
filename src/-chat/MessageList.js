import React from 'react';

import { StyleSheet, Text, View } from '../-/Rn';
import g from '../global';
import { groupByTimestamp } from './config';
import Message from './Message';

const css = StyleSheet.create({
  Date: {
    marginTop: 20,
  },
  Date__first: {
    marginTop: 0,
  },
  DateText: {
    alignSelf: `center`,
    backgroundColor: `white`,
    paddingHorizontal: 10,
  },
  //
  Border: {
    position: `absolute`,
    top: g.lineHeight / 2,
    left: 2,
    right: 2,
    height: 1,
    backgroundColor: g.hoverBg,
  },
  //
  Time: {
    marginTop: 10,
  },
  Time__first: {
    marginTop: 0,
  },
  TimeText: {
    paddingHorizontal: 2,
    color: g.subColor,
    fontSize: g.fontSizeSmall,
  },
});

const MessageList = ({ list, ...p }) =>
  groupByTimestamp(list || []).map(({ date, groupByTime }, i) => (
    <View key={date} style={[css.Date, !i && css.Date__first]}>
      <View style={css.Border} />
      <Text style={css.DateText}>{date}</Text>
      {groupByTime.map(({ createdByMe, messages, time }, j) => (
        <View key={time} style={[css.Time, !j && css.Time__first]}>
          <Text right={createdByMe} style={css.TimeText}>
            {time}
          </Text>
          {messages.map(m => (
            <Message
              key={m.id}
              {...p.resolveChat(m.id)}
              acceptFile={p.acceptFile}
              fileType={p.fileType}
              loadMore={p.loadMore}
              rejectFile={p.rejectFile}
              showImage={p.showImage}
            />
          ))}
        </View>
      ))}
    </View>
  ));

export default MessageList;
