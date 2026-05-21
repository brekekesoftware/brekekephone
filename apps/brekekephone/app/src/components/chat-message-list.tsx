import { observer } from 'mobx-react'
import type { FC } from 'react'

import { View } from '@/rn/core/components/view'
import { sortBy, uniqBy } from '@/shared/lodash'
import { Avatar } from '#/components/avatar'
import { groupByTimestamp } from '#/components/chat-config'
import { Message } from '#/components/chat-message'
import { RnText } from '#/components/rn'
import type { ChatMessage } from '#/stores/chat-store'
import { ctx } from '#/stores/ctx'

export const MessageList: FC<{
  acceptFile: Function
  list: ChatMessage[]
  loadMore: Function
  rejectFile: Function
  resolveChat: Function
  isGroupChat?: boolean
}> = observer(p => {
  const { acceptFile, loadMore, rejectFile, resolveChat } = p
  let { list } = p
  // TODO: unique and sort right after fetching
  if (!Array.isArray(list)) {
    list = []
  }
  list = uniqBy(list, 'id')
  list = sortBy(list, 'created')

  return (
    <>
      {groupByTimestamp(list).map(({ date, groupByTime }, i) => (
        <View key={date} className={i ? 'mt-5' : 'mt-0'}>
          <View className='bg-muted absolute top-2.5 right-0.5 left-0.5 h-px' />
          <RnText className='self-center bg-white px-2.5'>{date}</RnText>
          {groupByTime.map(({ messages, time }, j) => {
            const id = messages[0]?.id
            const c0 = resolveChat(id) as ChatMessage & {
              creatorName: string
              creatorAvatar: string
              creatorId: string
            }
            const name = c0?.creatorName
            const status = ctx.contact.getUcUserById(c0.creatorId)?.status
            return (
              <View
                key={`${time}${id}`}
                className={['flex-row pl-2.5', j && 'mt-2.5']}
              >
                <Avatar
                  source={{ uri: c0.creatorAvatar as string }}
                  status={status}
                />
                <View className='flex-col'>
                  <View className='flex-row flex-nowrap pl-2.5'>
                    <RnText bold singleLine>
                      {name}
                    </RnText>
                    <RnText className='text-foreground-muted px-1 text-[11.2px]'>
                      {time}
                    </RnText>
                  </View>
                  <View>
                    {messages.map(m => (
                      <Message
                        {...resolveChat(m.id)}
                        acceptFile={acceptFile}
                        key={m.id}
                        loadMore={loadMore}
                        rejectFile={rejectFile}
                      />
                    ))}
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      ))}
    </>
  )
})
