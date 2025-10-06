import { StyleSheet } from 'react-native'
import Video from 'react-native-video'

const css = StyleSheet.create({
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
})
export const AudioPlayer = () => (
  <Video
    source={require('../assets/ding.mp3')}
    style={css.video}
    // ignoreSilentSwitch="ignore"
    // playInBackground={true}
    // playWhenInactive={true}
  />
)
