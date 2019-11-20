import { mdiCached, mdiKeyboardBackspace, mdiPlus } from '@mdi/js';
import React from 'react';

import g from '../global';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from '../native/Rn';
import Icon from './Icon';

const s = StyleSheet.create({
  FooterActions: {
    width: `100%`,
    flexDirection: `row`,
    borderRadius: g.borderRadius,
    overflow: `hidden`,
  },
  FooterActions_Input: {
    padding: 10,
    width: `100%`,
  },
  FooterActions_Btn: {
    borderRadius: 0,
    width: `25%`,
    paddingVertical: 8,
  },
  FooterActions_Btn__back: {
    backgroundColor: g.redTransBg,
  },
  FooterActions_Btn__refresh: {
    backgroundColor: g.hoverBg,
  },
  FooterActions_Btn__selectFile: {
    backgroundColor: g.mainBg,
    borderRadius: g.borderRadius,
  },
  FooterActions_Btn__save: {
    width: `50%`,
    backgroundColor: g.mainDarkBg,
  },
  FooterActions_Btn__15: {
    width: `15%`,
  },
  FooterActions_Btn__33: {
    width: `33%`,
  },
  FooterActions_Btn__67: {
    width: `67%`,
  },
  FooterActions_Btn__100: {
    width: `100%`,
  },
  FooterActions_BtnTxt: {
    flex: 1,
    color: g.revColor,
    lineHeight: 24, // Icon height
    textAlign: `center`,
  },
});

const FooterActions = props => (
  <View style={s.FooterActions}>
    {props.onBackBtnPress && (
      <TouchableOpacity
        onPress={props.onBackBtnPress}
        style={[
          s.FooterActions_Btn,
          s.FooterActions_Btn__back,
          !props.onRefreshBtnPress && s.FooterActions_Btn__33,
        ]}
      >
        <Icon color={g.redBg} path={props.backIcon || mdiKeyboardBackspace} />
      </TouchableOpacity>
    )}
    {props.selectFile && (
      <TouchableOpacity
        onPress={props.selectFile}
        style={[
          s.FooterActions_Btn,
          s.FooterActions_Btn__selectFile,
          s.FooterActions_Btn__15,
        ]}
      >
        <Icon color={g.layerBg} path={mdiPlus} />
      </TouchableOpacity>
    )}
    {props.LayoutChat && (
      <TextInput
        blurOnSubmit={false}
        onChangeText={props.setText}
        onSubmitEditing={props.submitText}
        placeholder="Message"
        style={[s.FooterActions_Input]}
        value={props.text}
      />
    )}
    {props.onRefreshBtnPress && (
      <TouchableOpacity
        onPress={props.onRefreshBtnPress}
        style={[
          s.FooterActions_Btn,
          s.FooterActions_Btn__refresh,
          !props.onBackBtnPress && s.FooterActions_Btn__33,
        ]}
      >
        <Icon path={props.refreshIcon || mdiCached} />
      </TouchableOpacity>
    )}
    {!props.LayoutChat && (
      <TouchableOpacity
        onPress={props.onSaveBtnPress}
        style={[
          s.FooterActions_Btn,
          s.FooterActions_Btn__save,
          (!props.onBackBtnPress || !props.onRefreshBtnPress) &&
            s.FooterActions_Btn__67,
          !props.onBackBtnPress &&
            !props.onRefreshBtnPress &&
            s.FooterActions_Btn__100,
        ]}
      >
        <Text small style={s.FooterActions_BtnTxt}>
          {props.saveText || `SAVE`}
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

export default FooterActions;
