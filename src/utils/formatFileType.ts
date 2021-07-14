import { Platform } from 'react-native'

export const formatFileType = (name: string) => {
  const typeImage = ['PNG', 'JPG', 'JPEG', 'GIF']
  let typeVideo: string[] = []
  if (Platform.OS === 'web') {
    typeVideo = ['MP4', 'WMV', 'MOV', 'AVI', 'FLV', 'MPEG', '3GP'] //['MP4', 'webm']
  } else if (Platform.OS === 'android') {
    typeVideo = ['MP4', 'WMV', 'MOV', 'AVI', 'FLV', 'MPEG', '3GP']
  } else {
    typeVideo = ['MP4', 'WMV', 'MOV', 'AVI', 'FLV', 'MPEG', '3GP']
  }
  console.log({ typeVideo })

  const fileName = name.split('.').pop()?.toUpperCase() || ''
  if (typeImage.includes(fileName)) {
    return 'image'
  }
  if (typeVideo.includes(fileName)) {
    return 'video'
  }
  return 'other'
}
