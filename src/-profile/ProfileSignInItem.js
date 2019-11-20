import {
  mdiAccountCircleOutline,
  mdiApplication,
  mdiClose,
  mdiDotsHorizontal,
  mdiServerNetwork,
  mdiWeb,
} from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import authStore from '../-/authStore';
import g from '../global';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Field from '../shared/Field';
import FooterActions from '../shared/FooterActions';

const s = StyleSheet.create({
  ProfileSignInItem: {
    backgroundColor: g.bg,
    marginBottom: 15,
    marginLeft: 15,
    borderRadius: g.borderRadius,
    width: 280,
  },
  ProfileSignInItem__last: {
    marginRight: 15,
  },
  ProfileSignInItem__empty: {
    height: `70%`,
    minHeight: 320,
    marginVertical: 45,
    marginLeft: 15,
    padding: 15,
  },
  ProfileSignInItem_Btns: {
    position: `absolute`,
    bottom: 15,
    left: 15,
    right: 15,
  },
});

const ProfileSignInItem = observer(props => {
  if (props.empty) {
    return (
      <View style={[s.ProfileSignInItem, s.ProfileSignInItem__empty]}>
        <Text subTitle>No server</Text>
        <Text>There is no server created</Text>
        <Text>Tap the below button to create one</Text>
        <View style={s.ProfileSignInItem_Btns}>
          <FooterActions
            onSaveBtnPress={g.goToPageProfileCreate}
            saveText="CREATE NEW SERVER"
          />
        </View>
      </View>
    );
  }
  const p = g.profilesMap[props.id];
  return (
    <View
      style={[s.ProfileSignInItem, props.last && s.ProfileSignInItem__last]}
    >
      <TouchableOpacity onPress={() => g.goToPageProfileUpdate({ id: p.id })}>
        <Field
          icon={mdiAccountCircleOutline}
          label="USERNAME"
          value={p.pbxUsername}
        />
        <Field icon={mdiApplication} label="TENANT" value={p.pbxTenant} />
        <Field icon={mdiWeb} label="HOSTNAME" value={p.pbxHostname} />
        <Field icon={mdiServerNetwork} label="PORT" value={p.pbxPort} />
      </TouchableOpacity>
      <Field
        label="PUSH NOTIFICATION"
        onValueChange={v =>
          g.upsertProfile({ id: p.id, pushNotificationEnabled: v })
        }
        type="Switch"
        value={p.pushNotificationEnabled}
      />
      <Field
        label="UC"
        onValueChange={v => g.upsertProfile({ id: p.id, ucEnabled: v })}
        type="Switch"
        value={p.ucEnabled}
      />
      <View style={s.ProfileSignInItem_Btns}>
        <FooterActions
          backIcon={mdiClose}
          onBackBtnPress={() => {
            g.showPrompt({
              title: `Remove Server`,
              message: (
                <React.Fragment>
                  <View>
                    <Text small>
                      {p.pbxUsername} - {p.pbxHostname}
                    </Text>
                  </View>
                  <Text>Do you want to remove this profile?</Text>
                </React.Fragment>
              ),
              onConfirm: () => {
                g.removeProfile(p.id);
              },
            });
          }}
          onRefreshBtnPress={() => g.goToPageProfileUpdate({ id: p.id })}
          onSaveBtnPress={() => {
            authStore.signIn(p.id);
          }}
          refreshIcon={mdiDotsHorizontal}
          saveText="SIGN IN"
        />
      </View>
    </View>
  );
});

export default ProfileSignInItem;
