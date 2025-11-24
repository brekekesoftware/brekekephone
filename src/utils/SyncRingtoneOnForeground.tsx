import React from 'react'
import type { AppStateStatus, NativeEventSubscription } from 'react-native'
import { AppState } from 'react-native'

import type { RingtoneOption } from '#/utils/getRingtoneOptions'
import { handleRingtoneOptionsInSetting } from '#/utils/getRingtoneOptions'

type Props = {
  onForeGround: ({ ro, r }: { ro: RingtoneOption[]; r: string }) => void
}
type State = {
  appState: AppStateStatus
}

export class SyncRingtoneOnForeground extends React.Component<Props, State> {
  private appStateListener: NativeEventSubscription | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      appState: AppState.currentState,
    }
  }

  componentDidMount() {
    this.appStateListener = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    )
  }

  componentWillUnmount() {
    this.appStateListener?.remove()
  }

  handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const { appState } = this.state
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      const r = await handleRingtoneOptionsInSetting()
      if (r) {
        this.props.onForeGround(r)
      }
    }

    this.setState({ appState: nextAppState })
  }

  render() {
    return null
  }
}
