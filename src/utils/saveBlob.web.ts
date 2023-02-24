import { uc } from '../api/uc'

export const saveBlob = (blob: Blob, name: string) => {
  const a = document.createElement('a')
  a.setAttribute('style', 'display: none')
  const url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = name
  a.click()
  window.URL.revokeObjectURL(url)
}

export const saveBlobFile = (
  id: string,
  topic_id: string,
  type?: string,
  data?: Blob,
) =>
  new Promise(async (resolve, reject) => {
    try {
      const dataBlob = data ? data : ((await uc.acceptFile(id)) as Blob)
      const fr = new FileReader()
      fr.onloadend = async event => {
        const r = event.target?.result as ArrayBuffer
        const cache = await caches.open(`${topic_id}`)
        const videoBlob = new Blob([r], {
          type: type === 'video' ? 'video/mp4' : 'image/jpg',
        })
        const response = new Response(videoBlob)
        const urlCacheFile = `${topic_id}/${id}`
        await cache.put(id, response)
        resolve(urlCacheFile)
      }
      fr.onerror = err => {
        console.error('saveBlobFile.web onerror error:', err)
      }
      fr.readAsArrayBuffer(dataBlob)
    } catch (err) {
      console.error('saveBlobFile.web catch error:', err)
      reject(err)
    }
  })
