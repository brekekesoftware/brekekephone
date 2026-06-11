import { View } from '@/rn/core/components/view'
import {
  mdiBackspace,
  mdiKeyboard,
  mdiPhone,
  mdiPhoneForward,
} from '#/assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { useWindowDimensions } from '#/utils/rn-core-hooks'

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
}) => {
  const small = useWindowDimensions().height < 700
  return (
    <>
      <View className='flex-1' />
      <View>
        {keys.map((row, i) => (
          <View key={i} className='flex-row'>
            {row.map(key => (
              <RnTouchableOpacity
                key={key}
                onPress={() => p.onPressNumber(key)}
                className={['h-20 w-1/3 items-center py-2', small && 'h-16']}
              >
                <View
                  className={[
                    'bg-foreground/5 border-primary/10 h-16 w-16 items-center justify-center rounded-full border',
                    small && 'h-12 w-12',
                  ]}
                >
                  <RnText center className='text-2xl font-bold'>
                    {key}
                  </RnText>
                </View>
              </RnTouchableOpacity>
            ))}
          </View>
        ))}
        <View className='flex-row justify-between'>
          <RnTouchableOpacity
            onPress={p.showKeyboard}
            className={['h-20 w-1/3 items-center py-2', small && 'h-16']}
          >
            <RnIcon
              className={[
                'text-foreground bg-foreground/5 border-primary/10 h-16 w-16 rounded-full',
                small && 'h-12 py-2',
              ]}
              path={mdiKeyboard}
            />
          </RnTouchableOpacity>
          <View
            className={
              p.callVoiceForward
                ? 'bg-foreground/10 border-primary/10 mt-8 h-12 flex-1 flex-row items-center justify-between rounded-full'
                : undefined
            }
          >
            {p.callVoiceForward && (
              <RnTouchableOpacity
                onPress={p.callVoiceForward}
                className='bg-primary h-12 w-12 justify-center rounded-full'
              >
                <RnIcon className='text-white' path={mdiPhoneForward} />
              </RnTouchableOpacity>
            )}
            {p.callVoice && (
              <RnTouchableOpacity
                onPress={p.callVoice}
                className={[
                  'bg-primary',
                  !p.callVoiceForward
                    ? ['mt-4 h-16 w-16 rounded-full py-5', small && 'h-12 py-3']
                    : 'h-12 w-12 justify-center rounded-full',
                ]}
                loading
              >
                <RnIcon className='text-white' path={mdiPhone} />
              </RnTouchableOpacity>
            )}
          </View>
          <RnTouchableOpacity
            onPress={() => p.onPressNumber('')}
            className={['h-20 w-1/3 items-center py-2', small && 'h-16']}
          >
            <RnIcon
              className={[
                'text-foreground bg-foreground/5 border-primary/10 h-16 w-16 rounded-full',
                small && 'h-12 py-2',
              ]}
              path={mdiBackspace}
            />
          </RnTouchableOpacity>
        </View>
      </View>
      <View className='flex-1' />
    </>
  )
}
