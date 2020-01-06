import g from '../global';
import authStore from '../global/authStore';
import pbx from './pbx';

const updatePhoneIndex = () =>
  updatePhoneIndexWithoutCatch().catch(err => {
    g.showError({ message: `Failed to update phone index`, err });
    g.goToPageProfileSignIn();
    return null;
  });

const updatePhoneIndexWithoutCatch = async () => {
  //
  const phoneIndex = parseInt(authStore.currentProfile.pbxPhoneIndex) || 4;
  const extProps = authStore.userExtensionProperties;
  const phone = extProps.phones[phoneIndex - 1];
  const phoneTypeCorrect = phone.type === `Web Phone`;
  const { pbxTenant, pbxUsername } = authStore.currentProfile;
  const expectedPhoneId = `${pbxTenant}_${pbxUsername}_phone${phoneIndex}_webphone`;
  const phoneIdCorrect = phone.id === expectedPhoneId;
  //
  const setExtensionProperties = async () => {
    await pbx.pal(`setExtensionProperties`, {
      tenant: pbxTenant,
      extension: pbxUsername,
      properties: {
        // See ./pbx getExtensionProperties for the detail of parameters
        pnumber: extProps.phones.map(p => p.id).join(`,`),
        [`p${phoneIndex}_ptype`]: phone.type,
      },
    });
    authStore.userExtensionProperties = extProps;
  };
  //
  if (phoneTypeCorrect && phoneIdCorrect) {
    // Do nothing
  } else if (phoneTypeCorrect && !phoneIdCorrect) {
    phone.id = expectedPhoneId;
    await setExtensionProperties();
  } else if (!phoneTypeCorrect && !phoneIdCorrect) {
    phone.id = expectedPhoneId;
    phone.type = `Web Phone`;
    await setExtensionProperties();
  } else {
    return new Promise(resolve => {
      g.showPrompt({
        title: `Warning`,
        message: `This phone index is already in use. Do you want to continue?`,
        onConfirm: () => {
          phone.type = `Web Phone`;
          setExtensionProperties()
            .then(() => {
              resolve(phone);
            })
            .catch(err => {
              g.showError({
                message: `Failed to set extension properties`,
                err,
              });
              resolve(null);
            });
        },
        onDismiss: () => {
          g.goToPageProfileSignIn();
          resolve(null);
        },
      });
    });
  }
  return phone;
};

export default updatePhoneIndex;
