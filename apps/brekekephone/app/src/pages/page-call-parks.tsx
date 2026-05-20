import { observer } from 'mobx-react'
import { Component } from 'react'

import { uniqBy } from '@/shared/lodash'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { ParkItem } from '#/components/park-item'
import { RnText } from '#/components/rn'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

@observer
export class PageCallParks extends Component<{
  ongoing: boolean
}> {
  prevId?: string
  // pickup mode: occupied slots flash to grab attention. We toggle a boolean
  // on a timer and let ParkItem's `transition-*` classes animate the color.
  flashTimer?: ReturnType<typeof setTimeout>

  componentDidMount = () => {
    this.updateFlash()
    this.componentDidUpdate()
  }
  componentWillUnmount = () => {
    this.clearFlashTimer()
  }
  componentDidUpdate = () => {
    this.updateFlash()
    if (!this.props.ongoing) {
      return
    }
    const oc = ctx.call.getOngoingCall()
    if (this.prevId && this.prevId !== oc?.id) {
      ctx.nav.backToPageCallManage()
    }
    this.prevId = oc?.id
  }

  // Only run animation when in pickup mode and there are occupied slots
  updateFlash = () => {
    const cp2 = this.props.ongoing
    const hasOccupied = !cp2 && Object.keys(ctx.call.parkNumbers).length > 0
    if (hasOccupied && !this.flashTimer) {
      this.startFlash()
    } else if (!hasOccupied && this.flashTimer) {
      this.stopFlash()
    }
  }

  // true for 2500ms (1500ms rise + 1000ms hold), false for 1000ms (fall) —
  // same rhythm as the old Animated.sequence loop.
  startFlash = () => {
    const tick = () => {
      this.setState({ flashOn: true })
      this.flashTimer = setTimeout(() => {
        this.setState({ flashOn: false })
        this.flashTimer = setTimeout(tick, 1000)
      }, 2500)
    }
    tick()
  }

  clearFlashTimer = () => {
    if (this.flashTimer) {
      clearTimeout(this.flashTimer)
      this.flashTimer = undefined
    }
  }

  stopFlash = () => {
    this.clearFlashTimer()
    this.setState({ flashOn: false })
  }

  state = {
    selectedPark: '',
    flashOn: false,
  }

  selectPark = (selectedPark: string) => {
    this.setState({
      selectedPark:
        selectedPark === this.state.selectedPark ? '' : selectedPark,
    })
  }

  park = () => {
    const p = this.state.selectedPark
    this.setState({ selectedPark: '' })
    if (this.props.ongoing) {
      return ctx.call.getOngoingCall()?.park(p)
    }
    return ctx.call.startParkPickupCall(p)
  }

  render() {
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return null
    }

    const arr =
      ca.parks?.map((p, i) => ({
        park: p,
        name: ca.parkNames?.[i] || '',
      })) || []
    const parks = uniqBy(arr, 'park')

    const sp = this.state.selectedPark
    const cp2 = this.props.ongoing
    void ctx.call.getOngoingCall() // trigger componentDidUpdate

    // Only treat selection as active if that slot is still available
    const selectedOccupied = !!ctx.call.parkNumbers[sp]
    const selectedAvailable = sp && (cp2 ? !selectedOccupied : selectedOccupied)
    const effectiveSp = selectedAvailable ? sp : ''

    return (
      <Layout
        description={intl`Your park numbers`}
        fabOnNext={effectiveSp ? this.park : undefined}
        fabOnNextText={cp2 ? intl`START PARKING` : intl`CALL PARK`}
        menu={cp2 ? undefined : 'call'}
        onBack={cp2 ? ctx.nav.backToPageCallManage : undefined}
        subMenu={cp2 ? undefined : 'parks'}
        title={intl`Park`}
      >
        {!parks.length && (
          <>
            <Field isGroup label={intl`PARK (0)`} />
            <RnText padding>{intl`This account has no park number`}</RnText>
          </>
        )}
        {parks.map((p, i) => {
          const isOccupied = !!ctx.call.parkNumbers[p.park]
          // park mode: available when slot is empty
          // pickup mode: available when slot is occupied
          const available = cp2 ? !isOccupied : isOccupied
          return (
            <ParkItem
              key={p.park}
              index={i}
              name={intl`Park` + ` ${i + 1}: ${p.name}`}
              parkNumber={p.park}
              selected={p.park === effectiveSp}
              available={available}
              flash={!cp2 && isOccupied}
              flashOn={this.state.flashOn}
              onPress={() => {
                if (available) {
                  this.selectPark(p.park)
                }
              }}
            />
          )
        })}
      </Layout>
    )
  }
}
