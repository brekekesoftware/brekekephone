import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import authStore from '../global/authStore';
import { Text, View } from '../native/Rn';
import Layout from '../shared/Layout';
import useForm from '../utils/useForm';
import useStore from '../utils/useStore';

const ProfileCreateForm = observer(props => {
  const $ = useStore(() => ({
    observable: {
      profile: {
        ...g.genEmptyProfile(),
        ...cloneDeep(props.updatingProfile),
      },
      addingPark: ``,
    },
    resetAllFields: () => {
      g.showPrompt({
        title: `Reset`,
        message: `Do you want to reset all current fields to ${
          props.updatingProfile ? `original data` : `empty`
        }?`,
        onConfirm: () => {
          $.set(`profile`, p => ({
            ...g.genEmptyProfile(),
            ...cloneDeep(props.updatingProfile),
            id: p.id,
          }));
        },
        confirmText: `RESET`,
      });
    },
    //
    onAddingParkSubmit: () => {
      $.set(`profile`, p => {
        $.addingPark = $.addingPark.trim();
        if ($.addingPark) {
          p.parks.push($.addingPark);
          $.addingPark = ``;
        }
        return p;
      });
    },
    onAddingParkRemove: i => {
      g.showPrompt({
        title: `Remove Park`,
        message: (
          <React.Fragment>
            <View>
              <Text small>
                Park {i + 1}: {$.profile.parks[i]}
              </Text>
            </View>
            <Text>Do you want to remove this park?</Text>
          </React.Fragment>
        ),
        onConfirm: () => {
          $.set(`profile`, p => {
            p.parks = p.parks.filter((p, _i) => _i !== i);
            return p;
          });
        },
      });
    },
    //
    hasUnsavedChanges: () => {
      const p = props.updatingProfile || g.genEmptyProfile();
      if (!props.updatingProfile) {
        Object.assign(p, {
          id: $.profile.id,
        });
      }
      return !isEqual($.profile, p);
    },
    onBackBtnPress: () => {
      if (!$.hasUnsavedChanges()) {
        props.onBack();
        return;
      }
      g.showPrompt({
        title: `Discard Changes`,
        message: `Do you want to discard all unsaved changes and go back?`,
        onConfirm: props.onBack,
        confirmText: `DISCARD`,
      });
    },
    onValidSubmit: () => {
      props.onSave($.profile, $.hasUnsavedChanges());
    },
  }));
  const [Form, submitForm, revalidate] = useForm();
  return (
    <Layout
      description={
        props.updatingProfile
          ? `${props.updatingProfile.pbxUsername} - ${props.updatingProfile.pbxHostname}`
          : `Create a new sign in profile`
      }
      dropdown={
        props.footerLogout
          ? [
              {
                label: `Logout`,
                onPress: () => {
                  g.goToPageProfileSignIn();
                  authStore.signedInId = ``;
                },
                danger: true,
              },
            ]
          : [
              {
                label: `Reset form`,
                onPress: $.resetAllFields,
              },
            ]
      }
      footer={{
        actions: props.footerLogout
          ? null
          : {
              onBackBtnPress: $.onBackBtnPress,
              onSaveBtnPress: submitForm,
            },
        navigation: props.footerLogout
          ? {
              menu: `settings`,
              subMenu: `profile`,
            }
          : null,
      }}
      menu={props.footerLogout ? `settings` : null}
      onBack={props.footerLogout ? null : $.onBackBtnPress}
      subMenu={props.footerLogout ? `profile` : null}
      title={props.title}
    >
      <Form
        $={$}
        fields={[
          {
            isGroup: true,
            label: `PBX`,
          },
          {
            // autoFocus: true, // TODO Animation issue
            disabled: props.footerLogout,
            name: `pbxUsername`,
            label: `USERNAME`,
            rule: `required`,
          },
          {
            disabled: props.footerLogout,
            secureTextEntry: true,
            name: `pbxPassword`,
            label: `PASSWORD`,
            rule: `required`,
          },
          {
            disabled: props.footerLogout,
            name: `pbxTenant`,
            label: `TENANT`,
          },
          {
            disabled: props.footerLogout,
            name: `pbxHostname`,
            label: `HOSTNAME`,
            rule: `required|hostname`,
          },
          {
            disabled: props.footerLogout,
            keyboardType: `numeric`,
            name: `pbxPort`,
            label: `PORT`,
            rule: `required|port`,
          },
          {
            disabled: props.footerLogout,
            type: `Picker`,
            name: `pbxPhoneIndex`,
            label: `PHONE`,
            rule: `required`,
            options: [1, 2, 3, 4].map(v => ({
              key: `${v}`,
              label: `Phone ${v}`,
            })),
          },
          {
            disabled: props.footerLogout,
            type: `Switch`,
            name: `pbxTurnEnabled`,
            label: `TURN`,
          },
          {
            disabled: props.footerLogout,
            type: `Switch`,
            name: `pushNotificationEnabled`,
            label: `PUSH NOTIFICATION`,
          },
          {
            isGroup: true,
            label: `UC`,
            hasMargin: true,
          },
          {
            disabled: props.footerLogout,
            type: `Switch`,
            name: `ucEnabled`,
            label: `UC`,
            onValueChange: v => {
              $.set(`profile`, p => {
                if (v && !p.ucHostname && !p.ucPort) {
                  p.ucHostname = p.pbxHostname;
                  p.ucPort = p.pbxPort;
                  // TODO
                  // revalidate('ucHostname', 'ucPort');
                  revalidate(`ucHostname`, p.ucHostname);
                  revalidate(`ucPort`, p.ucPort);
                }
                p.ucEnabled = v;
                return p;
              });
            },
          },
          {
            disabled: props.footerLogout || !$.profile.ucEnabled,
            name: `ucHostname`,
            label: `HOSTNAME`,
            rule: `required|hostname`,
          },
          {
            keyboardType: `numeric`,
            disabled: props.footerLogout || !$.profile.ucEnabled,
            name: `ucPort`,
            label: `PORT`,
            rule: `required|port`,
          },
          {
            isGroup: true,
            label: `PARKS (${$.profile.parks.length})`,
            hasMargin: true,
          },
          ...$.profile.parks.map((p, i) => ({
            disabled: true,
            name: `parks[${i}]`,
            value: p,
            label: `PARK ${i + 1}`,
            onRemoveBtnPress: props.footerLogout
              ? null
              : () => $.onAddingParkRemove(i),
          })),
          ...(props.footerLogout
            ? []
            : [
                {
                  name: `parks[new]`,
                  label: `NEW PARK`,
                  value: $.addingPark,
                  onValueChange: v => $.set(`addingPark`, v),
                  onCreateBtnPress: $.onAddingParkSubmit,
                },
              ]),
        ]}
        k="profile"
        onValidSubmit={$.onValidSubmit}
      />
    </Layout>
  );
});

export default ProfileCreateForm;
