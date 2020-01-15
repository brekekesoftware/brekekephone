import { observer } from 'mobx-react';
import React from 'react';
import { PanResponder, Platform, StyleSheet, View } from 'react-native';

import g from '../global';
import callStore from '../global/callStore';
import VideoPlayer from './VideoPlayer';

const css = StyleSheet.create({
  Mini: {
    position: `absolute`,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: `black`,
    ...Platform.select({
      web: {
        height: null,
        borderRadius: g.borderRadius,
      },
    }),
    overflow: `hidden`,
    ...g.boxShadow,
    ...g.backdropZindex,
  },
});

@observer
class Mini extends React.Component {
  state = {};
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

  _lastTap = null;
  onDrop = (ev, gesture) => {
    callStore.videoPositionL += gesture.dx;
    callStore.videoPositionT += gesture.dy;
    const n = Date.now();
    if (
      gesture.dx <= 10 &&
      gesture.dy <= 10 &&
      this._lastTap &&
      n - this._lastTap <= 500
    ) {
      this.props.onDoubleTap();
    }
    this._lastTap = n;
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
