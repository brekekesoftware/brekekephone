import RNFS from 'react-native-fs'

import uc from '../api/uc'

export const saveBlob = (blob: Blob, name: string) => {
  const fr = new FileReader()
  fr.onload = async () => {
    const r = fr.result as string
    const b64 = r.replace(/^data:.*base64,/, '')
    const p = `${RNFS.DocumentDirectoryPath}/${name}`
    try {
      await RNFS.writeFile(p, b64, 'base64')
    } catch (err) {
      console.error('saveBlob', err)
    }
  }
  fr.onerror = err => {
    console.error('saveBlob', err)
  }
  fr.readAsDataURL(blob)
}
export const saveBlobImage = (id: string, topic_id: string) => {
  return new Promise(async (resolve, reject) => {
    const fr = new FileReader()
    try {
      const data: Blob = (await uc.acceptFile(id)) as Blob
      fr.onload = async () => {
        const r = fr.result as string
        // const b64 = r.replace(/^data:.*base64,/, '')
        const p = `${RNFS.DocumentDirectoryPath}/${id}.jpg`
        try {
          resolve(r.replace('application/octet-stream', 'image/jpeg'))
          await RNFS.writeFile(p, r, 'base64')
          resolve(p)
          // android all way received type: application/octet-stream
        } catch (err) {
          console.error('saveBlob', err)
          reject(err)
        }
      }
      fr.onerror = err => {
        console.error('saveBlob', err)
        reject(err)
      }
      fr.readAsDataURL(data)
    } catch (error) {
      reject(error)
    }
  })
}

// export default saveBlob
