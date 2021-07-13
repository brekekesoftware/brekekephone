import { Platform } from 'react-native'

export const formatFileType = (name: string) => {
  const typeImage = ['PNG', 'JPG', 'JPEG', 'GIF']
  const typeVideo: string[] = []
  if (Platform.OS === 'web') {
    typeVideo.concat(['MP4', 'webm'])
  } else if (Platform.OS === 'android') {
    typeVideo.concat(['MP4', 'WMV', 'MOV', 'AVI', 'FLV', 'MPEG', '3GP'])
  } else {
    typeVideo.concat(['MP4', 'WMV', 'MOV', 'AVI', 'FLV', 'MPEG', '3GP'])
  }
  const fileName = name.split('.').pop()?.toUpperCase() || ''
  if (typeImage.includes(fileName)) {
    return 'image'
  }
  if (typeVideo.includes(fileName)) {
    return 'video'
  }
  return 'other'
}
