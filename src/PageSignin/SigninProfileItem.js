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
      marginBottom: v.padding,
      marginLeft: v.padding,
      borderRadius: v.brekekeBorderRadius,
      width: 280,
      '.last': {
        marginRight: v.padding,
      },
      '.noServer': {
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
      borderRadius: v.brekekeBorderRadius,
      overflow: 'hidden',
    },
  },
  Text: {
    SigninProfileItem_FieldName: {
      fontSize: 0.7 * v.fontSizeBase,
      color: v.brekekeShade7,
    },
    SigninProfileItem_FieldValue: {
      fontWeight: 'bold',
    },
    SigninProfileItem_BtnTxt: {
      flex: 1,
      fontWeight: 'bold',
      textAlign: 'center',
      color: 'white',
    },
    SigninProfileItem_NoServerTxt: {
      fontWeight: 'bold',
      fontSize: 1.2 * v.fontSizeBase,
    },
  },
  Switch: {
    SigninProfileItem_UC: {
      position: 'absolute',
      top: 1.5 * v.padding,
      right: 0,
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
        backgroundColor: v.brekekeDarkGreen,
      },
      '.create': {
        width: '100%',
        backgroundColor: v.brekekeDarkGreen,
        borderRadius: v.brekekeBorderRadius,
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
});

const SigninProfileItem = p => (
  <View SigninProfileItem last={p.last}>
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
      <Text SigninProfileItem_FieldValue>
        {p.ucEnabled ? 'Enabled' : 'Disabled'}
      </Text>
      <Switch
        SigninProfileItem_UC
        value={p.ucEnabled}
        onValueChange={ucEnabled => {
          authStore.updateProfile({
            id: p.id,
            ucEnabled,
          });
        }}
      />
    </View>
    <View SigninProfileItem_Btns>
      <Button
        SigninProfileItem_Btn
        remove
        onPress={() => authStore.removeProfile(p.id)}
      >
        <SvgIcon path={mdiClose} width="100%" color="red" />
      </Button>
      <Button
        SigninProfileItem_Btn
        update
        onPress={() => routerUtils.goToProfileUpdate(p.id)}
      >
        <SvgIcon path={mdiFocusFieldHorizontal} width="100%" />
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

const NoServer = () => (
  <View SigninProfileItem noServer>
    <Text SigninProfileItem_NoServerTxt>No server</Text>
    <Text note>There is no server created</Text>
    <Text note>Tap the below button to create one</Text>
    <View SigninProfileItem_Btns>
      <Button
        SigninProfileItem_Btn
        create
        onPress={routerUtils.goToProfilesCreate}
      >
        <Text SigninProfileItem_BtnTxt>Create New Server</Text>
      </Button>
    </View>
  </View>
);

export { NoServer };
export default SigninProfileItem;
