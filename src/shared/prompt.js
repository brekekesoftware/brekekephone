import Alert from './Alert';

const prompt = (title, text, onOk) => {
  Alert.alert(
    title,
    text,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Ok',
        onPress: onOk,
      },
    ],
    {
      cancelable: true,
    },
  );
};

export default prompt;
