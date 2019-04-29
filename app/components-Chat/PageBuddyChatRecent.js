import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import PropTypes from 'prop-types';
import chatStore from './chatStore';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import Main from '../components-shared/Main';

@observer
class PageBuddyChatRecent extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  @observable loadMoreLoading = false;

  componentDidMount() {
    this.loadMore();
  }

  @action loadMore = () => {
    this.loadMoreLoading = true;
    //
    const buddyId = this.props.match.params.buddy;
    const msgsByThisBuddy = chatStore.getMsgs(buddyId);
    const oldestMsg = msgsByThisBuddy[0] || {};
    const oldestCreated = oldestMsg.created || 0;
    //
    this.context.uc
      .getBuddyChats(buddyId, {
        max: 50,
        end: oldestCreated ? new Date(oldestCreated).getTime() - 1 : undefined,
      })
      .then(this.onLoadMoreSuccess)
      .catch(this.onLoadMoreFailure);
  };

  onLoadMoreFailure = err => {
    console.warn('onLoadMoreFailure', err);
  };

  onLoadMoreSuccess = msgs => {
    //
    const buddyId = this.props.match.params.buddy;
    const oldMsgs = chatStore.getMsgs(buddyId);
    //
    const duplicatedMap = {};
    const newMsgs = oldMsgs
      .concat(msgs)
      .filter(m => {
        if (duplicatedMap[m.id]) {
          return false;
        }
        duplicatedMap[m.id] = true;
        return true;
      })
      .sort((m1, m2) => {
        if (m1.created < m2.created) {
          return -1;
        }
        return 1;
      });
    //
    chatStore.setMsgs(newMsgs, buddyId);
  };

  render() {
    const buddyId = this.props.match.params.buddy;
    const msgs = chatStore.getMsgs(buddyId);
    return (
      <Main title="PageBuddyChatRecent">
        {msgs.map(m => (
          <View>
            <Text>{m.text}</Text>
          </View>
        ))}
        <TouchableOpacity onPress={this.loadMore}>
          <Text>Load more msgs</Text>
        </TouchableOpacity>
      </Main>
    );
  }
}

export default PageBuddyChatRecent;
