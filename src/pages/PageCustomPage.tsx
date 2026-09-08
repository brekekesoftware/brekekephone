import { observer } from 'mobx-react'
import { Component } from 'react'

import { ctx } from '#/stores/ctx'

@observer
export class PageCustomPage extends Component<{ id: string }> {
  componentDidMount = () => {
    void ctx.auth.ensureCustomPageUrlBuilt(this.props.id)
  }

  render() {
    return null
  }
}
