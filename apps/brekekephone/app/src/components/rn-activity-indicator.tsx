import type { FC } from 'react'
import type { ActivityIndicatorProps } from 'react-native'
import { ActivityIndicator as ActivityIndicatorWocn } from 'react-native'

import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'

export const RnActivityIndicator = createClassNameComponent({
  ActivityIndicatorWocn,
}) as FC<ActivityIndicatorProps & { className?: ClassName }>
