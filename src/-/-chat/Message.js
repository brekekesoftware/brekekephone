import { mdiCheck, mdiClose, mdiFile } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';
import Linkify from 'react-linkify';

import g from '../global';
import intl from '../intl/intl';
import {
  Dimensions,
  Icon,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../Rn';

const css = StyleSheet.create({
  Outer: {
    flexDirection: 'row',
  },
  Message: {
    position: 'relative',
    marginBottom: 2,
    borderRadius: 2 * g.borderRadius,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: g.hoverBg,
    overflow: 'hidden',
    maxWidth: Dimensions.get('screen').width - 20,
    ...Platform.select({
      web: {
        maxWidth: null,
      },
      ios: {
        // Fix issue partial border radius not work on ios
        borderRadius: 2 * g.borderRadius,
        paddingLeft: 2 * g.borderRadius,
      },
    }),
  },
  Message__createdByMe: {
    borderRadius: 2 * g.borderRadius,
    backgroundColor: g.colors.primaryFn(0.5),
  },
  //
  File: {
    flexDirection: 'row',
    marginTop: 10,
  },
  File__createdByMe: {
    alignSelf: 'flex-end',
    left: 5,
    paddingLeft: 10,
    paddingRight: 15,
    backgroundColor: g.colors.primaryFn(0.5),
  },
  Message_File_Info: {
    marginLeft: 5,
  },
  Message_File_Info__color: {
    color: g.revColor,
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
    marginTop: 5,
  },
  Message_File_Btn_borderColor__white: {
    borderColor: g.revColor,
  },
  Message_File_Btn_borderColor__accept: {
    borderColor: g.colors.primary,
  },
  Message_File_Btn_borderColor__reject: {
    borderColor: g.colors.danger,
  },
});

const File = p => (
  <View style={[css.File, css.Message, p.createdByMe && css.File__createdByMe]}>
    <View>
      <Icon
        color={p.createdByMe ? g.revColor : g.color}
        path={mdiFile}
        size={50}
      />
      <View style={css.Message_File_Info}>
        <Text
          numberOfLines={1}
          style={p.createdByMe && css.Message_File_Info__color}
        >
          {p.name}
        </Text>
        <Text style={p.createdByMe && css.Message_File_Info__color}>
          {p.size}
        </Text>
      </View>
    </View>
    {p.state === 'waiting' && p.createdByMe && (
      <TouchableOpacity
        onPress={p.reject}
        style={[css.Message_File_Btn, css.Message_File_Btn_borderColor__white]}
      >
        <Icon color={g.revColor} path={mdiClose} />
      </TouchableOpacity>
    )}
    {p.state === 'waiting' && !p.createdByMe && (
      <TouchableOpacity
        onPress={p.reject}
        style={[css.Message_File_Btn, css.Message_File_Btn_borderColor__reject]}
      >
        <Icon color={g.colors.danger} path={mdiClose} />
      </TouchableOpacity>
    )}
    {!!p.incoming && p.state === 'waiting' && (
      <TouchableOpacity
        onPress={p.accept}
        style={[css.Message_File_Btn, css.Message_File_Btn_borderColor__accept]}
      >
        <Icon color={g.colors.primary} path={mdiCheck} />
      </TouchableOpacity>
    )}

    {/*//TODO: fix error UI component Progress*/}

    {/*{p.state === `started` && (*/}
    {/*  <TouchableOpacity onPress={p.reject} >*/}
    {/*    <Progress*/}
    {/*      bgColor={g.bg}*/}
    {/*      borderWidth={1}*/}
    {/*      color={g.colors.primary}*/}
    {/*      percent={p.state === `percent`}*/}
    {/*      radius={g.fontSizeTitle}*/}
    {/*      shadowColor={g.bg}*/}
    {/*    >*/}
    {/*      <Icon color={g.colors.danger} path={mdiClose} />*/}

    {/*    </Progress>*/}
    {/*  </TouchableOpacity>*/}
    {/*)}*/}

    {p.state === 'success' && (
      <Text
        style={p.createdByMe && css.Message_File_Info__color}
      >{intl`Success`}</Text>
    )}
    {p.state === 'failure' && (
      <Text
        style={p.createdByMe && css.Message_File_Info__color}
      >{intl`Failed`}</Text>
    )}
    {p.state === 'stopped' && (
      <Text style={p.createdByMe && css.Message_File_Info__color}>
        {intl`Canceled`}
      </Text>
    )}
  </View>
);

const componentDecorator = (href, text) => (
  <Text onPress={null} style={{ color: g.colors.primary }}>
    {text}
  </Text>
);

const Message = observer(p => (
  <React.Fragment>
    {!!p.text && (
      <View style={css.Outer}>
        <Linkify componentDecorator={componentDecorator}>
          <Text
            style={[css.Message, p.createdByMe && css.Message__createdByMe]}
          >
            {p.text}
          </Text>
        </Linkify>
      </View>
    )}
    {!!p.file && (
      <File
        {...p.file}
        accept={() => p.acceptFile(p.file)}
        createdByMe={p.createdByMe}
        fileType={p.fileType}
        reject={() => p.rejectFile(p.file)}
        source={p.showImage}
      />
    )}
  </React.Fragment>
));

export default Message;
