import {
  appendFile,
  DocumentDirectoryPath,
  writeFile,
} from '@dr.pogodin/react-native-fs'

import { ctx } from '#/stores/ctx'

export const saveBlob = (blob: Blob, name: string) => {
  const fr = new FileReader()
  fr.onload = async () => {
    const r = fr.result as string
    const b64 = r.replace(/^data:.*base64,/, '')
    const p = `${DocumentDirectoryPath}/${name}`
    try {
      await writeFile(p, b64, 'base64')
    } catch (err) {
      console.error('saveBlob writeFile error:', err)
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
          await writeFile(p, b64, 'base64')
        } else {
          await appendFile(p, b64, 'base64')
        }
        resolve(p)
      } catch (err) {
        console.error('readChunkFile writeFile error:', err)
        reject(err)
      }
    }
    fr.readAsDataURL(data)
  })

export const saveBlobFile = (id: string, topic_id: string, type?: string) =>
  new Promise(async (resolve, reject) => {
    try {
      type = type || 'image'
      const data: Blob = (await ctx.uc.acceptFile(id)) as Blob
      const chunkSize = 1024 * 1024 * 4 // (4 Megabyte)
      const e = type === 'image' ? 'jpeg' : 'mp4'
      const p = `${DocumentDirectoryPath}/${id}.${e}`
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
