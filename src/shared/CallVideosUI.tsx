import { observer } from 'mobx-react'
import React from 'react'
import {
  PanResponder,
  PanResponderInstance,
  Platform,
  StyleSheet,
  View,
} from 'react-native'

import callStore from '../global/callStore'
import Nav from '../global/Nav'
import RnStacker from '../global/RnStacker'
import g from '../variables'
import VideoPlayer from './VideoPlayer'

const css = StyleSheet.create({
  Mini: {
    position: 'absolute',
    width: 150,
    backgroundColor: 'black',
    ...Platform.select({
      android: {
        borderRadius: 75,
        height: 150,
      },
      ios: {
        borderRadius: 75,
        height: 150,
      },
      web: {
        borderRadius: g.borderRadius,
      },
    }),
    overflow: 'hidden',
    ...g.boxShadow,
    ...g.backdropZindex,
  },
})

@observer
class Mini extends React.Component<{
  onDoubleTap: Function
  sourceObject: MediaStream
}> {
  panResponder: PanResponderInstance
  view?: View
  _lastTap?: number

  state = {}
  constructor(props) {
    super(props)

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: this.onDrag,
      onPanResponderRelease: this.onDrop,
      onPanResponderTerminate: this.onDrop,
    })
  }

  render() {
    return (
      <View
        ref={this.setViewRef}
        style={[
          css.Mini,
          { top: callStore.videoPositionT, left: callStore.videoPositionL },
        ]}
        {...this.panResponder.panHandlers}
      >
        <VideoPlayer sourceObject={this.props.sourceObject} />
      </View>
    )
  }

  setViewRef = view => {
    this.view = view
  }

  onDrag = (_, gesture) => {
    this.view?.setNativeProps({
      style: {
        left: callStore.videoPositionL + gesture.dx,
        top: callStore.videoPositionT + gesture.dy,
      },
    })
  }

  onDrop = (_, gesture) => {
    callStore.videoPositionL += gesture.dx
    callStore.videoPositionT += gesture.dy
    const n = Date.now()
    if (
      gesture.dx <= 10 &&
      gesture.dy <= 10 &&
      this._lastTap &&
      n - this._lastTap <= 500
    ) {
      this.props.onDoubleTap()
    }
    this._lastTap = n
  }
}

@observer
class Control extends React.Component<{
  sourceObject: MediaStream
}> {
  render() {
    const s = RnStacker.stacks[RnStacker.stacks.length - 1]
    if (
      s.name === 'PageCallManage' ||
      s.name === 'PageTransferDial' ||
      s.name === 'PageTransferAttend'
    ) {
      return null
    }
    return <Mini {...this.props} onDoubleTap={Nav.goToPageCallManage} />
  }
}

const CallVideos = observer(p =>
  p.callIds.map(id => <Control key={id} {...p.resolveCall(id)} />),
)
export default CallVideos
