import { mdiCheck, mdiClose, mdiDotsHorizontal, mdiFile } from '@mdi/js'
import { observer } from 'mobx-react'
import React from 'react'
import {
  Clipboard,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  View,
} from 'react-native'
import Hyperlink from 'react-native-hyperlink'
import Share from 'react-native-share'

import RnAlert from '../global/RnAlert'
import RnPicker from '../global/RnPicker'
import intl, { intlDebug } from '../intl/intl'
import { RnIcon, RnImage, RnText, RnTouchableOpacity } from '../Rn'
import g from '../variables'

const css = StyleSheet.create({
  Message: {
    position: 'relative',
    // marginBottom: 2,
    // borderRadius: 2 * g.borderRadius,
    paddingBottom: 10,
    paddingHorizontal: 10,
    // backgroundColor: g.hoverBg,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        maxWidth: 'calc(100vw - 60px)',
      },
      default: {
        maxWidth: Dimensions.get('screen').width - 60, // 50px of avatar and 10px of padding
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
        display: 'inline' as any,
      },
    }),
  },
})

const File = observer(p => (
  <View style={[css.File, css.Message]}>
    {p.fileType === 'image' && (
      <RnImage source={{ uri: p.url }} style={css.Image} />
    )}
    {p.fileType !== 'image' && (
      <View style={css.File_Icon}>
        <RnIcon path={mdiFile} size={50} />
        <View style={css.Message_File_Info}>
          <RnText numberOfLines={1}>{p.name}</RnText>
          <RnText>{p.size}</RnText>
        </View>
      </View>
    )}
    {p.state === 'waiting' && (
      <RnTouchableOpacity
        onPress={p.reject}
        style={[css.Message_File_Btn, css.Message_File_Btn_borderColor__reject]}
      >
        <RnIcon color={g.colors.danger} path={mdiClose} />
      </RnTouchableOpacity>
    )}
    {!!p.incoming && p.state === 'waiting' && (
      <RnTouchableOpacity
        onPress={p.accept}
        style={[css.Message_File_Btn, css.Message_File_Btn_borderColor__accept]}
      >
        <RnIcon color={g.colors.primary} path={mdiCheck} />
      </RnTouchableOpacity>
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
      <RnText
        style={p.createdByMe && css.Message_File_Info__color}
      >{intl`Success`}</RnText>
    )}
    {p.state === 'failure' && (
      <RnText
        style={p.createdByMe && css.Message_File_Info__color}
      >{intl`Failed`}</RnText>
    )}
    {p.state === 'stopped' && (
      <RnText style={p.createdByMe && css.Message_File_Info__color}>
        {intl`Canceled`}
      </RnText>
    )}
  </View>
))

@observer
class Message extends React.Component<{
  text: string
  file: string
  acceptFile: Function
  rejectFile: Function
  createdByMe: boolean
}> {
  onLinkPress = url => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank', 'noopener')
      return
    }
    if (!Linking.canOpenURL(url)) {
      RnAlert.error({
        message: intlDebug`Can not open the url`,
      })
    } else {
      Linking.openURL(url)
    }
  }
  onLinkLongPress = url => {
    RnPicker.open({
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
      onSelect: k => this.onRnPickerSelect(k, url),
    })
  }
  onMessagePress = () => {
    RnPicker.open({
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
      onSelect: this.onRnPickerSelect,
    })
  }

  onRnPickerSelect = (k, url) => {
    const message = k === 0 || k === 1 ? this.props.text : url
    if (k === 0 || k === 2) {
      Clipboard.setString(message)
    } else {
      Share.open({ message })
    }
  }

  render() {
    const p = this.props
    const TextContainer = Platform.OS === 'web' ? View : RnTouchableOpacity
    return (
      <React.Fragment>
        {!!p.text && (
          <TextContainer style={css.Message} onLongPress={this.onMessagePress}>
            <Hyperlink
              onPress={this.onLinkPress}
              linkStyle={css.Link}
              onLongPress={this.onLinkLongPress}
            >
              <RnText>{p.text}</RnText>
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
    )
  }
}

export default Message
