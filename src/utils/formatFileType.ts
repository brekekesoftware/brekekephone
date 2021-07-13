export const formatFileType = (name: string) => {
  const typeImage = ['PNG', 'JPG', 'JPEG', 'GIF']
  const typeVideo = ['MP4', 'WMV', 'MOV', 'AVI', 'FLV', 'MPEG', '3GP']
  const fileName = name.split('.').pop()?.toUpperCase() || ''
  if (typeImage.includes(fileName)) {
    return 'image'
  }
  if (typeVideo.includes(fileName)) {
    return 'video'
  }
  return 'other'
}
