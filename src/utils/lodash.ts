import { get as getStrictTyping } from 'lodash'

// to get as any
export const get = getStrictTyping as (...args: any[]) => any
