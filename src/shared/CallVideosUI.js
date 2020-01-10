import { observer } from 'mobx-react';
import React from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import g from '../global';
import callStore from '../global/callStore';
import VideoPlayer from './VideoPlayer';

const css = StyleSheet.create({
  Mini: {
    position: `absolute`,
    maxWidth: 144,
    maxHeight: 256,
    borderRadius: g.borderRadius,
    overflow: `hidden`,
    ...g.boxShadow,
    ...g.backdropZindex,
  },
});

@observer
class Mini extends React.Component {
  constructor(props) {
    super(props);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: this.onDrag,
      onPanResponderRelease: this.onDrop,
      onPanResponderTerminate: this.onDrop,
    });
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
    );
  }

  setViewRef = view => {
    this.view = view;
  };

  onDrag = (ev, gesture) => {
    this.view.setNativeProps({
      style: {
        left: callStore.videoPositionL + gesture.dx,
        top: callStore.videoPositionT + gesture.dy,
      },
    });
  };

  onDrop = (ev, gesture) => {
    callStore.videoPositionL += gesture.dx;
    callStore.videoPositionT += gesture.dy;
    if (gesture.dx === 0 && gesture.dy === 0) {
      this.props.onDoubleTap();
    }
  };
}

@observer
class Control extends React.Component {
  render() {
    const s = g.stacks[g.stacks.length - 1];
    if (!this.props.enabled || s.name === `PageCallManage`) {
      return null;
    }
    return <Mini {...this.props} onDoubleTap={g.goToPageCallManage} />;
  }
}

const CallVideos = p =>
  p.callIds.map(id => <Control key={id} {...p.resolveCall(id)} />);
export default CallVideos;
