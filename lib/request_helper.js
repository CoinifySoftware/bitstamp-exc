const axios = require('axios');

let axiosInstance;
function init({ baseURL, timeout }) {
  axiosInstance = axios.create({ baseURL, timeout });
}

function post(path, requestBody, config) {
  return axiosInstance.post(path, requestBody, config);
}

function get(path) {
  return axiosInstance.get(path);
}

module.exports = {
  init, get, post
};
