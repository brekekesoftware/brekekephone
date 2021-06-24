import { mdiDotsHorizontal, mdiFile } from '@mdi/js'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
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

import uc from '../api/uc'
import chatStore, { ChatFile } from '../stores/chatStore'
import intl, { intlDebug } from '../stores/intl'
import RnAlert from '../stores/RnAlert'
import RnPicker from '../stores/RnPicker'
import { formatBytes } from '../utils/formatBytes'
import { formatChatContent } from '../utils/formatChatContent'
import saveBlob from '../utils/saveBlob'
import {
  RnIcon,
  RnImage,
  RnImageLoader,
  RnText,
  RnTouchableOpacity,
} from './Rn'
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
    marginTop: 0,
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
    marginLeft: 0,
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
    color: g.colors.greyTextChat,
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
        display: 'inline' as unknown as undefined,
      },
    }),
  },
})

const ItemImageChat: FC<ChatFile> = observer(p => {
  const file = { id: p.id, name: p.name }
  const onAcceptFileSuccess = (
    blob: Blob,
    file: { id: string; name: string },
  ) => {
    if (!file.id && !file.name) {
      return
    }
    // const reader = new FileReader()
    // reader.onload = async event => {
    //   console.log({event: event.target})
    //   const url = event.target?.result
    //   Object.assign(chatStore.getFileById(file.id), {
    //     url: url,
    //   })
    // }
    // reader.readAsDataURL(blob)
    saveBlob(blob, file.name)
  }

  const onAcceptFileFailure = (err: Error) => {}
  useEffect(() => {
    file &&
      file.id &&
      file.name &&
      uc
        .acceptFile(file.id)
        .then(blob => onAcceptFileSuccess(blob as Blob, file))
        .catch(onAcceptFileFailure)
  }, [file])

  return (
    <View>
      <View style={css.Message_File_Preview_Info}>
        <RnText numberOfLines={1} style={css.Message_File_Preview_Info_Size}>
          {p.name}
        </RnText>
        <RnText style={css.Message_File_Preview_Info_Size}>
          {formatBytes(p?.size || 0, 2)}
        </RnText>
      </View>
      <RnImageLoader {...p} />
    </View>
  )
})

export default ItemImageChat
