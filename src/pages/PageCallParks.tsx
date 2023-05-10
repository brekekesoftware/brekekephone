import { uniqBy } from 'lodash'
import { observer } from 'mobx-react'
import { Component } from 'react'

import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnText, RnTouchableOpacity } from '../components/Rn'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

@observer
export class PageCallParks extends Component<{
  callParks2: boolean
}> {
  prevId?: string
  componentDidMount() {
    this.componentDidUpdate()
  }
  componentDidUpdate() {
    if (!this.props.callParks2) {
      return
    }
    const oc = getCallStore().getOngoingCall()
    if (this.prevId && this.prevId !== oc?.id) {
      Nav().backToPageCallManage()
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
    return this.props.callParks2
      ? getCallStore().getOngoingCall()?.park(p)
      : getCallStore().startCall(p || '')
  }

  render() {
    const cp = getAuthStore().getCurrentAccount()
    if (!cp) {
      return null
    }

    const arr =
      cp.parks?.map((p, i) => ({
        park: p,
        name: cp.parkNames?.[i] || '',
      })) || []
    const parks = uniqBy(arr, 'park')

    const sp = this.state.selectedPark
    const cp2 = this.props.callParks2
    void getCallStore().getOngoingCall() // trigger componentDidUpdate
    const isDisable = (parkNumber: string) => {
      if (cp2) {
        return !!getCallStore().parkNumbers[parkNumber]
      }
      return !getCallStore().parkNumbers[parkNumber]
    }

    return (
      <Layout
        description={intl`Your park numbers`}
        fabOnNext={sp ? this.park : undefined}
        fabOnNextText={cp2 ? intl`START PARKING` : intl`CALL PARK`}
        menu={cp2 ? undefined : 'call'}
        onBack={cp2 ? Nav().backToPageCallManage : undefined}
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
