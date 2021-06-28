const saveBlob = (blob: Blob, name: string) => {
  const a = document.createElement('a')
  a.setAttribute('style', 'display: none')
  const url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = name
  a.click()
  window.URL.revokeObjectURL(url)
}

export default saveBlob
