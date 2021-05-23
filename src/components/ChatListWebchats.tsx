import { observer } from 'mobx-react'
import React, { FC } from 'react'

import { ChatGroup } from '../stores/chatStore'
import WebchatItem from './WebchatItem'

const ListWebchats: FC<{
  datas: ChatGroup[]
}> = p => (
  <>
    {p.datas.map(
      (item: ChatGroup) =>
        item.webchat && <WebchatItem key={item.id} data={item.webchat} />,
    )}
  </>
)

export default observer(ListWebchats)
