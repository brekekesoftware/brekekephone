import Clipboard from '@react-native-clipboard/clipboard'
import { observer } from 'mobx-react'
import type { FC } from 'react'
import { Component } from 'react'
import { Dimensions, Linking } from 'react-native'
import Share from 'react-native-share'

import { View } from '@/rn/core/components/view'
import { mdiContentCopy, mdiDotsHorizontal, mdiFile } from '#/assets/icons'
import { ItemImageVideoChat } from '#/components/item-image-video-chat'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { isWeb } from '#/config'
import type { ChatFile } from '#/stores/chat-store'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { RnPicker } from '#/stores/rn-picker'
import { formatChatContent } from '#/utils/format-chat-content'

// 50px of avatar and 10px of padding
const messageMaxWidthClassName = isWeb
  ? 'max-w-[calc(100vw-60px)]'
  : `max-w-[${Dimensions.get('screen').width - 60}px]`
const previewInfoWidthClassName = isWeb
  ? 'w-[calc(100vw-119px)]'
  : `w-[${Dimensions.get('screen').width - 119}px]`

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
  <View
    className={[
      'relative pb-1.25 px-2.5 overflow-hidden mt-0',
      messageMaxWidthClassName,
    ]}
  >
    <View>
      <View className='flex-row items-start'>
        <View>
          <RnIcon path={mdiFile} size={20} />
        </View>
        <View className={['ml-1.25', previewInfoWidthClassName]}>
          <RnText className='line-clamp-1'>{p.name}</RnText>
        </View>
      </View>
      <RnText className='text-[#9e9e9e] text-[13px]'>{p.size} KB</RnText>
      <View className='flex-row'>
        {p.state === 'waiting' && p.fileType !== 'image' && (
          <RnTouchableOpacity onPress={p.reject}>
            <RnText className='flex-1 py-px px-2 mt-1 rounded text-[12px] text-error border border-error'>
              Cancel
            </RnText>
          </RnTouchableOpacity>
        )}
        {p.incoming && p.state === 'waiting' && p.fileType !== 'image' && (
          <RnTouchableOpacity onPress={p.accept}>
            <RnText className='flex-1 py-px px-2 mt-1 rounded text-[12px] bg-primary border border-primary'>
              Accept
            </RnText>
          </RnTouchableOpacity>
        )}
      </View>
      {p.state === 'success' && p.fileType !== 'image' && (
        <RnText normal primary>
          ({intl`Success`})
        </RnText>
      )}
      {p.state === 'failure' && p.fileType !== 'image' && (
        <RnText normal danger>
          ({intl`Failed`})
        </RnText>
      )}
      {p.state === 'stopped' && p.fileType !== 'image' && (
        <RnText normal danger>
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
    if (isWeb) {
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
          icon: mdiContentCopy,
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
          icon: mdiContentCopy,
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
    const TextContainer = isWeb ? View : RnTouchableOpacity
    const { text, isTextOnly } = formatChatContent(p)

    return (
      <>
        {!!text && !file && (
          <TextContainer
            className={[
              'relative pb-1.25 px-2.5 overflow-hidden',
              messageMaxWidthClassName,
            ]}
            onLongPress={this.onMessagePress}
          >
            <RnText
              className={!isTextOnly ? 'text-warning text-[11.2px]' : undefined}
            >
              {text.trim()}
            </RnText>
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
