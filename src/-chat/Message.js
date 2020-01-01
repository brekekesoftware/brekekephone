import { mdiCheck, mdiClose, mdiFile } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';
import Progress from 'react-native-progress-circle';

import g from '../global';
import { Image, StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Avatar from '../shared/Avatar';
import Icon from '../shared/Icon';

const css = StyleSheet.create({
  Message: {
    borderBottomWidth: 1,
    borderColor: g.borderBg,
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
    fontSize: g.fontSizeSubTitle,
    color: g.subColor,
  },
  Message_Info__Time: {
    fontSize: g.fontSizeSmall,
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
    borderColor: g.subColor,
  },
  Message_File_Status: {},
});

const File = p => (
  <View style={css.Message_File}>
    {p.source && p.fileType === `image` && (
      <Image source={p.source} style={css.Message_File__Image} />
    )}
    {p.fileType !== `image` && (
      <View>
        <Icon path={mdiFile} size={50} />
        <View style={css.Message_File_Info}>
          <Text numberOfLines={1}>{p.name}</Text>
          <Text>{p.size}</Text>
        </View>
      </View>
    )}
    {p.state === `waiting` && (
      <TouchableOpacity onPress={p.reject} style={[css.Message_File_Btn]}>
        <Icon color={g.colors.danger} path={mdiClose} />
      </TouchableOpacity>
    )}
    {p.incoming && p.state === `waiting` && (
      <TouchableOpacity onPress={p.accept} style={[css.Message_File_Btn]}>
        <Icon color={g.colors.primary} path={mdiCheck} />
      </TouchableOpacity>
    )}
    {p.state === `started` && (
      <TouchableOpacity onPress={p.reject} style={[css.Message_File_Btn]}>
        <Progress
          bgColor={g.bg}
          borderWidth={1 * 2}
          color={g.colors.primary}
          percent={p.state === `percent`}
          radius={g.fontSizeSubTitle}
          shadowColor={g.bg}
        >
          <Icon color={g.colors.danger} path={mdiClose} />
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
      css.Message,
      p.last && css.Message__last,
      css.Message__height90,
      p.file && css.Message__height150,
    ]}
  >
    <Avatar source={{ uri: p.creatorAvatar }} {...p} />
    <View style={css.Message_Text}>
      <View style={css.Message_Info}>
        <Text style={css.Message_Info__Name}>{p.creatorName}</Text>
        <Text style={css.Message_Info__Time}>{p.created}</Text>
      </View>
      {!!p.text && <Text numberOfLines={999}>{p.text}</Text>}
      {!!p.file && (
        <File
          {...p.file}
          accept={() => p.acceptFile(p.file)}
          fileType={p.fileType}
          reject={() => p.rejectFile(p.file)}
          source={p.showImage}
        />
      )}
    </View>
  </View>
));

export default Message;
