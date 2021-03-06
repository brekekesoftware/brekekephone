import uc from '../api/uc'

export const saveBlob = (blob: Blob, name: string) => {
  const a = document.createElement('a')
  a.setAttribute('style', 'display: none')
  const url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = name
  a.click()
  window.URL.revokeObjectURL(url)
}
export const saveBlobImage = (id: string, topic_id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data: Blob = (await uc.acceptFile(id)) as Blob
      const fr = new FileReader()
      fr.onload = async () => {
        const r = fr.result as string
        const cache = await caches.open(topic_id)
        const imageResponse = new Response(r)
        const urlCacheFile = `${topic_id}/${id}`
        cache.put(id, imageResponse)
        resolve(urlCacheFile)
      }
      fr.onerror = err => {
        console.error('saveBlob', err)
      }
      fr.readAsDataURL(data)
    } catch (error) {
      reject(error)
    }
  })
}
export const saveBlobImageToCache = (
  data: Blob,
  id: string,
  topic_id: string,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fr = new FileReader()
      fr.onload = async () => {
        const r = fr.result as string
        const cache = await caches.open(`${topic_id}`)
        const imageResponse = new Response(r)
        const urlCacheFile = `${topic_id}/${id}`
        cache.put(id, imageResponse)
        resolve(urlCacheFile)
      }
      fr.onerror = err => {
        console.error('saveBlob', err)
      }
      fr.readAsDataURL(data)
    } catch (error) {
      reject(error)
    }
  })
}
