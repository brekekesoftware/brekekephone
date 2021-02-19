import { mdiDotsHorizontal, mdiFile } from '@mdi/js'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
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

import intl, { intlDebug } from '../stores/intl'
import RnAlert from '../stores/RnAlert'
import RnPicker from '../stores/RnPicker'
import { formatChatContent } from '../utils/formatChatContent'
import { RnIcon, RnImage, RnText, RnTouchableOpacity } from './Rn'
import g from './variables'

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
    // flexDirection: 'row',
    marginTop: 10,
  },
  Image: {
    width: 150,
    height: 150,
  },

  Message__call: {
    fontSize: g.fontSizeSmall,
    color: g.colors.warning,
  },

  Message_File_Button_Wrapper: {
    flexDirection: 'row',
  },
  Message_File_Button: {
    flex: 1,
    paddingVertical: 1,
    paddingHorizontal: 8,
    fontSize: 12,
    marginTop: 4,
    borderRadius: 4,
  },
  Message_File_Cancel_Button: {
    color: g.colors.danger,
    borderWidth: 1,
    borderColor: g.colors.danger,
  },
  Message_File_Accept_Button: {
    backgroundColor: g.colors.primary,
    borderWidth: 1,
    borderColor: g.colors.primary,
    marginLeft: 4,
    color: '#fff',
  },
  Message_File_Preview_Wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  Message_File_Preview_Info: {
    marginLeft: 5,
    ...Platform.select({
      web: {
        width: 'calc(100vw - 119px)',
      },
      default: {
        width: Dimensions.get('screen').width - 119,
      },
    }),
  },
  Message_File_Preview_Info_Size: {
    color: '#b5b5b5',
    fontSize: 13,
  },
  Message_File_Preview_Status: {
    fontWeight: g.fontWeight,
  },
  Message_File_Preview_Status__Success: {
    color: g.colors.primary,
  },
  Message_File_Preview_Status__Failed: {
    color: g.colors.danger,
  },

  Link: {
    color: g.colors.primary,
    padding: 0,
    ...Platform.select({
      web: {
        display: ('inline' as unknown) as undefined,
      },
    }),
  },
})

const File: FC<
  Partial<{
    fileType: string
    url: string
    name: string
    size: string
    state: string
    reject(): void
    incoming: boolean
    accept(): void
    createdByMe: boolean
  }>
> = observer(p => (
  <View style={[css.File, css.Message]}>
    {p.fileType === 'image' && (
      <RnImage source={{ uri: p.url }} style={css.Image} />
    )}
    {p.fileType !== 'image' && (
      <View style={css.Message_File_Preview_Wrapper}>
        <RnIcon path={mdiFile} size={50} />
        <View style={css.Message_File_Preview_Info}>
          <RnText numberOfLines={1}>{p.name}</RnText>
          <RnText style={css.Message_File_Preview_Info_Size}>
            {p.size} KB
          </RnText>
        </View>
      </View>
    )}
    <View style={css.Message_File_Button_Wrapper}>
      {p.state === 'waiting' && (
        <RnTouchableOpacity onPress={p.reject}>
          <RnText
            style={[css.Message_File_Button, css.Message_File_Cancel_Button]}
          >
            Cancel
          </RnText>
        </RnTouchableOpacity>
      )}
      {!!p.incoming && p.state === 'waiting' && (
        <RnTouchableOpacity onPress={p.accept}>
          <RnText
            style={[css.Message_File_Button, css.Message_File_Accept_Button]}
          >
            Accept
          </RnText>
        </RnTouchableOpacity>
      )}
    </View>

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
        style={[
          css.Message_File_Preview_Status,
          css.Message_File_Preview_Status__Success,
        ]}
      >
        ({intl`Success`})
      </RnText>
    )}
    {p.state === 'failure' && (
      <RnText
        style={[
          css.Message_File_Preview_Status,
          css.Message_File_Preview_Status__Failed,
        ]}
      >
        ({intl`Failed`})
      </RnText>
    )}
    {p.state === 'stopped' && (
      <RnText
        style={[
          css.Message_File_Preview_Status,
          css.Message_File_Preview_Status__Failed,
        ]}
      >
        ({intl`Canceled`})
      </RnText>
    )}
  </View>
))

@observer
class Message extends React.Component<{
  text: string
  type?: number
  creatorId: string
  file: string
  acceptFile: Function
  rejectFile: Function
  createdByMe: boolean
}> {
  onLinkPress = (url: string) => {
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
  onLinkLongPress = (url: string) => {
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
      onSelect: (k: number) => this.onRnPickerSelect(k, url),
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

  onRnPickerSelect = (k: number, url: string) => {
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
      <>
        {!!p.text && (
          <TextContainer style={css.Message} onLongPress={this.onMessagePress}>
            <Hyperlink
              onPress={this.onLinkPress}
              linkStyle={css.Link}
              onLongPress={this.onLinkLongPress}
            >
              <RnText style={p.type !== 1 && css.Message__call}>
                {formatChatContent(p)}
              </RnText>
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
      </>
    )
  }
}

export default Message
