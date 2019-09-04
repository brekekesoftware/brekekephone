import Toast from 'react-native-root-toast';

let toast = null;
const show = (message, opt) => {
  if (toast) {
    Toast.hide(toast);
  }
  toast = Toast.show(message, {
    duration: Toast.durations.LONG,
    position: Toast.positions.TOP,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
    onHidden: () => {
      toast = null;
    },
    backgroundColor: 'red',
    textColor: 'white',
    ...opt,
  });
};

export default {
  error: show,
};
