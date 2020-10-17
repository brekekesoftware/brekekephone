import { observer } from 'mobx-react'
import React from 'react'

import UserItem from '../-contact/UserItem'
import g from '../global'
import authStore from '../global/authStore'
import callStore from '../global/callStore'
import intl from '../intl/intl'
import { Text, TouchableOpacity } from '../Rn'
import Field from '../shared/Field'
import Layout from '../shared/Layout'

@observer
class PageCallParks extends React.Component<{
  callParks2: boolean
}> {
  state = {
    selectedPark: null,
  }

  selectPark = selectedPark => {
    this.setState({
      selectedPark:
        selectedPark === this.state.selectedPark ? null : selectedPark,
    })
  }

  park = () => {
    const p = this.state.selectedPark
    return this.props.callParks2
      ? callStore.currentCall?.park(p)
      : callStore.startCall(p || '')
  }

  render() {
    const ps = authStore.currentProfile.parks
    const p = this.state.selectedPark
    const p2 = this.props.callParks2
    return (
      <Layout
        description={intl`Your park numbers`}
        fabOnNext={p ? this.park : null}
        fabOnNextText={p2 ? intl`START PARKING` : intl`CALL PARK`}
        menu={p2 ? null : 'call'}
        onBack={p2 ? g.backToPageCallManage : null}
        subMenu={p2 ? null : 'parks'}
        title={intl`Park`}
      >
        {!ps.length && (
          <React.Fragment>
            <Field isGroup label={intl`PARK (0)`} />
            <Text padding>{intl`This account has no park number`}</Text>
          </React.Fragment>
        )}
        {ps.map((u, i) => (
          <TouchableOpacity key={i} onPress={() => this.selectPark(u)}>
            <UserItem
              key={i}
              name={intl`Park ${i + 1}: ${u}`}
              selected={p === u}
            />
          </TouchableOpacity>
        ))}
      </Layout>
    )
  }
}

export default PageCallParks
