import { isIos, isWeb } from '../config'

export const formatFileType = (name: string) => {
  const typeImage = ['PNG', 'JPG', 'JPEG', 'GIF']
  let typeVideo: string[] = []
  if (isWeb) {
    // https://www.w3schools.com/tags/tag_video.asp
    typeVideo = ['MP4', 'WEBM', 'OGG', 'MOV']
  } else if (isIos) {
    // https://stackoverflow.com/questions/1535836/video-file-formats-supported-in-iphone
    typeVideo = ['MP4', 'M4A', 'MOV', '3GP']
  } else {
    // https://github.com/react-native-video/react-native-video/blob/master/android-exoplayer/README.md
    typeVideo = ['MP4', 'M4A', 'FMP4', 'WEBM', 'MKV', 'MPEG', 'FLV', 'MOV']
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
