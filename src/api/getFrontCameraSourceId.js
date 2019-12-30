import g from '../global';

const getFrontCameraSourceId = async () =>
  window.navigator.mediaDevices
    .enumerateDevices()
    .then(arr => arr.find(i => i.kind === `video` && i.facing === `front`))
    .then(i => i?.id)
    .catch(err => {
      g.showError({ message: `get front camera information`, err });
    });

export default getFrontCameraSourceId;
