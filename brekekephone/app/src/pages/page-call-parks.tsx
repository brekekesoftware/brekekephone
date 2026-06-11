import { uniqBy } from '@rntwsc/shared/lodash'
import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'

import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { ParkItem } from '#/components/park-item'
import { RnText } from '#/components/rn'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

export const PageCallParks = observer(({ ongoing }: { ongoing: boolean }) => {
  const prevIdRef = useRef<string | undefined>(undefined)
  const flashAnim = useRef(new Animated.Value(0)).current
  // RN's Animated.loop sets an internal `isFinished` flag on stop() that is
  // never reset, so the same loop instance cannot be restarted. We create a
  // fresh loop each time we need to start animating.
  const flashLoopRef = useRef<Animated.CompositeAnimation | undefined>(
    undefined,
  )

  const [selectedPark, setSelectedPark] = useState('')

  const stopFlashLoop = () => {
    flashLoopRef.current?.stop()
    flashLoopRef.current = undefined
    flashAnim.setValue(0)
  }

  const startFlashLoop = () => {
    flashLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.delay(1000),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    )
    flashLoopRef.current.start()
  }

  // Only run animation when in pickup mode and there are occupied slots
  const hasOccupied = !ongoing && Object.keys(ctx.call.parkNumbers).length > 0
  useEffect(() => {
    if (hasOccupied && !flashLoopRef.current) {
      startFlashLoop()
    } else if (!hasOccupied && flashLoopRef.current) {
      stopFlashLoop()
    }
  }, [hasOccupied])

  useEffect(() => () => stopFlashLoop(), [])

  const oc = ctx.call.getOngoingCall()
  const ocId = oc?.id
  useEffect(() => {
    if (!ongoing) {
      return
    }
    if (prevIdRef.current && prevIdRef.current !== ocId) {
      ctx.nav.backToPageCallManage()
    }
    prevIdRef.current = ocId
  }, [ocId, ongoing])

  const selectPark = (park: string) => {
    setSelectedPark(park === selectedPark ? '' : park)
  }

  const park = () => {
    const p = selectedPark
    setSelectedPark('')
    if (ongoing) {
      return ctx.call.getOngoingCall()?.park(p)
    }
    return ctx.call.startParkPickupCall(p)
  }

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

  const sp = selectedPark
  void ctx.call.getOngoingCall() // trigger re-render on oc changes

  // Only treat selection as active if that slot is still available
  const selectedOccupied = !!ctx.call.parkNumbers[sp]
  const selectedAvailable =
    sp && (ongoing ? !selectedOccupied : selectedOccupied)
  const effectiveSp = selectedAvailable ? sp : ''

  return (
    <Layout
      description={intl`Your park numbers`}
      fabOnNext={effectiveSp ? park : undefined}
      fabOnNextText={ongoing ? intl`START PARKING` : intl`CALL PARK`}
      menu={ongoing ? undefined : 'call'}
      onBack={ongoing ? ctx.nav.backToPageCallManage : undefined}
      subMenu={ongoing ? undefined : 'parks'}
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
        const available = ongoing ? !isOccupied : isOccupied
        return (
          <ParkItem
            key={p.park}
            index={i}
            name={intl`Park` + ` ${i + 1}: ${p.name}`}
            parkNumber={p.park}
            selected={p.park === effectiveSp}
            available={available}
            flashAnim={!ongoing && isOccupied ? flashAnim : undefined}
            onPress={() => {
              if (available) {
                selectPark(p.park)
              }
            }}
          />
        )
      })}
    </Layout>
  )
})
