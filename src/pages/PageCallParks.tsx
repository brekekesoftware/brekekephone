import { observer } from 'mobx-react'
import React, { Component } from 'react'

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
    const ps = getAuthStore().currentProfile.parks
    const p = this.state.selectedPark
    const p2 = this.props.callParks2
    void callStore.getCurrentCall() // trigger componentDidUpdate

    return (
      <Layout
        description={intl`Your park numbers`}
        fabOnNext={p ? this.park : undefined}
        fabOnNextText={p2 ? intl`START PARKING` : intl`CALL PARK`}
        menu={p2 ? undefined : 'call'}
        onBack={p2 ? Nav().backToPageCallManage : undefined}
        subMenu={p2 ? undefined : 'parks'}
        title={intl`Park`}
      >
        {!ps.length && (
          <>
            <Field isGroup label={intl`PARK (0)`} />
            <RnText padding>{intl`This account has no park number`}</RnText>
          </>
        )}
        {ps.map((u, i) => (
          <RnTouchableOpacity key={i} onPress={() => this.selectPark(u)}>
            <UserItem
              key={i}
              name={intl`Park ${i + 1}: ${u}`}
              selected={p === u}
            />
          </RnTouchableOpacity>
        ))}
      </Layout>
    )
  }
}
