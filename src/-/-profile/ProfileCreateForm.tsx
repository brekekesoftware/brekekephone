import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { observer } from 'mobx-react'
import React from 'react'
import { View } from 'react-native'

import g from '../global'
import authStore from '../global/authStore'
import intl from '../intl/intl'
import { RnText } from '../Rn'
import Layout from '../shared/Layout'
import useForm from '../utils/useForm'
import useStore from '../utils/useStore'

const ProfileCreateForm = observer(props => {
  const m = () => ({
    observable: {
      profile: {
        ...g.genEmptyProfile(),
        ...cloneDeep(props.updatingProfile),
      },
      addingPark: '',
    },
    resetAllFields: () => {
      g.showPrompt({
        title: intl`Reset`,
        message: intl`Do you want to reset the form to the original data?`,
        onConfirm: () => {
          $.set('profile', p => ({
            ...g.genEmptyProfile(),
            ...cloneDeep(props.updatingProfile),
            id: p.id,
          }))
        },
        confirmText: intl`RESET`,
      })
    },
    //
    onAddingParkSubmit: () => {
      $.set('profile', p => {
        $.addingPark = $.addingPark.trim()
        if ($.addingPark) {
          p.parks.push($.addingPark)
          $.addingPark = ''
        }
        return p
      })
    },
    onAddingParkRemove: i => {
      g.showPrompt({
        title: intl`Remove Park`,
        message: (
          <React.Fragment>
            <RnText small>
              Park {i + 1}: {$.profile.parks[i]}
            </RnText>
            <View />
            <RnText>{intl`Do you want to remove this park?`}</RnText>
          </React.Fragment>
        ),
        onConfirm: () => {
          $.set('profile', p => {
            p.parks = p.parks.filter((_, _i) => _i !== i)
            return p
          })
        },
      })
    },
    //
    hasUnsavedChanges: () => {
      const p = props.updatingProfile || g.genEmptyProfile()
      if (!props.updatingProfile) {
        Object.assign(p, {
          id: $.profile.id,
        })
      }
      return !isEqual($.profile, p)
    },
    onBackBtnPress: () => {
      if (!$.hasUnsavedChanges()) {
        props.onBack()
        return
      }
      g.showPrompt({
        title: intl`Discard Changes`,
        message: intl`Do you want to discard all unsaved changes and go back?`,
        onConfirm: props.onBack,
        confirmText: intl`DISCARD`,
      })
    },
    onValidSubmit: () => {
      props.onSave($.profile, $.hasUnsavedChanges())
    },
  })
  type M0 = ReturnType<typeof m>
  type M = Omit<M0, 'observable'> &
    M0['observable'] &
    ReturnType<typeof useStore>
  const $ = (useStore(m) as any) as M
  const [Form, submitForm, revalidate] = useForm()
  return (
    <Layout
      description={
        props.updatingProfile
          ? `${props.updatingProfile.pbxUsername} - ${props.updatingProfile.pbxHostname}`
          : intl`Create a new sign in account`
      }
      dropdown={
        props.footerLogout
          ? [
              ...(authStore.isConnFailure
                ? [
                    {
                      label: intl`Reconnect to server`,
                      onPress: authStore.reconnectWithUcLoginFromAnotherPlace,
                    },
                  ]
                : []),
              {
                label: intl`Logout`,
                onPress: authStore.signOut,
                danger: true,
              },
            ]
          : [
              {
                label: intl`Reset form`,
                onPress: $.resetAllFields,
              },
            ]
      }
      fabOnBack={props.footerLogout ? null : $.onBackBtnPress}
      fabOnNext={props.footerLogout ? null : submitForm}
      menu={props.footerLogout ? 'settings' : null}
      onBack={props.footerLogout ? null : $.onBackBtnPress}
      subMenu={props.footerLogout ? 'profile' : null}
      title={props.title}
    >
      <Form
        $={$}
        fields={[
          {
            isGroup: true,
            label: intl`PBX`,
          },
          {
            // autoFocus: true, // TODO Animation issue
            disabled: props.footerLogout,
            name: 'pbxUsername',
            label: intl`USERNAME`,
            rule: 'required',
          },
          {
            disabled: props.footerLogout,
            secureTextEntry: true,
            name: 'pbxPassword',
            label: intl`PASSWORD`,
            rule: 'required',
          },
          {
            disabled: props.footerLogout,
            name: 'pbxTenant',
            label: intl`TENANT`,
          },
          {
            disabled: props.footerLogout,
            name: 'pbxHostname',
            label: intl`HOSTNAME`,
            rule: 'required|hostname',
          },
          {
            disabled: props.footerLogout,
            keyboardType: 'numeric',
            name: 'pbxPort',
            label: intl`PORT`,
            rule: 'required|port',
          },
          {
            disabled: props.footerLogout,
            type: 'Picker',
            name: 'pbxPhoneIndex',
            label: intl`PHONE`,
            rule: 'required',
            options: [1, 2, 3, 4].map(v => ({
              key: `${v}`,
              label: intl`Phone ${v}`,
            })),
          },
          {
            disabled: props.footerLogout,
            type: 'Switch',
            name: 'pbxTurnEnabled',
            label: intl`TURN`,
          },
          {
            disabled: props.footerLogout,
            type: 'Switch',
            name: 'pushNotificationEnabled',
            label: intl`PUSH NOTIFICATION`,
          },
          {
            isGroup: true,
            label: intl`UC`,
            hasMargin: true,
          },
          {
            disabled: props.footerLogout,
            type: 'Switch',
            name: 'ucEnabled',
            label: intl`UC`,
            onValueChange: v => {
              $.set('profile', p => {
                if (v && !p.ucHostname && !p.ucPort) {
                  p.ucHostname = p.pbxHostname
                  p.ucPort = p.pbxPort
                  // TODO
                  // revalidate('ucHostname', 'ucPort');
                  revalidate('ucHostname', p.ucHostname)
                  revalidate('ucPort', p.ucPort)
                }
                p.ucEnabled = v
                return p
              })
            },
          },
          {
            disabled: props.footerLogout || !$.profile.ucEnabled,
            name: 'ucHostname',
            label: intl`HOSTNAME`,
            rule: 'required|hostname',
          },
          {
            keyboardType: 'numeric',
            disabled: props.footerLogout || !$.profile.ucEnabled,
            name: 'ucPort',
            label: intl`PORT`,
            rule: 'required|port',
          },
          {
            isGroup: true,
            label: intl`PARKS (${$.profile.parks.length})`,
            hasMargin: true,
          },
          ...$.profile.parks.map((p, i) => ({
            disabled: true,
            name: `parks[${i}]`,
            value: p,
            label: intl`PARK ${i + 1}`,
            onRemoveBtnPress: props.footerLogout
              ? null
              : () => $.onAddingParkRemove(i),
          })),
          ...(props.footerLogout
            ? []
            : [
                {
                  name: 'parks[new]',
                  label: intl`NEW PARK`,
                  value: $.addingPark,
                  onValueChange: v => $.set('addingPark', v),
                  onCreateBtnPress: $.onAddingParkSubmit,
                },
              ]),
        ]}
        k='profile'
        onValidSubmit={$.onValidSubmit}
      />
    </Layout>
  )
})

export default ProfileCreateForm
