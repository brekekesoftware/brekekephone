import {
  mdiAccountCircleOutline,
  mdiClose,
  mdiDotsHorizontal,
  mdiServerNetwork,
  mdiWebBox,
  mdiWebpack,
} from '@mdi/js';
import { Button, Switch, Text, View } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import authStore from '../shared/authStore';
import registerStyle from '../shared/registerStyle';
import routerStore from '../shared/routerStore';
import SvgIcon from '../shared/SvgIcon';

const s = registerStyle(v => ({
  View: {
    SignInProfileItem: {
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
        height: '70%',
        minHeight: 320,
        marginVertical: 3 * v.padding,
        marginLeft: v.padding,
        padding: v.padding,
      },
    },
    SignInProfileItem_Field: {
      position: 'relative',
      marginHorizontal: v.padding,
      paddingTop: v.padding,
      paddingBottom: v.padding / 3,
      paddingHorizontal: v.padding / 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: v.brekekeShade4,
    },
    SignInProfileItem_Btns: {
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
    SignInProfileItem_FieldName: {
      fontSize: 0.7 * v.fontSizeBase,
      color: v.brekekeShade7,
    },
    SignInProfileItem_FieldValue: {
      fontWeight: 'bold',
    },
    SignInProfileItem_BtnTxt: {
      flex: 1,
      fontWeight: 'bold',
      textAlign: 'center',
      color: 'white',
    },
    SignInProfileItem_NoServerTxt: {
      fontWeight: 'bold',
      fontSize: 1.2 * v.fontSizeBase,
    },
  },
  Switch: {
    SignInProfileItem_UC: {
      position: 'absolute',
      top: 1.5 * v.padding,
      right: v.padding / 3,
    },
  },
  Button: {
    SignInProfileItem_Btn: {
      borderRadius: 0,
      textAlign: 'center',
      width: '25%',
      '.remove': {
        backgroundColor: 'rgba(200, 55, 55, 0.1)',
      },
      '.update': {
        backgroundColor: v.brekekeShade2,
      },
      '.signIn': {
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
  _SignInProfileItem_Icon: {
    position: 'absolute',
    top: v.padding,
    right: v.padding,
  },
}));

const SignInProfileItem = p => (
  <View SignInProfileItem last={p.last}>
    <TouchableOpacity onPress={() => routerStore.goToProfileUpdate(p.id)}>
      <View SignInProfileItem_Field>
        <Text SignInProfileItem_FieldName>USERNAME</Text>
        <Text SignInProfileItem_FieldValue>{p.pbxUsername || '\u00A0'}</Text>
        <SvgIcon
          path={mdiAccountCircleOutline}
          style={s._SignInProfileItem_Icon}
        />
      </View>
      <View SignInProfileItem_Field>
        <Text SignInProfileItem_FieldName>TENANT</Text>
        <Text SignInProfileItem_FieldValue>{p.pbxTenant || '\u00A0'}</Text>
        <SvgIcon path={mdiWebpack} style={s._SignInProfileItem_Icon} />
      </View>
      <View SignInProfileItem_Field>
        <Text SignInProfileItem_FieldName>HOSTNAME</Text>
        <Text SignInProfileItem_FieldValue>{p.pbxHostname || '\u00A0'}</Text>
        <SvgIcon path={mdiWebBox} style={s._SignInProfileItem_Icon} />
      </View>
      <View SignInProfileItem_Field>
        <Text SignInProfileItem_FieldName>PORT</Text>
        <Text SignInProfileItem_FieldValue>{p.pbxPort || '\u00A0'}</Text>
        <SvgIcon path={mdiServerNetwork} style={s._SignInProfileItem_Icon} />
      </View>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => {
        authStore.upsertProfile({
          id: p.id,
          ucEnabled: !p.ucEnabled,
        });
      }}
    >
      <View SignInProfileItem_Field>
        <Text SignInProfileItem_FieldName>UC</Text>
        <Text SignInProfileItem_FieldValue>
          {p.ucEnabled ? 'Enabled' : 'Disabled'}
        </Text>
        <Switch SignInProfileItem_UC value={p.ucEnabled} />
      </View>
    </TouchableOpacity>
    <View SignInProfileItem_Btns>
      <Button
        SignInProfileItem_Btn
        remove
        onPress={() => authStore.removeProfile(p.id)}
      >
        <SvgIcon path={mdiClose} width="100%" color="red" />
      </Button>
      <Button
        SignInProfileItem_Btn
        update
        onPress={() => routerStore.goToProfileUpdate(p.id)}
      >
        <SvgIcon path={mdiDotsHorizontal} width="100%" />
      </Button>
      <Button
        SignInProfileItem_Btn
        signIn
        onPress={() => authStore.signIn(p.id)}
      >
        <Text SignInProfileItem_BtnTxt>SIGN IN</Text>
      </Button>
    </View>
  </View>
);

const NoServer = () => (
  <View SignInProfileItem noServer>
    <Text SignInProfileItem_NoServerTxt>No server</Text>
    <Text note>There is no server created</Text>
    <Text note>Tap the below button to create one</Text>
    <View SignInProfileItem_Btns>
      <Button
        SignInProfileItem_Btn
        create
        onPress={routerStore.goToProfilesCreate}
      >
        <Text SignInProfileItem_BtnTxt>Create New Server</Text>
      </Button>
    </View>
  </View>
);

export { NoServer };
export default SignInProfileItem;
