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
export const saveBlobImage = (id: string, topic_id: string, type?: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data: Blob = (await uc.acceptFile(id)) as Blob
      const fr = new FileReader()
      fr.onload = async () => {
        const r = fr.result as string
        console.log({ r })

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
  type?: string,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // window.indexedDB.deleteDatabase('testDB')
      // window.location.reload()
      // const openRequest = window.indexedDB.open('testDB', 3)

      // openRequest.onupgradeneeded = e => {
      //   console.log('onupgradeneeded')
      //   const thisdb = openRequest.result
      //   if (!thisdb.objectStoreNames.contains('nam')) {
      //     thisdb.createObjectStore('nam')
      //   }
      // }

      // openRequest.onsuccess = e => {
      //   console.log('onsuccess')
      //   const db = openRequest.result
      //   // db.createObjectStore('stash')
      //   const transaction = db.transaction(['nam'], 'readwrite')
      //   const store = transaction.objectStore('nam')
      //   // const obj = {
      //   //     bl: data,
      //   //     created: id
      //   // }
      //   // console.log({obj})
      //   //add it
      //   const request = store.add(data, id)
      //   request.onerror = e => {
      //     reject(e)
      //   }
      //   request.onsuccess = e => {
      //     console.log('success')
      //     resolve(id)
      //   }
      // }

      // openRequest.onerror = e => {
      //   console.log('onerror', { e })
      //   reject(e)
      // }

      const fr = new FileReader()
      fr.onloadend = async event => {
        const r = event.target?.result as ArrayBuffer
        console.log({ r: r.byteLength })
        const cache = await caches.open(`${topic_id}`)
        const videoBlob = new Blob([r], {
          type: type === 'video' ? 'video/mp4' : 'image/jpg',
        })
        const response = new Response(videoBlob)
        console.log({ url: response?.url })
        console.log({ status: response?.status })
        console.log({ ok: response?.ok })
        console.log({ statusText: response?.statusText })
        console.log({ headers: response?.headers })
        console.log({ type: response?.type })
        const urlCacheFile = `${topic_id}/${id}`
        await cache.put(id, response)
        resolve(urlCacheFile)
      }
      fr.onerror = err => {
        console.error('saveBlob', err)
      }
      fr.readAsArrayBuffer(data)
    } catch (error) {
      reject(error)
    }
  })
}
