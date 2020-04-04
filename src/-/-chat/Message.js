import { mdiCheck, mdiClose, mdiDotsHorizontal, mdiFile } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';
import Hyperlink from 'react-native-hyperlink';
import Share from 'react-native-share';

import g from '../global';
import intl, { intlDebug } from '../intl/intl';
import {
  Clipboard,
  Dimensions,
  Icon,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../Rn';

const css = StyleSheet.create({
  Message: {
    position: 'relative',
    // marginBottom: 2,
    // borderRadius: 2 * g.borderRadius,
    paddingBottom: 10,
    paddingHorizontal: 10,
    // backgroundColor: g.hoverBg,
    overflow: 'hidden',
    maxWidth: Dimensions.get('screen').width - 60, // 50px of avatar and 10px of padding
    ...Platform.select({
      web: {
        maxWidth: 'calc(100vw - 60px)',
      },
    }),
  },
  Message__createdByMe: {
    // backgroundColor: g.colors.primaryFn(0.5),
  },
  //
  File: {
    flexDirection: 'row',
    marginTop: 10,
  },
  File__createdByMe: {
    // alignSelf: 'flex-end',
    left: 5,
    paddingLeft: 10,
    paddingRight: 15,
    backgroundColor: g.colors.primaryFn(0.5),
  },
  File_Icon: {
    flexDirection: 'column',
    alignItems: 'flex-start',
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

  Link: {
    color: g.colors.primary,
    padding: 0,
    ...Platform.select({
      web: {
        display: 'inline',
      },
    }),
  },
});

const File = observer(p => (
  <View style={[css.File, css.Message]}>
    {p.fileType === 'image' && (
      <Image source={{ uri: p.url }} style={css.Image} />
    )}
    {p.fileType !== 'image' && (
      <View style={css.File_Icon}>
        <Icon path={mdiFile} size={50} />
        <View style={css.Message_File_Info}>
          <Text numberOfLines={1}>{p.name}</Text>
          <Text>{p.size}</Text>
        </View>
      </View>
    )}
    {p.state === 'waiting' && (
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
));

@observer
class Message extends React.Component {
  onLinkPress = url => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank', 'noopener');
      return;
    }
    if (!Linking.canOpenURL(url)) {
      g.showError({
        message: intlDebug`Can not open the url`,
      });
    } else {
      Linking.openURL(url);
    }
  };
  onLinkLongPress = url => {
    g.openPicker({
      options: [
        {
          key: 2,
          label: intl`Copy link`,
          icon: mdiDotsHorizontal,
        },
        {
          key: 3,
          label: intl`Share link to external app`,
          icon: mdiDotsHorizontal,
        },
        {
          key: 0,
          label: intl`Copy message`,
          icon: mdiDotsHorizontal,
        },
        {
          key: 1,
          label: intl`Share message to external app`,
          icon: mdiDotsHorizontal,
        },
      ],
      onSelect: k => this.onPickerSelect(k, url),
    });
  };
  onMessagePress = () => {
    g.openPicker({
      options: [
        {
          key: 0,
          label: intl`Copy message`,
          icon: mdiDotsHorizontal,
        },
        {
          key: 1,
          label: intl`Share message to external app`,
          icon: mdiDotsHorizontal,
        },
      ],
      onSelect: this.onPickerSelect,
    });
  };

  onPickerSelect = (k, url) => {
    const message = k === 0 || k === 1 ? this.props.text : url;
    if (k === 0 || k === 2) {
      Clipboard.setString(message);
    } else {
      Share.open({ message });
    }
  };

  render() {
    const p = this.props;
    const TextContainer = Platform.OS === 'web' ? View : TouchableOpacity;
    return (
      <React.Fragment>
        {!!p.text && (
          <TextContainer style={css.Message} onLongPress={this.onMessagePress}>
            <Hyperlink
              onPress={this.onLinkPress}
              linkStyle={css.Link}
              onLongPress={this.onLinkLongPress}
            >
              <Text>{p.text}</Text>
            </Hyperlink>
          </TextContainer>
        )}
        {!!p.file && (
          <File
            {...p.file}
            accept={() => p.acceptFile(p.file)}
            createdByMe={p.createdByMe}
            reject={() => p.rejectFile(p.file)}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Message;
