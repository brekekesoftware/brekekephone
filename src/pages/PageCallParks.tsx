import { observer } from 'mobx-react'
import { Component } from 'react'

import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnText, RnTouchableOpacity } from '../components/Rn'
import { getAuthStore } from '../stores/authStore'
import { callStore } from '../stores/callStore'
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
    const c = callStore.getCurrentCall()
    if (this.prevId && this.prevId !== c?.id) {
      Nav().backToPageCallManage()
    }
    this.prevId = c?.id
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
      ? callStore.getCurrentCall()?.park(p)
      : callStore.startCall(p || '')
  }

  render() {
    const cp = getAuthStore().getCurrentAccount()
    if (!cp) {
      return null
    }
    const parks =
      cp.parks?.map((p, i) => ({
        park: p,
        name: cp.parkNames?.[i] || '',
      })) || []
    const sp = this.state.selectedPark
    const cp2 = this.props.callParks2
    void callStore.getCurrentCall() // trigger componentDidUpdate

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
          <RnTouchableOpacity key={i} onPress={() => this.selectPark(p.park)}>
            <UserItem
              key={i}
              name={
                intl`Park` + ` ${i + 1}: ${p.park}${p.name && ' - '}${p.name}`
              }
              selected={p.park === sp}
            />
          </RnTouchableOpacity>
        ))}
      </Layout>
    )
  }
}
