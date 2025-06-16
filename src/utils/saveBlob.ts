import RNFS from 'react-native-fs'

import { uc } from '#/api/uc'

export const saveBlob = (blob: Blob, name: string) => {
  const fr = new FileReader()
  fr.onload = async () => {
    const r = fr.result as string
    const b64 = r.replace(/^data:.*base64,/, '')
    const p = `${RNFS.DocumentDirectoryPath}/${name}`
    try {
      await RNFS.writeFile(p, b64, 'base64')
    } catch (err) {
      console.error('saveBlob RNFS.writeFile error:', err)
    }
  }
  fr.onerror = err => {
    console.error('saveBlob onerror error:', err)
  }
  fr.readAsDataURL(blob)
}

const readChunkFile = (p: string, pos: number, data: Blob) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onloadend = async () => {
      const r = fr.result as string
      const b64 = r.replace(/^data:.*base64,/, '')
      try {
        if (!pos) {
          await RNFS.writeFile(p, b64, 'base64')
        } else {
          await RNFS.appendFile(p, b64, 'base64')
        }
        resolve(p)
      } catch (err) {
        console.error('readChunkFile RNFS.writeFile error:', err)
        reject(err)
      }
    }
    fr.readAsDataURL(data)
  })

export const saveBlobFile = (id: string, topic_id: string, type?: string) =>
  new Promise(async (resolve, reject) => {
    try {
      type = type || 'image'
      const data: Blob = (await uc.acceptFile(id)) as Blob
      const chunkSize = 1024 * 1024 * 4 // (4 Megabyte)
      const e = type === 'image' ? 'jpeg' : 'mp4'
      const p = `${RNFS.DocumentDirectoryPath}/${id}.${e}`
      const totalChunks = Math.ceil(data.size / chunkSize)
      let pos = 1
      while (pos <= totalChunks) {
        const offset = (pos - 1) * chunkSize
        const currentChunk: Blob = data.slice(
          offset,
          pos === totalChunks ? data.size : offset + chunkSize,
        )
        await readChunkFile(p, pos - 1, currentChunk)
        pos++
      }
      resolve(p)
    } catch (err) {
      reject(err)
    }
  })
