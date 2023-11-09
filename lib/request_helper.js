const axios = require('axios');

let axiosInstance, log;
function init({ baseURL, timeout, logger }) {
  axiosInstance = axios.create({ baseURL, timeout });
  log = logger;
}

function post(path, requestBody, config) {
  log.debug({ path }, 'Bitstamp POST request');
  return axiosInstance.post(path, requestBody, config);
}

function get(path) {
  log.debug({ path }, 'Bitstamp GET request');
  return axiosInstance.get(path);
}

module.exports = {
  init, get, post
};
