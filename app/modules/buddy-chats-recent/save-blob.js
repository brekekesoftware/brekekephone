import { Platform } from 'react-native';

function saveBlobNative(blob, name) {
  // Must call require here instead of import on top
  //    to fix error on web build
  const RNFetchBlob = require('rn-fetch-blob').default;
  //
  const fr = new FileReader();
  fr.onload = async () => {
    const b64 = fr.result.replace(/^data:.*base64,/, '');
    let p = `${RNFetchBlob.fs.dirs.DocumentDir}/${name}`;
    try {
      // TODO check file exists and alter name
      // const ext = name.split('.').pop();
      // while (true) {
      //   if (!await RNFetchBlob.fs.exists(p)) {
      //     break;
      //   }
      //   p = `${RNFetchBlob.fs.dirs.DocumentDir}/${name}`;
      // }
      await RNFetchBlob.fs.writeFile(p, b64, 'base64');
    } catch (err) {
      console.error('saveBlobNative', err);
    }
  };
  fr.readAsDataURL(blob);
}

function saveBlobWeb(blob, name) {
  const a = document.createElement('a');
  a.style = 'display: none';
  let url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
}

function saveBlob(blob, name) {
  const fn = Platform.OS === 'web' ? saveBlobWeb : saveBlobNative;
  return fn(blob, name);
}

export default saveBlob;
