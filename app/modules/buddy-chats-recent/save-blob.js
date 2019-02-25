import { Platform } from 'react-native';

function saveBlobNative(blob, name) {
  const RNFS = require('react-native-fs');
  const fr = new FileReader();
  fr.onload = async () => {
    const b64 = fr.result.replace(/^data:.*base64,/, '');
    let p = `${RNFS.DocumentDirectoryPath}/${name}`;
    try {
      await RNFS.writeFile(p, b64, 'base64');
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
