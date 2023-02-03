import { cloneDeep, isEqual } from 'lodash'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { Platform, View } from 'react-native'

import { Account, accountStore } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { debugStore } from '../stores/debugStore'
import { intl, intlDebug } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'
import { useForm } from '../utils/useForm'
import { useStore } from '../utils/useStore'
import { Layout } from './Layout'
import { RnText } from './Rn'

export const AccountCreateForm: FC<{
  updating?: Account
  onBack: Function
  onSave: Function
  footerLogout?: boolean
  title: string
}> = observer(props => {
  const isWeb = Platform.OS === 'web'
  const m = () => ({
    observable: {
      account: {
        ...accountStore.genEmptyAccount(),
        ...cloneDeep(props.updating),
      },
      addingPark: { name: '', number: '' },
    },
    resetAllFields: () => {
      RnAlert.prompt({
        title: intl`Reset`,
        message: intl`Do you want to reset the form to the original data?`,
        onConfirm: () => {
          $.set('account', (p: Account) => ({
            ...accountStore.genEmptyAccount(),
            ...cloneDeep(props.updating),
            id: p.id,
          }))
        },
        confirmText: intl`RESET`,
      })
    },
    //
    onAddingParkSubmit: () => {
      $.set('account', (p: Account) => {
        p.parks = p.parks || []
        p.parkNames = p.parkNames || []
        if ($.addingPark.name && $.addingPark.number) {
          if (p.parkNames.length !== p.parks.length) {
            const { parkNames } = p
            p.parkNames = p.parks.map((_, i) => parkNames[i] || '')
          }
          if (p.parks.includes($.addingPark.number)) {
            RnAlert.error({
              message: intlDebug`Park number ${$.addingPark.number} already exist`,
            })
            return p
          }
          p.parks.push($.addingPark.number)
          p.parkNames.push($.addingPark.name)
          $.addingPark = { name: '', number: '' }
        }
        return p
      })
    },
    onAddingParkRemove: (i: number) => {
      RnAlert.prompt({
        title: intl`Remove Park`,
        message: (
          <>
            <RnText small>
              Park {i + 1}:{' '}
              {$.account.parks?.[i] + ' - ' + $.account.parkNames?.[i]}
            </RnText>
            <View />
            <RnText>{intl`Do you want to remove this park?`}</RnText>
          </>
        ),
        onConfirm: () => {
          $.set('account', (p: Account) => {
            p.parks = p.parks?.filter((p0, i0) => i0 !== i)
            return p
          })
        },
      })
    },
    //
    hasUnsavedChanges: () => {
      const a = props.updating || accountStore.genEmptyAccount()
      if (!props.updating) {
        Object.assign(a, {
          id: $.account.id,
        })
      }
      return !isEqual($.account, a)
    },
    onBackBtnPress: () => {
      if (!$.hasUnsavedChanges()) {
        props.onBack()
        return
      }
      RnAlert.prompt({
        title: intl`Discard Changes`,
        message: intl`Do you want to discard all unsaved changes and go back?`,
        onConfirm: props.onBack,
        confirmText: intl`DISCARD`,
      })
    },
    onValidSubmit: () => {
      console.log({ account: $.account })
      props.onSave($.account, $.hasUnsavedChanges())
    },
  })
  type M0 = ReturnType<typeof m>
  type M = Omit<M0, 'observable'> &
    M0['observable'] &
    ReturnType<typeof useStore>
  const $ = useStore(m) as any as M
  const [Form, submitForm] = useForm()
  const as = getAuthStore()
  return (
    <Layout
      description={
        props.updating
          ? `${props.updating.pbxUsername} - ${props.updating.pbxHostname}`
          : intl`Create a new sign in account`
      }
      dropdown={
        props.footerLogout
          ? [
              ...(as.isConnFailure()
                ? [
                    {
                      label: intl`Reconnect to server`,
                      onPress:
                        as.resetFailureStateIncludeUcLoginFromAnotherPlace,
                    },
                  ]
                : []),
              ...(Platform.OS !== 'web'
                ? [
                    {
                      label: intl`Open debug log`,
                      onPress: debugStore.openLogFile,
                    },
                  ]
                : []),
              {
                label: intl`Logout`,
                onPress: as.signOut,
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
      fabOnBack={props.footerLogout ? undefined : $.onBackBtnPress}
      fabOnNext={props.footerLogout ? undefined : (submitForm as () => void)}
      menu={props.footerLogout ? 'settings' : undefined}
      onBack={props.footerLogout ? undefined : $.onBackBtnPress}
      subMenu={props.footerLogout ? 'account' : undefined}
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
            type: 'RnPicker',
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
            hidden: isWeb,
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
            onValueChange: (v: boolean) => {
              $.set('account', (p: Account) => {
                p.ucEnabled = v
                return p
              })
            },
          },
          {
            isGroup: true,
            label: intl`PARKS (${$.account.parks?.length})`,
            hasMargin: true,
          },
          ...($.account.parks?.map((p, i) => {
            const parkName = $.account.parkNames?.[i]
            return {
              disabled: true,
              name: `parks[${i}]`,
              type: 'PARK',
              value: `${p} ${parkName ? '- ' + parkName : ''}`,
              label: intl`PARK ${i + 1}`,
              onRemoveBtnPress: props.footerLogout
                ? null
                : () => $.onAddingParkRemove(i),
            }
          }) || []),
          ...(props.footerLogout
            ? []
            : [
                {
                  name: 'parks[new]',
                  label: intl`NEW PARK`,
                  type: 'PARK',
                  value: $.addingPark,
                  onValueChange: (v: { number: string; name?: string }) =>
                    $.set('addingPark', v),
                  onCreateBtnPress: $.onAddingParkSubmit,
                },
              ]),
        ]}
        k='account'
        onValidSubmit={$.onValidSubmit}
      />
    </Layout>
  )
})
