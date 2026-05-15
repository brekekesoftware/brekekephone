'use client'

import AsyncStorage from '@react-native-async-storage/async-storage'

import { setAdapter } from '@/rn/storage'

setAdapter({
  getItem: key => AsyncStorage.getItem(key) || null,
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: key => AsyncStorage.removeItem(key),
})

export * from '@react-native-async-storage/async-storage'
