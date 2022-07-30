import RNFS from 'react-native-fs'

import { uc } from '../api/uc'

export const saveBlob = (blob: Blob, name: string) => {
  const fr = new FileReader()
  fr.onload = async () => {
    const r = fr.result as string
    const b64 = r.replace(/^data:.*base64,/, '')
    const p = `${RNFS.DocumentDirectoryPath}/${name}`
    try {
      await RNFS.writeFile(p, b64, 'base64')
    } catch (err) {
      console.error(`saveBlob RNFS.writeFile err: ${err}`)
    }
  }
  fr.onerror = err => {
    console.error(`saveBlob onerror err: ${err}`)
  }
  fr.readAsDataURL(blob)
}

const readChunkFile = (p: string, pos: number, data: Blob) => {
  return new Promise(async (a, b) => {
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
        a(p)
      } catch (err) {
        console.error(`saveBlobFile RNFS.writeFile err: ${err}`)
        b(err)
      }
    }
    fr.readAsDataURL(data)
  })
}
export const saveBlobFile = (id: string, topic_id: string, type?: string) => {
  const fileType = type || 'image'
  return new Promise(async (resolve, reject) => {
    try {
      const data: Blob = (await uc.acceptFile(id)) as Blob
      const chunkSize = 1024 * 1024 * 4 // (4 Megabyte)

      const p = `${RNFS.DocumentDirectoryPath}/${id}.${
        fileType === 'image' ? 'jpeg' : 'mp4'
      }`
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
}
