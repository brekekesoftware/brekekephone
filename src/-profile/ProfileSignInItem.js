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
          label="USERNAME"
          value={p.pbxUsername}
          icon={mdiAccountCircleOutline}
        />
        <Field label="TENANT" value={p.pbxTenant} icon={mdiApplication} />
        <Field label="HOSTNAME" value={p.pbxHostname} icon={mdiWeb} />
        <Field label="PORT" value={p.pbxPort} icon={mdiServerNetwork} />
      </TouchableOpacity>
      <Field
        type="Switch"
        label="PUSH NOTIFICATION"
        value={p.pushNotificationEnabled}
        onValueChange={v =>
          g.upsertProfile({ id: p.id, pushNotificationEnabled: v })
        }
      />
      <Field
        type="Switch"
        label="UC"
        value={p.ucEnabled}
        onValueChange={v => g.upsertProfile({ id: p.id, ucEnabled: v })}
      />
      <View style={s.ProfileSignInItem_Btns}>
        <FooterActions
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
          backIcon={mdiClose}
          onRefreshBtnPress={() => g.goToPageProfileUpdate({ id: p.id })}
          refreshIcon={mdiDotsHorizontal}
          saveText="SIGN IN"
          onSaveBtnPress={() => {
            authStore.signIn(p.id);
          }}
        />
      </View>
    </View>
  );
});

export default ProfileSignInItem;
