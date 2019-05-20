import get from 'lodash/get';

const parseCustomNoti = noti => {
  let customNoti =
    get(noti, 'custom_notification') || get(noti, '_data.custom_notification');
  if (typeof customNoti === 'string') {
    try {
      customNoti = JSON.parse(customNoti);
    } catch (err) {}
  }
  return customNoti;
};

export default parseCustomNoti;
