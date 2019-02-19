import { Platform } from 'react-native';
import {
  DocumentPicker,
  DocumentPickerUtil,
} from 'react-native-document-picker';

const documentPickerOpt = {
  filetype: [DocumentPickerUtil.allFiles()],
};

function pickFileNative(cb) {
  DocumentPicker.show(documentPickerOpt, (err, res) => {
    if (err) {
      console.error('DocumentPicker error:', err);
      return;
    }
    // Make it like normal DOM input file properties
    const { uri, fileName: name, fileSize: size } = res;
    cb({ uri, name, size });
  });
}

function pickFileWeb(cb) {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = function() {
    cb(this.files[0]);
  };
  input.click();
}

function pickFile(cb) {
  const fn = Platform.OS === 'web' ? pickFileWeb : pickFileNative;
  return fn(cb);
}

export default pickFile;
