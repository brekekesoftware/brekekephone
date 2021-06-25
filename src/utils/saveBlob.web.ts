import uc from '../api/uc'

export const saveBlob = (blob: Blob, name: string) => {
  const a = document.createElement('a')
  a.setAttribute('style', 'display: none')
  let url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = name
  a.click()
  window.URL.revokeObjectURL(url)
}
export const saveBlobImage = (id: string, name: string) => {
  return new Promise(async (resolve, reject) => {
    const fr = new FileReader()
    try {
      // console.log('saveBlob','startDownload')
      const data: Blob = (await uc.acceptFile(id)) as Blob
      const a = document.createElement('a')
      a.setAttribute('style', 'display: none')
      let url = window.URL.createObjectURL(data)
      a.href = url
      a.download = name
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      reject(error)
    }
  })
}
