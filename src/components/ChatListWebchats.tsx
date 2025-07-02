import { observer } from 'mobx-react'
import type { FC } from 'react'

import { WebchatItem } from '#/components/WebchatItem'
import type { ChatGroup } from '#/stores/chatStore'

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
