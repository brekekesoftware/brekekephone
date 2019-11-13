let apiProvider = null;
const getApiProvider = () => apiProvider;
const setApiProvider = _apiProvider => {
  apiProvider = _apiProvider;
};

export { setApiProvider };
export default getApiProvider;
