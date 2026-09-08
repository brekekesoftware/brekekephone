import { uniqBy } from 'lodash'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { Animated } from 'react-native'

import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { ParkItem } from '#/components/ParkItem'
import { RnText } from '#/components/Rn'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

@observer
export class PageCallParks extends Component<{
  ongoing: boolean
}> {
  prevId?: string
  flashAnim = new Animated.Value(0)
  // RN's Animated.loop sets an internal `isFinished` flag on stop() that is
  // never reset, so the same loop instance cannot be restarted. We create a
  // fresh loop each time we need to start animating.
  flashLoop?: Animated.CompositeAnimation

  componentDidMount = () => {
    this.updateFlashLoop()
    this.componentDidUpdate()
  }
  componentWillUnmount = () => {
    this.stopFlashLoop()
  }
  componentDidUpdate = () => {
    this.updateFlashLoop()
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
  updateFlashLoop = () => {
    const cp2 = this.props.ongoing
    const hasOccupied = !cp2 && Object.keys(ctx.call.parkNumbers).length > 0
    if (hasOccupied && !this.flashLoop) {
      this.startFlashLoop()
    } else if (!hasOccupied && this.flashLoop) {
      this.stopFlashLoop()
    }
  }

  startFlashLoop = () => {
    this.flashLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(this.flashAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.delay(1000),
        Animated.timing(this.flashAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    )
    this.flashLoop.start()
  }

  stopFlashLoop = () => {
    this.flashLoop?.stop()
    this.flashLoop = undefined
    this.flashAnim.setValue(0)
  }

  state = {
    selectedPark: '',
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
              flashAnim={!cp2 && isOccupied ? this.flashAnim : undefined}
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
