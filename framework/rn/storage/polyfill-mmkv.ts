'use client'

import { createMMKV } from 'react-native-mmkv'

import { setAdapter } from '@/rn/storage'

const mmkv = createMMKV()

setAdapter({
  getItem: async key => mmkv.getString(key) || null,
  setItem: async (key, value) => mmkv.set(key, value),
  removeItem: async key => {
    mmkv.remove(key)
  },
})

export * from 'react-native-mmkv'
