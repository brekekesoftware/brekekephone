import { Platform } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-full-image-picker';
import ActionSheet from 'react-native-general-actionsheet';
import createId from 'shortid';

ActionSheet.useActionSheetIOS = true;
ImagePicker.AlbumView.autoConvertPath = true;
ImagePicker.AlbumListView.autoConvertPath = true;

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
  //
  //
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
    console.error(err);
  }
  if (!file) {
    return;
  }
  //
  const { uri } = file;
  if (!uri) {
    return;
  }
  //
  //
  const getName = p =>
    p &&
    p
      .split(/[\\/]/g)
      .pop()
      .replace(/\?.+$/, '');
  let name = file.fileName || file.filename || file.name || getName(uri);
  let size = file.fileSize || file.filesize || file.size || 0;
  //
  // Use RNFS.stat to get size if there's no size
  if (!size) {
    try {
      const stat = await RNFS.stat(uri);
      name = getName(stat.originalFilepath || stat.path) || name;
      size = stat.size;
    } catch (err) {
      // silent
    }
  }
  //
  // Fix name has no extension
  let ext = name
    .split('.')
    .pop()
    .replace(/\?.+$/, '');
  // Fix ios no extension
  // TODO not so accuracy, just work around
  if (Platform.OS === 'ios' && ext === name) {
    switch (file.type) {
      case 'image':
        ext = 'jpg';
        break;
      case 'video':
        ext = 'mp4';
        break;
      case 'audio':
        ext = 'mp3';
        break;
      default:
        break;
    }
    name = createId();
  }
  // Add extension to the file name
  if (!name.toLowerCase().endsWith(ext.toLowerCase())) {
    name = name + '.' + ext;
  }
  //
  //
  cb({ uri, name, size });
};

export default pickFile;
