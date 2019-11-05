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
        style={[
          s.FooterActions_Btn,
          s.FooterActions_Btn__back,
          !props.onRefreshBtnPress && s.FooterActions_Btn__33,
        ]}
        onPress={props.onBackBtnPress}
      >
        <Icon path={props.backIcon || mdiKeyboardBackspace} color={g.redBg} />
      </TouchableOpacity>
    )}
    {props.selectFile && (
      <TouchableOpacity
        style={[
          s.FooterActions_Btn,
          s.FooterActions_Btn__selectFile,
          s.FooterActions_Btn__15,
        ]}
        onPress={props.selectFile}
      >
        <Icon path={mdiPlus} color={g.layerBg} />
      </TouchableOpacity>
    )}
    {props.LayoutChat && (
      <TextInput
        style={[s.FooterActions_Input]}
        placeholder="Message"
        blurOnSubmit={false}
        value={props.text}
        onChangeText={props.setText}
        onSubmitEditing={props.submitText}
      />
    )}
    {props.onRefreshBtnPress && (
      <TouchableOpacity
        style={[
          s.FooterActions_Btn,
          s.FooterActions_Btn__refresh,
          !props.onBackBtnPress && s.FooterActions_Btn__33,
        ]}
        onPress={props.onRefreshBtnPress}
      >
        <Icon path={props.refreshIcon || mdiCached} />
      </TouchableOpacity>
    )}
    {!props.LayoutChat && (
      <TouchableOpacity
        style={[
          s.FooterActions_Btn,
          s.FooterActions_Btn__save,
          (!props.onBackBtnPress || !props.onRefreshBtnPress) &&
            s.FooterActions_Btn__67,
          !props.onBackBtnPress &&
            !props.onRefreshBtnPress &&
            s.FooterActions_Btn__100,
        ]}
        onPress={props.onSaveBtnPress}
      >
        <Text small style={s.FooterActions_BtnTxt}>
          {props.saveText || `SAVE`}
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

export default FooterActions;
