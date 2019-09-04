import RnToast from 'react-native-root-toast';

let rnToastInstance = null;

const Toast = {
  show: (message, opt) => {
    if (rnToastInstance) {
      RnToast.hide(rnToastInstance);
    }
    rnToastInstance = RnToast.show(message, {
      duration: RnToast.durations.LONG,
      position: RnToast.positions.TOP,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      onHidden: () => {
        rnToastInstance = null;
      },
      backgroundColor: 'black',
      textColor: 'white',
      ...opt,
    });
  },
  error: (message, opt) => {
    Toast.show(message, {
      ...opt,
      backgroundColor: 'red',
    });
  },
};

export default Toast;
