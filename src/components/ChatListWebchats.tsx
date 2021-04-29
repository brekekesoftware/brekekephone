import { observer } from 'mobx-react'
import React, { FC } from 'react'

import { Conference } from '../api/brekekejs'
import WebchatItem from './WebchatItem'

const ListWebchats: FC<{
  datas: Conference[]
}> = p => (
  <>
    {p.datas.map((item: Conference) => (
      <WebchatItem data={item} />
    ))}
  </>
)

export default observer(ListWebchats)
