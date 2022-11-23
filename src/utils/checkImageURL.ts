import Url from 'url-parse'

export const checkImageUrl = (url: string) => {
  // exception get image from UC: https://apps.brekeke.com:8443/uc/image?ACTION=DOWNLOAD&tenant=nam&user=1003&dlk=ltt3&SIZE=40
  const urlParams = new Url(url.toLowerCase())
  console.error({ pathname: urlParams.pathname })
  return (
    /\.(jpeg|jpg|gif|png)$/.test(urlParams.pathname) ||
    url.toLowerCase().includes('/uc/image?ACTION=DOWNLOAD&tenant'.toLowerCase())
  )
}
