import { observer } from 'mobx-react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { mdiClose, mdiPencil, mdiPlus } from '../assets/icons'
import { RnIcon } from '../components/RnIcon'
import { accountStore } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { InvokeGradient } from './InvokeGradient'

export const AccountInfo = observer(
  ({ linkToUpdateAccount }: { linkToUpdateAccount(): void }) => {
    const ids = accountStore.accounts.map(a => a.id).filter(id => id)
    const l = ids.length
    const account = accountStore.accountsMap[ids[0]]

    const signOut = () => {
      getAuthStore().signOut()
      accountStore.removeAccount(account.id)
    }
    return (
      <InvokeGradient>
        <View style={styles.container}>
          <Text style={styles.title}>Account Info</Text>
          <View style={styles.infoView}>
            <View style={styles.info}>
              {!!account && (
                <View style={styles.button}>
                  <TouchableOpacity onPress={signOut}>
                    <RnIcon path={mdiClose} color='red' />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.left}>
                {account ? (
                  <>
                    <Text style={styles.infoText}>{account.pbxUsername}</Text>
                    <Text style={styles.infoText}>{account.pbxHostname}</Text>
                  </>
                ) : (
                  <Text style={styles.infoText}>
                    There is no account created
                  </Text>
                )}
              </View>
              <View style={styles.button}>
                {account ? (
                  <TouchableOpacity onPress={linkToUpdateAccount}>
                    <RnIcon path={mdiPencil} color='rgb(0,50,99)' />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={linkToUpdateAccount}>
                    <RnIcon path={mdiPlus} color='rgb(0,50,99)' />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {!l && (
              <View style={styles.noAccount}>
                <Text style={styles.textEmpty}>
                  Please press icon above to create one
                </Text>
              </View>
            )}
          </View>
        </View>
      </InvokeGradient>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
    marginTop: 10,
  },
  infoView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    width: 265,
    height: 55,
    backgroundColor: 'white',
    borderRadius: 8,
    flexDirection: 'row',
  },
  left: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftColor: 'rgb(0,50,99)',
    borderWidth: 0.5,
  },
  infoText: {
    textAlign: 'center',
    color: 'rgb(0,50,99)',
    fontWeight: '500',
  },
  noAccount: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  textEmpty: {
    color: 'white',
  },
})
