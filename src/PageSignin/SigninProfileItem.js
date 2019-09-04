import {
  mdiAccountCircleOutline,
  mdiClose,
  mdiFocusFieldHorizontal,
  mdiServerNetwork,
  mdiWebBox,
  mdiWebpack,
} from '@mdi/js';
import { Button, Switch, Text, View } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

import SvgIcon from '../components-shared/SvgIcon';
import authStore from '../mobx/authStore';
import * as routerUtils from '../mobx/routerStore';
import registerStyle from '../style/registerStyle';
import v from '../style/variables';

registerStyle(v => ({
  View: {
    SigninProfileItem: {
      position: 'relative',
      backgroundColor: 'white',
      marginRight: v.padding,
      marginBottom: v.padding,
      borderRadius: 2,
      width: 280,
      '.empty': {
        flex: 1,
        marginLeft: v.padding,
        marginBottom: 3 * v.padding,
        marginTop: 3 * v.padding,
        padding: v.padding,
      },
    },
    SigninProfileItem_Field: {
      position: 'relative',
      marginLeft: v.padding,
      marginRight: v.padding,
      padding: v.padding / 2,
      paddingTop: v.padding,
      paddingBottom: v.padding / 3,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: v.brekekeShade4,
    },
    SigninProfileItem_Btns: {
      position: 'absolute',
      bottom: v.padding,
      left: v.padding,
      right: v.padding,
      display: 'flex',
      flexDirection: 'row',
    },
  },
  Text: {
    SigninProfileItem_FieldName: {
      fontSize: '0.7em',
      color: v.brekekeShade7,
    },
    SigninProfileItem_FieldValue: {
      fontWeight: 'bold',
    },
    SigninProfileItem_BtnTxt: {
      flex: 1,
      fontWeight: 'bold',
      fontSize: '0.7em',
      textAlign: 'center',
      color: 'white',
    },
    SigninProfileItem_NoServerTxt: {
      fontWeight: 'bold',
      fontSize: '1.2em',
    },
  },
  Switch: {
    SigninProfileItem_UC: {
      position: 'absolute',
      top: 1.5 * v.padding,
      right: v.padding,
    },
  },
  Button: {
    SigninProfileItem_Btn: {
      borderRadius: 0,
      textAlign: 'center',
      width: '25%',
      '.remove': {
        backgroundColor: 'rgba(200, 55, 55, 0.1)',
      },
      '.update': {
        backgroundColor: v.brekekeShade2,
      },
      '.signin': {
        width: '50%',
        backgroundColor: v.brekekeGreen,
      },
      '.create': {
        width: '100%',
        backgroundColor: v.brekekeGreen,
      },
    },
  },
}));
const s = StyleSheet.create({
  Icon: {
    position: 'absolute',
    top: v.padding,
    right: v.padding,
  },
  BtnIcon: {
    margin: 'auto',
  },
});

const SigninProfileItem = p => (
  <View SigninProfileItem>
    <View SigninProfileItem_Field>
      <Text SigninProfileItem_FieldName>USERNAME</Text>
      <Text SigninProfileItem_FieldValue>{p.pbxUsername || '\u00A0'}</Text>
      <SvgIcon path={mdiAccountCircleOutline} style={s.Icon} />
    </View>
    <View SigninProfileItem_Field>
      <Text SigninProfileItem_FieldName>TENANT</Text>
      <Text SigninProfileItem_FieldValue>{p.pbxTenant || '\u00A0'}</Text>
      <SvgIcon path={mdiWebpack} style={s.Icon} />
    </View>
    <View SigninProfileItem_Field>
      <Text SigninProfileItem_FieldName>HOSTNAME</Text>
      <Text SigninProfileItem_FieldValue>{p.pbxHostname || '\u00A0'}</Text>
      <SvgIcon path={mdiWebBox} style={s.Icon} />
    </View>
    <View SigninProfileItem_Field>
      <Text SigninProfileItem_FieldName>PORT</Text>
      <Text SigninProfileItem_FieldValue>{p.pbxPort || '\u00A0'}</Text>
      <SvgIcon path={mdiServerNetwork} style={s.Icon} />
    </View>
    <View SigninProfileItem_Field>
      <Text SigninProfileItem_FieldName>UC</Text>
      <Text SigninProfileItem_FieldValue>{p.ucEnabled ? 'On' : 'Off'}</Text>
      <Switch SigninProfileItem_UC value={p.ucEnabled} />
    </View>
    <View SigninProfileItem_Btns>
      <Button
        SigninProfileItem_Btn
        remove
        onPress={() => authStore.removeProfile(p.id)}
      >
        <SvgIcon path={mdiClose} style={s.BtnIcon} color="red" />
      </Button>
      <Button
        SigninProfileItem_Btn
        update
        onPress={() => authStore.updateProfile(p.id)}
      >
        <SvgIcon path={mdiFocusFieldHorizontal} style={s.BtnIcon} />
      </Button>
      <Button
        SigninProfileItem_Btn
        signin
        onPress={() => authStore.signin(p.id)}
      >
        <Text SigninProfileItem_BtnTxt>SIGN IN</Text>
      </Button>
    </View>
  </View>
);

const NoServer = p => (
  <View SigninProfileItem empty>
    <Text SigninProfileItem_NoServerTxt>No server</Text>
    <Text note>There is no server created</Text>
    <Text note>Tap the below button to create one</Text>
    <View SigninProfileItem_Btns>
      <Button
        SigninProfileItem_Btn
        create
        onPress={routerUtils.goToProfilesCreate}
      >
        <Text SigninProfileItem_BtnTxt>CREATE NEW SERVER</Text>
      </Button>
    </View>
  </View>
);

export { NoServer };
export default SigninProfileItem;
