import RNFS from 'react-native-fs'

const saveBlob = (blob: Blob, name: string) => {
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

export default saveBlob
