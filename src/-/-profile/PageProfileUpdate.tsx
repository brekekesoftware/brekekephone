import { observer } from 'mobx-react'
import React from 'react'

import g from '../global'
import Nav from '../global/Nav'
import intl from '../intl/intl'
import ProfileCreateForm from './ProfileCreateForm'

const PageProfileUpdate = observer(props => (
  <ProfileCreateForm
    onBack={Nav.backToPageProfileSignIn}
    onSave={p => {
      g.upsertProfile(p)
      Nav.backToPageProfileSignIn()
    }}
    title={intl`Update Account`}
    updatingProfile={g.profilesMap[props.id]}
  />
))

export default PageProfileUpdate
