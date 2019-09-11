import {
  mdiAccountCircleOutline,
  mdiClose,
  mdiDotsHorizontal,
  mdiServerNetwork,
  mdiWebBox,
  mdiWebpack,
} from '@mdi/js';
import { Button, Text, View } from 'native-base';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import AppField from '../---shared/AppField';
import AppFooterButtons from '../---shared/AppFooterButtons';
import authStore from '../---shared/authStore';
import routerStore from '../---shared/routerStore';
import registerStyle from '../---style/registerStyle';

registerStyle(v => ({
  View: {
    ProfileSignInItem: {
      position: 'relative',
      backgroundColor: 'white',
      marginBottom: v.padding,
      marginLeft: v.padding,
      borderRadius: v.brekekeBorderRadius,
      paddingHorizontal: v.padding,
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
    ProfileSignInItem_Btns: {
      position: 'absolute',
      bottom: v.padding,
      left: v.padding,
      right: v.padding,
    },
  },
  Text: {
    ProfileSignInItem_NoServer: {
      fontWeight: 'bold',
      fontSize: 1.2 * v.fontSizeBase,
    },
    ProfileSignInItem_CreateNewServerBtnTxt: {
      flex: 1,
      fontWeight: 'bold',
      textAlign: 'center',
      color: 'white',
    },
  },
  Button: {
    ProfileSignInItem_CreateNewServerBtn: {
      textAlign: 'center',
      backgroundColor: v.brekekeDarkGreen,
      borderRadius: v.brekekeBorderRadius,
    },
  },
}));

const ProfileSignInItem = p => (
  <View ProfileSignInItem last={p.last}>
    <TouchableOpacity onPress={() => routerStore.goToPageProfileUpdate(p.id)}>
      <AppField
        name="USERNAME"
        value={p.pbxUsername}
        icon={mdiAccountCircleOutline}
      />
      <AppField name="TENANT" value={p.pbxTenant} icon={mdiWebpack} />
      <AppField name="HOSTNAME" value={p.pbxHostname} icon={mdiWebBox} />
      <AppField name="PORT" value={p.pbxPort} icon={mdiServerNetwork} />
    </TouchableOpacity>
    <AppField
      type="Switch"
      name="UC"
      value={p.ucEnabled}
      onValueChange={v => authStore.upsertProfile({ id: p.id, ucEnabled: v })}
    />
    <View ProfileSignInItem_Btns>
      <AppFooterButtons
        onBackBtnPress={() => authStore.removeProfile(p.id)}
        backIcon={mdiClose}
        onResetBtnPress={() => routerStore.goToPageProfileUpdate(p.id)}
        resetIcon={mdiDotsHorizontal}
        onSaveBtnPress={() => authStore.signIn(p.id)}
        saveText="SIGN IN"
      />
    </View>
  </View>
);

const NoServer = () => (
  <View ProfileSignInItem noServer>
    <Text ProfileSignInItem_NoServer>No server</Text>
    <Text note>There is no server created</Text>
    <Text note>Tap the below button to create one</Text>
    <View ProfileSignInItem_Btns>
      <Button
        ProfileSignInItem_CreateNewServerBtn
        create
        onPress={routerStore.goToPageProfileCreate}
      >
        <Text ProfileSignInItem_CreateNewServerBtnTxt>CREATE NEW SERVER</Text>
      </Button>
    </View>
  </View>
);

export { NoServer };
export default ProfileSignInItem;
