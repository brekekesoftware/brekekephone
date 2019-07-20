let currentAuthProfile = null;

// To get/set the currentAuthProfile to use in other places
// TODO fix this using mobx stores
export const setCurrentAuthProfile = u => {
  currentAuthProfile = u;
};
export const getCurrentAuthProfile = () => {
  return currentAuthProfile;
};
