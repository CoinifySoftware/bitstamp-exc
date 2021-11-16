const Bitstamp = require('../index');

function initModule() {
  return new Bitstamp({
    key: 'apikey',
    secret: 'apisecret',
    clientId: 'clientId',
    host: 'http://localhost:3000'
  });
}

module.exports = {
  initModule
};
