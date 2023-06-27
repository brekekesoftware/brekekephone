import { observer } from 'mobx-react'
import { Component, FC } from 'react'
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

import { mdiDotsHorizontal, mdiFile } from '../assets/icons'
import { ChatFile } from '../stores/chatStore'
import { intl, intlDebug } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'
import { RnPicker } from '../stores/RnPicker'
import { formatChatContent } from '../utils/formatChatContent'
import { trimHtml } from '../utils/trimHtml'
import { ItemImageVideoChat } from './ItemImageVideoChat'
import { RnIcon, RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  Message: {
    position: 'relative',
    paddingBottom: 5,
    paddingHorizontal: 10,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        maxWidth: 'calc(100vw - 60px)' as any,
      },
      default: {
        // 50px of avatar and 10px of padding
        maxWidth: Dimensions.get('screen').width - 60,
      },
    }),
  },
  //
  File: {
    marginTop: 0,
  },
  Image: {
    width: 150,
    height: 150,
  },

  Message__call: {
    fontSize: v.fontSizeSmall,
    color: v.colors.warning,
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
    color: v.colors.danger,
    borderWidth: 1,
    borderColor: v.colors.danger,
  },
  Message_File_Accept_Button: {
    backgroundColor: v.colors.primary,
    borderWidth: 1,
    borderColor: v.colors.primary,
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
        width: 'calc(100vw - 119px)' as any,
      },
      default: {
        width: Dimensions.get('screen').width - 119,
      },
    }),
  },
  Message_File_Preview_Info_Size: {
    color: '#9e9e9e',
    fontSize: 13,
  },
  Message_File_Preview_Status: {
    fontWeight: v.fontWeight,
  },
  Message_File_Preview_Status__Success: {
    color: v.colors.primary,
  },
  Message_File_Preview_Status__Failed: {
    color: v.colors.danger,
  },

  Link: {
    color: v.colors.primary,
    padding: 0,
    ...Platform.select({
      web: {
        display: 'inline' as any as undefined,
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
    <View>
      <View style={css.Message_File_Preview_Wrapper}>
        <RnIcon path={mdiFile} size={50} />
        <View style={css.Message_File_Preview_Info}>
          <RnText numberOfLines={1}>{p.name}</RnText>
          <RnText style={css.Message_File_Preview_Info_Size}>
            {p.size} KB
          </RnText>
        </View>
      </View>
      <View style={css.Message_File_Button_Wrapper}>
        {p.state === 'waiting' && p.fileType !== 'image' && (
          <RnTouchableOpacity onPress={p.reject}>
            <RnText
              style={[css.Message_File_Button, css.Message_File_Cancel_Button]}
            >
              Cancel
            </RnText>
          </RnTouchableOpacity>
        )}
        {!!p.incoming && p.state === 'waiting' && p.fileType !== 'image' && (
          <RnTouchableOpacity onPress={p.accept}>
            <RnText
              style={[css.Message_File_Button, css.Message_File_Accept_Button]}
            >
              Accept
            </RnText>
          </RnTouchableOpacity>
        )}
      </View>
      {p.state === 'success' && p.fileType !== 'image' && (
        <RnText
          style={[
            css.Message_File_Preview_Status,
            css.Message_File_Preview_Status__Success,
          ]}
        >
          ({intl`Success`})
        </RnText>
      )}
      {p.state === 'failure' && p.fileType !== 'image' && (
        <RnText
          style={[
            css.Message_File_Preview_Status,
            css.Message_File_Preview_Status__Failed,
          ]}
        >
          ({intl`Failed`})
        </RnText>
      )}
      {p.state === 'stopped' && p.fileType !== 'image' && (
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
  </View>
))

@observer
export class Message extends Component<{
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
    const message = !k || k === 1 ? this.props.text : url
    if (!k || k === 2) {
      Clipboard.setString(message)
    } else {
      Share.open({ message })
    }
  }

  render() {
    const p = this.props
    const file = p.file as any as ChatFile
    const isImage =
      file && (file.fileType === 'image' || file.fileType === 'video')
    const TextContainer = Platform.OS === 'web' ? View : RnTouchableOpacity
    const { text, isTextOnly } = formatChatContent(p)

    return (
      <>
        {!!text && !file && (
          <TextContainer style={css.Message} onLongPress={this.onMessagePress}>
            <Hyperlink
              onPress={this.onLinkPress}
              linkStyle={css.Link}
              onLongPress={this.onLinkLongPress}
            >
              <RnText style={!isTextOnly && css.Message__call}>
                {trimHtml(text)}
              </RnText>
            </Hyperlink>
          </TextContainer>
        )}
        {!!file && isImage && <ItemImageVideoChat {...file} />}
        {!!file && !isImage && (
          <File
            {...(p.file as any)}
            accept={() => p.acceptFile(p.file)}
            createdByMe={p.createdByMe}
            reject={() => p.rejectFile(p.file)}
          />
        )}
      </>
    )
  }
}
