import { get as getStrictTyping } from '@rntwsc/shared/lodash'

// to get as any
export const get = getStrictTyping as (...args: any[]) => any
