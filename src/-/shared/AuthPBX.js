import { observe } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'

import pbx from '../api/pbx'
import g from '../global'
import authStore from '../global/authStore'
import { intlDebug } from '../intl/intl'

@observer
class AuthPBX extends React.Component {
  constructor() {
    // TODO notification login not work
    super()
    this.autoAuth()
    this.clearObserve = observe(authStore, 'pbxShouldAuth', this.autoAuth)
  }
  componentWillUnmount() {
    this.clearObserve()
    pbx.disconnect()
    authStore.pbxState = 'stopped'
  }
  auth = () => {
    pbx.disconnect()
    authStore.pbxState = 'connecting'
    pbx
      .connect(authStore.currentProfile)
      .then(() => {
        authStore.pbxState = 'success'
      })
      .catch(err => {
        authStore.pbxState = 'failure'
        authStore.pbxTotalFailure += 1
        g.showError({
          message: intlDebug`Failed to connect to pbx`,
          err,
        })
      })
  }
  autoAuth = () => authStore.pbxShouldAuth && this.auth()

  render() {
    return null
  }
}

export default AuthPBX
