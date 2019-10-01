import { mdiCheck, mdiClose } from '@mdi/js';
import React from 'react';
import Progress from 'react-native-progress-circle';

import { std } from '../-/styleguide';
import FastImage from '../native/FastImage';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Avatar from '../shared/Avatar';
import Icon from '../shared/Icon';
import v from '../variables';

const s = StyleSheet.create({
  Message: {
    borderBottomWidth: 1,
    borderColor: v.borderBg,
    alignItems: `stretch`,
    marginLeft: 15,
    height: 90,
  },
  Message__last: {
    borderBottomWidth: 0,
  },
  Message_Info: {
    flexDirection: `row`,
  },
  Message_Info__Name: {
    fontSize: v.fontSizeSubTitle,
    color: v.subColor,
  },
  Message_Info__Time: {
    fontSize: v.fontSizeSmall,
    marginLeft: 10,
  },
  Message_Text: {
    position: `absolute`,
    left: 60,
    top: 10,
  },
  Message_Avatar: {
    position: `absolute`,
    left: 15,
    top: 20,
  },
  Message_Image: {
    width: 50,
    height: 50,
  },
});

const File = p => (
  <View>
    <FastImage style={s.Message_Image} source={p.source} />
    <View>
      <Text>{p.name}</Text>
      <Text>{p.size}</Text>
    </View>
    {p.state === `waiting` && (
      <TouchableOpacity onPress={p.reject}>
        <Icon path={mdiClose} />
      </TouchableOpacity>
    )}
    {p.incoming && p.state === `waiting` && (
      <TouchableOpacity onPress={p.accept}>
        <Icon path={mdiCheck} />
      </TouchableOpacity>
    )}
    {p.state === `started` && (
      <TouchableOpacity onPress={p.reject}>
        <Progress
          percent={p.state === `percent`}
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
    {p.state === `success` && <Text>Success</Text>}
    {p.state === `failure` && <Text>Failed</Text>}
    {p.state === `stopped` && <Text>Canceled</Text>}
  </View>
);

const Message = p => (
  <View style={[s.Message, p.last && s.Message__last]}>
    <Avatar source={{ uri: p.creatorAvatar }} {...p} />
    <View style={s.Message_Text}>
      <View style={s.Message_Info}>
        <Text style={s.Message_Info__Name}>{p.creatorName}</Text>
        <Text style={s.Message_Info__Time}>{p.created}</Text>
      </View>
      <View>
        {!!p.text && <Text numberOfLines={999}>{p.text}</Text>}
        {!!p.file && (
          <File
            source={p.urlImage}
            {...p.file}
            accept={() => p.acceptFile(p.file)}
            reject={() => p.rejectFile(p.file)}
          />
        )}
      </View>
    </View>
  </View>
);

export default Message;
