import React from 'react';
import { PanResponder, View } from 'react-native';

import VideoPlayer from './VideoPlayer';

const st = {
  mini: {
    position: `absolute`,
    top: 28,
    left: 4,
    justifyContent: `center`,
    alignItems: `center`,
    width: 32,
    height: 32,
    backgroundColor: `black`,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: `gray`,
    shadowColor: `black`,
    shadowOpacity: 0.24,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
    overflow: `hidden`,
  },

  full: {
    position: `absolute`,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: `center`,
    alignItems: `center`,
    backgroundColor: `black`,
  },
};

class Mini extends React.Component {
  prevLeft = st.mini.left;
  prevTop = st.mini.top;

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
        style={st.mini}
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
        ...st.mini,
        left: this.prevLeft + gesture.dx,
        top: this.prevTop + gesture.dy,
      },
    });
  };

  onDrop = (ev, gesture) => {
    this.prevLeft += gesture.dx;
    this.prevTop += gesture.dy;

    if (gesture.dx === 0 && gesture.dy === 0) {
      this.props.onDoubleTap();
    }
  };
}

class Full extends React.Component {
  constructor(props) {
    super(props);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderRelease: this.onDrop,
    });
  }

  render() {
    return (
      <View
        ref={this.setViewRef}
        style={st.full}
        {...this.panResponder.panHandlers}
      >
        <VideoPlayer sourceObject={this.props.sourceObject} />
      </View>
    );
  }

  setViewRef = view => {
    this.view = view;
  };

  onDrop = (ev, gesture) => {
    this.props.onDoubleTap();
  };
}

class Control extends React.Component {
  state = {
    full: true,
  };

  render() {
    if (!this.props.enabled) {
      return null;
    }

    if (this.state.full) {
      return <Full {...this.props} onDoubleTap={this.toggleFull} />;
    }

    return <Mini {...this.props} onDoubleTap={this.toggleFull} />;
  }

  toggleFull = () => {
    this.setState({
      full: !this.state.full,
    });
  };
}

const CallVideos = p =>
  p.callIds.map(id => <Control key={id} {...p.resolveCall(id)} />);
export default CallVideos;
