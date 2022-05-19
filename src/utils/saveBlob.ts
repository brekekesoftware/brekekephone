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
// export const saveBlobFile = (id: string, topic_id: string, type?: string) => {
//   const fileType = type || 'image'
//   return new Promise(async (resolve, reject) => {
//     const fr = new FileReader()
//     try {
//       const data: Blob = (await uc.acceptFile(id)) as Blob
//       fr.onloadend = async () => {
//         const r = fr.result as string
//         const b64 = r.replace(/^data:.*base64,/, '')
//         const p = `${RNFS.DocumentDirectoryPath}/${id}.${
//           fileType === 'image' ? 'jpeg' : 'mp4'
//         }`
//         try {
//           await RNFS.writeFile(p, b64, 'base64')
//           resolve(p)
//         } catch (err) {
//           console.error(`saveBlobFile RNFS.writeFile err: ${err}`)
//           reject(err)
//         }
//       }
//       fr.onerror = err => {
//         console.error(`saveBlobFile onerror err: ${err}`)
//         reject(err)
//       }
//       fr.readAsDataURL(data)
//     } catch (err) {
//       console.error(`saveBlobFile catch err: ${err}`)
//       reject(err)
//     }
//   })
// }

const readChunkFile = (p: string, pos: number, data: Blob) => {
  // console.error('readChunkFile::', data.size)
  return new Promise(async (a, b) => {
    const fr = new FileReader()
    fr.readAsDataURL(data)
    fr.onloadend = async () => {
      const r = fr.result as string
      const b64 = r.replace(/^data:.*base64,/, '')
      // console.error('dataFile::', b64)
      try {
        if (pos === 0) {
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
  })
}
export const saveBlobFile = (id: string, topic_id: string, type?: string) => {
  const fileType = type || 'image'
  return new Promise(async (resolve, reject) => {
    // const fr = new FileReader()
    // Best to add 2 so it strips == from all chunks
    // except from the last chunk
    try {
      const data: Blob = (await uc.acceptFile(id)) as Blob
      // const defaultSize = 1024 * 8 * 10
      const chunkSize = 1024 * 8 * 10 // 4227529
      // var pos = 0
      const p = `${RNFS.DocumentDirectoryPath}/${id}.${
        fileType === 'image' ? 'jpeg' : 'mp4'
      }`
      for (let pos = 0; pos <= data.size; pos += chunkSize) {
        console.error(
          'Blob::Size::',
          data.size,
          '::pos::',
          pos,
          '::chunkSize::',
          chunkSize,
        )
        const blob: Blob = data.slice(pos, pos + chunkSize)
        await readChunkFile(p, pos, blob)
        if (chunkSize > data.size - pos) {
          console.error('Blob::Size::LastSize', data.size - pos)
          await readChunkFile(p, pos, data.slice(pos, data.size))
        }
      }
      resolve(p)
    } catch (err) {
      reject(err)
    }
  })
}
