const uint8ArrayToUrlBase64 = k =>
  window
    .btoa(String.fromCharCode.apply(null, new Uint8Array(k)))
    .replace(/[+/]/g, '-');

export default uint8ArrayToUrlBase64;
