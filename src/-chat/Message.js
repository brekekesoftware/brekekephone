import { mdiCheck, mdiClose } from '@mdi/js';
import React from 'react';
import Progress from 'react-native-progress-circle';

import { std } from '../-/styleguide';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Avatar from '../shared/Avatar';
import Icon from '../shared/Icon';
import v from '../variables';

const s = StyleSheet.create({
  Message: {
    borderBottomWidth: 1,
    borderColor: v.borderBg,
    height: 80,
    alignItems: 'stretch',
    marginLeft: 15,
  },
  Message__last: {
    borderBottomWidth: 0,
  },
  Message_Info: {
    flexDirection: 'row',
    position: 'absolute',
    top: 20,
    left: 70,
  },
  Message_Name: {
    position: 'absolute',
    top: 20,
    left: 70,
    fontSize: v.fontSizeSubTitle,
    color: v.subColor,
  },
  Message_Detail: {
    flexDirection: 'row',
    position: 'absolute',
    top: 50,
    left: 70,
    fontSize: v.fontSizeSmall,
    color: v.subColor,
  },
  Message_Detail_Text: {
    paddingLeft: 10,
  },
  Message_Icon: {
    position: 'absolute',
    flexDirection: 'row',
    top: 20,
    right: 15,
  },
  Message_Icon__pd: {
    paddingLeft: 20,
  },
});

const File = p => (
  <View>
    <View>
      <Text>{p.name}</Text>
      <Text>{p.size}</Text>
    </View>
    {p.state === 'waiting' && (
      <TouchableOpacity onPress={p.reject}>
        <Icon path={mdiClose} />
      </TouchableOpacity>
    )}
    {p.incoming && p.state === 'waiting' && (
      <TouchableOpacity onPress={p.accept}>
        <Icon path={mdiCheck} />
      </TouchableOpacity>
    )}
    {p.state === 'started' && (
      <TouchableOpacity onPress={p.reject}>
        <Progress
          percent={p.state === 'percent'}
          radius={std.iconSize.md}
          borderWidth={1 * 2}
          color={std.color.notice}
          shadowColor={std.color.shade4}
          bgColor={std.color.shade0}
        >
          <Icon path={mdiClose} />
        </Progress>
      </TouchableOpacity>
    )}
    {p.state === 'success' && <Text>Success</Text>}
    {p.state === 'failure' && <Text>Failed</Text>}
    {p.state === 'stopped' && <Text>Canceled</Text>}
  </View>
);

const Message = p => (
  <View style={[s.Message, p.last && s.Message__last]}>
    <Avatar source={{ uri: p.avatar }} {...p} />
    <View style={s.Message_Info}>
      <Text>{p.name || p.partyNumber}</Text>
      <Text>9:00 Aug</Text>
    </View>
    {!!p.text && <Text numberOfLines={999}>{p.text}</Text>}
    {!!p.file && (
      <File
        {...p.file}
        accept={() => p.acceptFile(p.file)}
        reject={() => p.rejectFile(p.file)}
      />
    )}
  </View>
);

export default Message;
