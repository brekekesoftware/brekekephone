import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import { Text, View } from '../native/Rn';
import Layout from '../shared/Layout';
import useForm from '../shared/useForm';
import useStore from '../shared/useStore';

const ProfileCreateForm = observer(props => {
  const $ = useStore(() => ({
    observable: {
      profile: {
        ...g.genEmptyProfile(),
        ...cloneDeep(props.updatingProfile),
      },
      addingPark: ``,
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
      header={{
        onBackBtnPress: $.onBackBtnPress,
        title: props.title,
        description: props.updatingProfile
          ? `${props.updatingProfile.pbxUsername} - ${props.updatingProfile.pbxHostname}`
          : `Create a new sign in profile`,
      }}
      footer={{
        actions: {
          onBackBtnPress: $.onBackBtnPress,
          onSaveBtnPress: submitForm,
        },
      }}
    >
      <Form
        $={$}
        k="profile"
        onValidSubmit={$.onValidSubmit}
        fields={[
          {
            isGroup: true,
            label: `PBX`,
          },
          {
            // autoFocus: true, // TODO Animation issue
            name: `pbxUsername`,
            label: `USERNAME`,
            rule: `required`,
          },
          {
            secureTextEntry: true,
            name: `pbxPassword`,
            label: `PASSWORD`,
            rule: `required`,
          },
          {
            name: `pbxTenant`,
            label: `TENANT`,
            rule: `required`,
          },
          {
            name: `pbxHostname`,
            label: `HOSTNAME`,
            rule: `required|hostname`,
          },
          {
            keyboardType: `numeric`,
            name: `pbxPort`,
            label: `PORT`,
            rule: `required|port`,
          },
          {
            type: `Picker`,
            name: `pbxPhoneIndex`,
            label: `PHONE`,
            options: [1, 2, 3, 4].map(v => ({
              key: `${v}`,
              label: `Phone ${v}`,
            })),
          },
          {
            type: `Switch`,
            name: `pbxTurnEnabled`,
            label: `TURN`,
          },
          {
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
            disabled: !$.profile.ucEnabled,
            name: `ucHostname`,
            label: `HOSTNAME`,
            rule: `required|hostname`,
          },
          {
            keyboardType: `numeric`,
            disabled: !$.profile.ucEnabled,
            name: `ucPort`,
            label: `PORT`,
            rule: `required|port`,
          },
          {
            isGroup: true,
            label: `PARKS`,
            hasMargin: true,
          },
          ...$.profile.parks.map((p, i) => ({
            disabled: true,
            name: `parks[${i}]:${p}`,
            value: p,
            label: `PARK ${i + 1}`,
            onRemoveBtnPress: () => $.onAddingParkRemove(i),
          })),
          {
            name: `parks[new]`,
            label: `NEW PARK`,
            value: $.addingPark,
            onValueChange: v => $.set(`addingPark`, v),
            onCreateBtnPress: $.onAddingParkSubmit,
          },
        ]}
      />
    </Layout>
  );
});

export default ProfileCreateForm;
