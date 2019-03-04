import DocumentPicker from 'react-native-document-picker';
import * as ImagePicker from 'react-native-full-image-picker';
import ActionSheet from 'react-native-general-actionsheet';
import RNFS from 'react-native-fs';

ActionSheet.useActionSheetIOS = true;

const actionSheetOptions = {
  options: [
    'Select from photo library',
    'Take a new photo',
    'Take a new video',
    'More...',
    'Cancel',
  ],
  destructiveButtonIndex: 4,
  cancelButtonIndex: 4,
};

const actionSheetHandlers = [
  () =>
    new Promise(resolve => {
      ImagePicker.getAlbum({
        callback: arr => resolve(arr[0]),
        maxSize: 1,
      });
    }),
  () =>
    new Promise(resolve => {
      ImagePicker.getCamera({
        callback: arr => resolve(arr[0]),
        maxSize: 1,
      });
    }),
  () =>
    new Promise(resolve => {
      ImagePicker.getVideo({
        callback: arr => resolve(arr[0]),
      });
    }),
  () =>
    DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    }),
];

const pickFile = async cb => {
  const i = await new Promise(resolve => {
    ActionSheet.showActionSheetWithOptions(actionSheetOptions, resolve);
  });
  const fn = actionSheetHandlers[i];
  if (!fn) {
    return;
  }
  //
  let file = null;
  try {
    file = await fn();
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      return;
    }
    throw err;
  }
  if (!file) {
    return;
  }
  //
  const { uri } = file;
  if (!uri) {
    return;
  }
  let name =
    file.fileName ||
    file.filename ||
    file.name ||
    uri
      .split(/[\\/]/g)
      .pop()
      .replace(/\?.+$/, '');
  let size = file.fileSize || file.filesize || file.size || 0;
  // Fix some issues using RNFS.stat
  let stat = null;
  // Fix name has no extension
  let ext = uri
    .split('.')
    .pop()
    .replace(/\?.+$/, '');
  if (/\W/.test(ext)) {
    // Invalid extension
    try {
      stat = await RNFS.stat(uri);
      ext = (stat.originalFilepath || stat.path).split('.').pop();
    } catch (err) {
      // silent
    }
  }
  if (!/\W/.test(ext)) {
    ext = '.' + ext;
    if (!name.toLowerCase().endsWith(ext.toLowerCase())) {
      name = name + ext;
    }
  }
  // Fix size stat from uri
  if (!size) {
    if (!stat) {
      try {
        stat = await RNFS.stat(uri);
      } catch (err) {
        // silent
      }
    }
    if (stat) {
      size = stat.size;
    }
  }
  //
  cb({ uri, name, size });
};

export default pickFile;
