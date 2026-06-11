import { observer } from 'mobx-react'
import type { FC } from 'react'

import { WebchatItem } from '#/components/webchat-item'
import type { ChatGroup } from '#/stores/chat-store'

export const ListWebchats: FC<{
  datas: ChatGroup[]
}> = observer(p => (
  <>
    {p.datas.map(
      (item: ChatGroup) =>
        item.webchat && <WebchatItem key={item.id} data={item.webchat} />,
    )}
  </>
))
