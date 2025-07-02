import { uniqBy } from 'lodash'
import { observer } from 'mobx-react'
import { Component } from 'react'

import { UserItem } from '#/components/ContactUserItem'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { RnText, RnTouchableOpacity } from '#/components/Rn'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

@observer
export class PageCallParks extends Component<{
  ongoing: boolean
}> {
  prevId?: string
  componentDidMount = () => {
    this.componentDidUpdate()
  }
  componentDidUpdate = () => {
    if (!this.props.ongoing) {
      return
    }
    const oc = ctx.call.getOngoingCall()
    if (this.prevId && this.prevId !== oc?.id) {
      ctx.nav.backToPageCallManage()
    }
    this.prevId = oc?.id
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
    return this.props.ongoing
      ? ctx.call.getOngoingCall()?.park(p)
      : ctx.call.startCall(p || '')
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
    const isDisable = (parkNumber: string) => {
      if (cp2) {
        return !!ctx.call.parkNumbers[parkNumber]
      }
      return !ctx.call.parkNumbers[parkNumber]
    }

    return (
      <Layout
        description={intl`Your park numbers`}
        fabOnNext={sp && !isDisable(sp) ? this.park : undefined}
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
        {parks.map((p, i) => (
          <RnTouchableOpacity
            key={i}
            onPress={() => {
              if (!isDisable(p.park)) {
                this.selectPark(p.park)
              }
            }}
          >
            <UserItem
              key={i}
              avatar=''
              name={intl`Park` + ` ${i + 1}: ${p.name}`}
              parkNumber={`${p.park}`}
              selected={p.park === sp}
              disabled={isDisable(p.park)}
            />
          </RnTouchableOpacity>
        ))}
      </Layout>
    )
  }
}
