export default function uint8ArrayToUrlBase64(key) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(key)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}
