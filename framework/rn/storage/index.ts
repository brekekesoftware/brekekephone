export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

const noopAdapter: StorageAdapter = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
}

let adapter: StorageAdapter = noopAdapter

export const setAdapter = (storage: StorageAdapter) => {
  adapter = storage
}

export const storage: StorageAdapter = new Proxy({} as StorageAdapter, {
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  get(_, prop: keyof StorageAdapter) {
    return adapter[prop]
  },
})
