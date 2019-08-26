import React from 'react';
import { ScrollView } from 'react-native';

class Scroll extends React.Component {
  _justMounted = true;
  _closeToBottom = true;

  render = () => (
    <ScrollView
      {...this.props}
      scrollEventThrottle={120}
      ref={this.setViewRef}
      onContentSizeChange={this.onContentSizeChange}
      onScroll={this.onScroll}
    />
  );

  setViewRef = ref => {
    this.view = ref;
  };

  onContentSizeChange = () => {
    if (this._closeToBottom) {
      this.view.scrollToEnd({
        animated: !this._justMounted,
      });

      if (this._justMounted) {
        this._justMounted = false;
      }
    }
  };

  onScroll = ev => {
    ev = ev.nativeEvent;
    const layoutSize = ev.layoutMeasurement;
    const layoutHeight = layoutSize.height;
    const contentOffset = ev.contentOffset;
    const contentSize = ev.contentSize;
    const contentHeight = contentSize.height;
    const paddingToBottom = 20;
    this._closeToBottom =
      layoutHeight + contentOffset.y >= contentHeight - paddingToBottom;
  };
}

export default Scroll;
