import { View } from '@/rn/core/components/view'
import {
  mdiBackspace,
  mdiKeyboard,
  mdiPhone,
  mdiPhoneForward,
} from '#/assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { isWeb } from '#/config'

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

export const KeyPad = (p: {
  onPressNumber(k: string): void
  showKeyboard(): void
  callVoice?(): void
  callVoiceForward?(): void
}) => (
  <>
    {keys.map((row, i) => (
      <View key={i} className='flex-row'>
        {row.map(key => (
          <RnTouchableOpacity
            key={key}
            onPress={() => p.onPressNumber(key)}
            className='w-1/3'
          >
            <RnText center className='py-5 text-[25.2px] font-semibold'>
              {key}
            </RnText>
          </RnTouchableOpacity>
        ))}
      </View>
    ))}
    <View className='flex-row justify-between mt-6.25'>
      <RnTouchableOpacity onPress={p.showKeyboard} className='w-1/3'>
        <RnIcon color={isWeb ? 'white' : undefined} path={mdiKeyboard} />
      </RnTouchableOpacity>
      <View
        className={
          p.callVoiceForward
            ? 'flex-1 flex-row bg-primary-100 items-center justify-between h-12.5 rounded-[25px]'
            : undefined
        }
      >
        {p.callVoiceForward && (
          <RnTouchableOpacity
            onPress={p.callVoiceForward}
            className='bg-primary w-12.5 h-12.5 justify-center rounded-full'
          >
            <RnIcon path={mdiPhoneForward} />
          </RnTouchableOpacity>
        )}
        {p.callVoice && (
          <RnTouchableOpacity
            onPress={p.callVoice}
            className={[
              'bg-primary',
              !p.callVoiceForward
                ? 'w-16 rounded-[40px] py-5'
                : 'w-12.5 h-12.5 justify-center rounded-full',
            ]}
            loading
          >
            <RnIcon path={mdiPhone} />
          </RnTouchableOpacity>
        )}
      </View>
      <RnTouchableOpacity
        onPress={() => p.onPressNumber('')}
        className='w-1/3'
      >
        <RnIcon path={mdiBackspace} />
      </RnTouchableOpacity>
    </View>
  </>
)
