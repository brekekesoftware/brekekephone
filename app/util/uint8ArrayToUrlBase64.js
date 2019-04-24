const uint8ArrayToUrlBase64 = key =>
  window
    .btoa(String.fromCharCode.apply(null, new Uint8Array(key)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

export default uint8ArrayToUrlBase64;
