import { observer } from 'mobx-react'
import { useRef } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { ItemType } from 'react-native-dropdown-picker'

import { mdiKeyboardBackspace } from '../assets/icons'
import { ButtonIcon } from '../components/ButtonIcon'
import {
  Account,
  accountStore,
  saveLastSignedInId,
} from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { Input } from './Input'
import { InvokeGradient } from './InvokeGradient'

const formArr = [
  {
    id: 0,
    name: 'User name',
    key: 'pbxUsername',
    errMessage: 'User name is required',
  },
  {
    id: 1,
    name: 'Password',
    key: 'pbxPassword',
    errMessage: 'Password is required',
  },
  { id: 2, name: 'Tenant', key: 'pbxTenant', errMessage: 'Tenant is required' },
  {
    id: 3,
    name: 'Host name',
    key: 'pbxHostname',
    errMessage: 'Host name is required',
  },
  { id: 4, name: 'Port', key: 'pbxPort', errMessage: 'Port is required' },
  { id: 5, name: 'Phone', key: 'pbxPhoneIndex', isRequired: false },
]

const dropdownItems: ItemType<any>[] = [
  { label: 'Phone 1', value: '1' },
  { label: 'Phone 2', value: '2' },
  { label: 'Phone 3', value: '3' },
  { label: 'Phone 4', value: '4' },
]
export const AccountForm = observer(({ onBack }: { onBack(): void }) => {
  const refs = useRef<any[]>([])
  const ids = accountStore.accounts.map(a => a.id).filter(id => id)
  const account = ids[0] ? { ...accountStore.accountsMap[ids[0]] } : undefined

  const validate = () => {
    const data: Account = account ?? accountStore.genEmptyAccount()
    let isSuccess = true
    refs.current.forEach(item => {
      const d = item.getValue()
      if (d.err) {
        isSuccess = false
      }
      data[d.key] = d.value
    })
    return { data, isSuccess }
  }

  const signOut = async () => {
    await saveLastSignedInId(false)
    getAuthStore().signOutWithoutSaving()
  }

  const save = async () => {
    const result = validate()
    console.log('#Duy Phan console result', result)
    if (!result.isSuccess) {
      return
    }
    await signOut()
    onBack()
    accountStore.upsertAccount(result.data)
    getAuthStore().signIn(result.data)
  }

  const dataForm = formArr.map(item => ({
    ...item,
    value: account ? account[item.key] : undefined,
  }))
  return (
    <InvokeGradient>
      <ScrollView
        keyboardShouldPersistTaps='always'
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <ButtonIcon
              path={mdiKeyboardBackspace}
              color='white'
              size={28}
              noborder
              style={styles.btnBack}
              onPress={onBack}
            />
            <View style={styles.titleView}>
              <Text style={styles.title}>
                {account ? 'Edit Account' : 'Create Account'}
              </Text>
            </View>
          </View>

          <View style={styles.main}>
            {dataForm.map(item => (
              <Input
                title={item.name}
                ref={el => (refs.current[item.id] = el)}
                key={item.id.toString()}
                k={item.key}
                type={item.key === 'pbxPhoneIndex' ? 'dropdown' : undefined}
                secureTextEntry={item.key === 'pbxPassword'}
                items={dropdownItems}
                isRequired={item.isRequired}
                keyboardType={item.key === 'pbxPort' ? 'numeric' : undefined}
                errMessage={item.errMessage}
                value={item.value}
              />
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={save}>
              <Text>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 15 }}></View>
      </ScrollView>
    </InvokeGradient>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
    marginTop: 10,
  },
  titleView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: {
    width: 100,
    backgroundColor: 'rgb(237, 228, 181)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    height: 45,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnBack: { position: 'absolute', left: 5 },
})
