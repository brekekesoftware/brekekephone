// Can create an API to get the public IP.
// If cannot create an API, there is no other way
// to get the public IP without relying on a third-party API
// Temporarily, the public ip address is not neccessary for the MFA fearture
export const getPublicIp = async () => {
  try {
    // const res = await fetch('https://api.ipify.org?format=json')
    // const data = await res.json()
    // return data.ip
    return ''
  } catch (err) {
    console.error('Failed to get public IP', err)
    return ''
  }
}
