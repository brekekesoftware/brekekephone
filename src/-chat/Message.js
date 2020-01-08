import { mdiCheck, mdiClose, mdiFile } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';
import Progress from 'react-native-progress-circle';

import { Icon, Image, StyleSheet, Text, TouchableOpacity, View } from '../-/Rn';
import g from '../global';

const css = StyleSheet.create({
  Outer: {
    flexDirection: `row-reverse`,
  },
  Outer__createdByMe: {
    flexDirection: `row`,
  },
  Space: {
    width: 20,
  },
  SpaceFill: {
    flex: 1,
  },
  Message: {
    alignSelf: `flex-start`,
    left: -5,
    marginBottom: 2,
    borderRadius: g.borderRadius,
    paddingVertical: 5,
    paddingLeft: 15,
    paddingRight: 10,
    backgroundColor: g.hoverBg,
    overflow: `hidden`,
  },
  Message__createdByMe: {
    alignSelf: `flex-end`,
    left: 5,
    paddingLeft: 10,
    paddingRight: 15,
    backgroundColor: g.colors.primary,
    color: `white`,
  },
  //
  File: {
    flexDirection: `row`,
    marginTop: 10,
  },
  Message_File_Info: {
    marginLeft: 5,
  },
  Image: {
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
});

const File = p => (
  <View style={css.File}>
    {!!p.source && p.fileType === `image` && (
      <Image source={p.source} style={css.Image} />
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
      <TouchableOpacity onPress={p.reject} style={css.Message_File_Btn}>
        <Icon color={g.colors.danger} path={mdiClose} />
      </TouchableOpacity>
    )}
    {!!p.incoming && p.state === `waiting` && (
      <TouchableOpacity onPress={p.accept} style={css.Message_File_Btn}>
        <Icon color={g.colors.primary} path={mdiCheck} />
      </TouchableOpacity>
    )}
    {p.state === `started` && (
      <TouchableOpacity onPress={p.reject} style={css.Message_File_Btn}>
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
  <React.Fragment>
    {!!p.text && (
      <View style={[css.Outer, p.createdByMe && css.Outer__createdByMe]}>
        <View style={css.Space} />
        <View style={css.SpaceFill} />
        <Text style={[css.Message, p.createdByMe && css.Message__createdByMe]}>
          {p.text}
        </Text>
      </View>
    )}
    {!!p.file && (
      <File
        {...p.file}
        accept={() => p.acceptFile(p.file)}
        fileType={p.fileType}
        reject={() => p.rejectFile(p.file)}
        source={p.showImage}
      />
    )}
  </React.Fragment>
));

export default Message;
