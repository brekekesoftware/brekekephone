import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import g from '../global';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from '../native/Rn';
import Layout from '../shared/Layout';
import v from '../variables';

const s = StyleSheet.create({
  Setting: {},
  Setting_Item: {
    flexDirection: `row`,
    borderBottomWidth: 1,
    borderColor: v.borderBg,
    height: 60,
    alignItems: `center`,
    paddingLeft: 20,
  },
  Setting_Item_BtnOuter: {
    flexDirection: `row`,
    position: `absolute`,
    right: 10,
  },
  Setting_Item_Btn: {
    borderWidth: 1,
    borderColor: v.borderBg,
    width: 70,
    padding: 5,
  },
  Setting_Item_Btn__RdLeft: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  Setting_Item_Btn__RdRight: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  Setting_Item_Btn__Off: {
    backgroundColor: v.hoverBg,
    borderColor: v.borderBg,
  },
  Setting_Item_Btn__On: {
    borderColor: v.mainBg,
  },
  Setting_Item_Btn__Busy: {
    borderColor: v.redBg,
  },
  Setting_Item__BtnTxt: {
    textAlign: `center`,
  },
});

@observer
class Setting extends Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  state = {
    status: ``,
    statusText: ``,
  };

  componentDidMount() {
    const me = this.context.uc.me();
    this.setState({
      status: me.status,
      statusText: me.statusText,
    });
  }

  render() {
    return (
      <Layout
        footer={{
          navigation: {
            menu: `settings`,
            subMenu: `settings`,
          },
        }}
        header={{
          title: `Setting`,
          onBackBtnPress: g.goToUsersBrowse,
        }}
      >
        <View style={[s.Setting_Item]}>
          <View>
            <Text>Status</Text>
          </View>
          <View style={s.Setting_Item_BtnOuter}>
            <TouchableOpacity
              onPress={() => this.setStatus(`offiline`)}
              style={[
                s.Setting_Item_Btn,
                s.Setting_Item_Btn__RdLeft,
                this.state.status === `offline` && s.Setting_Item_Btn__Off,
              ]}
            >
              <Text style={s.Setting_Item__BtnTxt}>Offline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.setStatus(`online`)}
              style={[
                s.Setting_Item_Btn,
                this.state.status === `online` && s.Setting_Item_Btn__On,
              ]}
            >
              <Text
                style={[
                  s.Setting_Item__BtnTxt,
                  this.state.status === `online` && { color: v.mainBg },
                ]}
              >
                Online
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.setStatus(`busy`)}
              style={[
                s.Setting_Item_Btn,
                s.Setting_Item_Btn__RdRight,
                this.state.status === `busy` && s.Setting_Item_Btn__Busy,
              ]}
            >
              <Text
                style={[
                  s.Setting_Item__BtnTxt,
                  this.state.status === `busy` && { color: v.redBg },
                ]}
              >
                Busy
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[s.Setting_Item]}>
          <View>
            <Text>Status note</Text>
          </View>
          <View style={s.Setting_Item_BtnOuter}>
            <TextInput
              onChangeText={this.setstatusText}
              onSubmitEditing={this.submitstatusText}
              value={this.state.statusText}
            />
          </View>
        </View>
      </Layout>
    );
  }

  onSetChatStatusSuccess = () => {
    const me = this.context.uc.me();
    this.setState({
      status: me.status,
      statusText: me.statusText,
    });
  };

  onSetChatStatusFailure = () => {
    g.showError(`to change chat status`);
  };

  setStatus = status => {
    const { uc } = this.context;
    uc.setStatus(status, this.state.statusText)
      .then(this.onSetChatStatusSuccess)
      .catch(this.onSetChatStatusFailure);
  };

  setstatusText = statusText => {
    this.setState({ statusText });
  };

  submitstatusText = () => {
    const { status } = this.state;
    this.setStatus(status, this.state.statusText);
  };
}

export default Setting;
