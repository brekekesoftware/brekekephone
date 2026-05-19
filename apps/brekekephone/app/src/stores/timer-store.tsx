import { action, observable } from 'mobx'
import { observer } from 'mobx-react'

import { RnText } from '#/components/rn'
import type { TRnTextProps } from '#/components/rn-text'
import { BackgroundTimer } from '#/utils/background-timer'
import { formatDuration } from '#/utils/format-duration'

class TimerStore {
  @observable now = Date.now()
  constructor() {
    BackgroundTimer.setInterval(this.updateNow, 1000)
  }
  @action private updateNow = () => {
    this.now = Date.now()
  }
}

export const timerStore = new TimerStore()

type TDurationProps = Omit<TRnTextProps, 'children'> & {
  children: number
}

export const Duration = observer(({ children, ...p }: TDurationProps) => (
  <RnText {...p}>
    {formatDuration(children && timerStore.now - children)}
  </RnText>
))
