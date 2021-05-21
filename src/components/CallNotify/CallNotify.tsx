import { observer } from 'mobx-react'
import React from 'react'
import { View } from 'react-native'

import callStore from '../../stores/callStore'
import contactStore from '../../stores/contactStore'
import CustomImages from '../../utils/CustomImages'
import CallButtons from '../CallButtons/CallButtons'
import CallerInfo from '../CallerInfo/CallerInfo'
import CustomGradient from '../CustomGradient/CustomGradient'
import PoweredBy from '../PoweredBy/PoweredBy'
import styles from './Styles'

@observer
class CallNotify extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = {
      callerName: '',
      callerNumer: '',
    }
  }

  fetchPartyName = (partyName: string, partyNumber: string) => {
    const { callerName, callerNumber }: any = this.state

    if (!partyNumber || callerNumber !== partyNumber) {
      this.setState({ callerName: '', callerNumber: partyNumber })
      return
    }

    if (partyName && partyName !== partyNumber) {
      this.setState({ callerName: partyName, callerNumber: partyNumber })
    } else if (partyNumber && !callerName) {
      contactStore.getPartyName(partyNumber, (value: String) =>
        this.setState({ callerName: value, callerNumber: partyNumber }),
      )
    }
  }

  render() {
    const callStoreInfo = callStore.incomingCall
    const callStoreRecentAction = callStore.recentPn?.action
    const { callerName }: any = this.state

    if (!callStoreInfo || callStoreRecentAction) {
      return null
    }
    const { partyName, partyNumber, hangup, answer } = callStoreInfo
    const callerNumber = partyNumber
    const isUserCalling = !callerNumber.includes('+')
    this.fetchPartyName(partyName, partyNumber)

    return (
      <CustomGradient>
        <View style={styles.notify}>
          <CallerInfo
            isUserCalling={isUserCalling}
            callerName={callerName}
            callerNumber={callerNumber}
          ></CallerInfo>
          <View style={styles.notifyContainer}>
            <View style={styles.notifyBtnSideBySide}>
              <CallButtons
                onPress={hangup}
                image={CustomImages.CallDeclinedLogo}
                lable={'Weiger'}
              ></CallButtons>
              <CallButtons
                onPress={answer}
                image={CustomImages.CallAcceptedLogo}
                lable={'Accepteer'}
              ></CallButtons>
            </View>
            <PoweredBy />
          </View>
        </View>
      </CustomGradient>
    )
  }
}

export default CallNotify
