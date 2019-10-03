import { mdiCheck, mdiClose, mdiFile } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';
import Progress from 'react-native-progress-circle';

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
  },
  Message__height90: {
    height: 90,
  },
  Message__height150: {
    height: 150,
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
    alignItems: `stretch`,
    left: 60,
    top: 10,
    right: 10,
  },
  Message_Avatar: {
    position: `absolute`,
    left: 15,
    top: 20,
  },
  Message_File: {
    flexDirection: `row`,
    marginTop: 10,
  },
  Message_File_Info: {
    marginLeft: 5,
  },
  Message_File_Info__name: {},
  Message_File__Image: {
    width: 75,
    height: 75,
  },
  Message_File_Btn: {
    borderWidth: 1 / 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 20,
    borderColor: v.subColor,
  },
  Message_File_Status: {},
});

const File = p => (
  <View style={s.Message_File}>
    {p.source && p.fileType === `image` && (
      <FastImage style={s.Message_File__Image} source={p.source} />
    )}
    {p.fileType !== `image` && (
      <View>
        <Icon path={mdiFile} size={50} />
        <View style={s.Message_File_Info}>
          <Text numberOfLines={1}>{p.name}</Text>
          <Text>{p.size}</Text>
        </View>
      </View>
    )}
    {p.state === `waiting` && (
      <TouchableOpacity style={[s.Message_File_Btn]} onPress={p.reject}>
        <Icon path={mdiClose} color={v.redBg} />
      </TouchableOpacity>
    )}
    {p.incoming && p.state === `waiting` && (
      <TouchableOpacity style={[s.Message_File_Btn]} onPress={p.accept}>
        <Icon path={mdiCheck} color={v.mainBg} />
      </TouchableOpacity>
    )}
    {p.state === `started` && (
      <TouchableOpacity style={[s.Message_File_Btn]} onPress={p.reject}>
        <Progress
          percent={p.state === `percent`}
          radius={v.fontSizeSubTitle}
          borderWidth={1 * 2}
          color={v.mainBg}
          shadowColor={v.bg}
          bgColor={v.bg}
        >
          <Icon path={mdiClose} color={v.redBg} />
        </Progress>
      </TouchableOpacity>
    )}
    {p.state === `success` && <Text>Success</Text>}
    {p.state === `failure` && <Text>Failed</Text>}
    {p.state === `stopped` && <Text>Canceled</Text>}
  </View>
);

const Message = observer(p => (
  <View
    style={[
      s.Message,
      p.last && s.Message__last,
      s.Message__height90,
      p.file && s.Message__height150,
    ]}
  >
    <Avatar source={{ uri: p.creatorAvatar }} {...p} />
    <View style={s.Message_Text}>
      <View style={s.Message_Info}>
        <Text style={s.Message_Info__Name}>{p.creatorName}</Text>
        <Text style={s.Message_Info__Time}>{p.created}</Text>
      </View>
      {!!p.text && <Text numberOfLines={999}>{p.text}</Text>}
      {!!p.file && (
        <File
          {...p.file}
          source={p.showImage}
          fileType={p.fileType}
          accept={() => p.acceptFile(p.file)}
          reject={() => p.rejectFile(p.file)}
        />
      )}
    </View>
  </View>
));

export default Message;
