const Bitstamp = require('../index');

function initModule() {
  return new Bitstamp({
    key: 'apikey',
    secret: 'apisecret',
    clientId: 'clientId',
    host: 'https://www.bitstamp.net'
  });
}

module.exports = {
  initModule
};
