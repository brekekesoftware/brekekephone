import React, { Component } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { std } from '../../styleguide';
import Video from './video';

const st = {
  mini: {
    position: 'absolute',
    top: std.textSize.md + std.gap.md * 4, // topbar height
    left: std.gap.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: std.iconSize.lg * 6,
    height: std.iconSize.lg * 6,
    backgroundColor: 'black',
    borderRadius: std.iconSize.lg * 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.shade9,
    shadowColor: std.color.shade9,
    shadowRadius: std.gap.md,
    shadowOpacity: 0.24,
    shadowOffset: { width: 0, height: std.gap.sm },
    elevation: 3,
    overflow: 'hidden',
  },
  full: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
};

class Mini extends Component {
  prevLeft = st.mini.left;
  prevTop = st.mini.top;
  prevTap = Date.now();

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

  render = () => (
    <View
      ref={this.setViewRef}
      style={st.mini}
      {...this.panResponder.panHandlers}
    >
      <Video sourceObject={this.props.sourceObject} />
    </View>
  );

  setViewRef = view => {
    this.view = view;
  };

  onDrag = (ev, gesture) => {
    this.view.setNativeProps({
      style: {
        ...st.mini,
        left: this.prevLeft + gesture.dx,
        top: this.prevTop + gesture.dy,
      },
    });
  };

  onDrop = (ev, gesture) => {
    this.prevLeft += gesture.dx;
    this.prevTop += gesture.dy;

    const now = Date.now();
    // if 2 taps happen in 500ms
    if (now - this.prevTap < 500) {
      this.props.onDoubleTap();
    }
    this.prevTap = now;
  };
}

class Full extends Component {
  prevTap = Date.now();

  constructor(props) {
    super(props);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderRelease: this.onDrop,
    });
  }

  render = () => (
    <View
      ref={this.setViewRef}
      style={st.full}
      {...this.panResponder.panHandlers}
    >
      <Video sourceObject={this.props.sourceObject} />
    </View>
  );

  setViewRef = view => {
    this.view = view;
  };

  onDrop = (ev, gesture) => {
    this.prevLeft += gesture.dx;
    this.prevTop += gesture.dy;

    const now = Date.now();
    // if 2 taps happen in 500ms
    if (now - this.prevTap < 500) {
      this.props.onDoubleTap();
    }
    this.prevTap = now;
  };
}

class Control extends Component {
  state = { full: false };

  render = () => {
    if (!this.props.enabled) {
      return null;
    }

    if (this.state.full) {
      return <Full {...this.props} onDoubleTap={this.toggleFull} />;
    }

    return <Mini {...this.props} onDoubleTap={this.toggleFull} />;
  };

  toggleFull = () => {
    this.setState({
      full: !this.state.full,
    });
  };
}

const CallVideos = p =>
  p.callIds.map(id => <Control key={id} {...p.resolveCall(id)} />);

export default CallVideos;
