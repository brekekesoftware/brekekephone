import { Platform } from 'react-native'

export const formatFileType = (name: string) => {
  const typeImage = ['PNG', 'JPG', 'JPEG', 'GIF']
  let typeVideo: string[] = []
  if (Platform.OS === 'web') {
    typeVideo = ['MP4', 'WEBM', 'OGG']
    // ref: https://www.w3schools.com/tags/tag_video.asp
  } else if (Platform.OS === 'ios') {
    typeVideo = ['MP4', 'M4A', 'MOV', '3GP']
    // ref: https://stackoverflow.com/questions/1535836/video-file-formats-supported-in-iphone
  } else {
    typeVideo = ['MP4', 'M4A', 'FMP4', 'WEBM', 'MKV', 'MPEG', 'FLV']
    // ref: https://github.com/react-native-video/react-native-video/blob/master/android-exoplayer/README.md
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
