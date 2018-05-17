const expect = require('chai').expect,
  {promisify} = require('util'),
  sinon = require('sinon'),
  responses = require('./../responses.js'),
  request = require('request'),
  Bitstamp = require('../../index.js');

describe('#listTrades', () => {

  const bitstamp = new Bitstamp({
    key: 'apikey',
    secret: 'apisecret',
    clientId: 'clientId',
    host: 'http://localhost:3000'
  });

  beforeEach(() => {
    requestStub = sinon.stub(request, 'post')
      .yields(null, {}, JSON.stringify(responses.getBalanceResponse));
  });

  afterEach(() => {
    requestStub.restore();
  });

  it('should get and return balance', async () => {
    const res = await promisify(bitstamp.getBalance.bind(bitstamp))();
    expect(res).to.deep.equal({
      available: {
        ETH: 100000000000, USD: 4900, BTC: 10000069
      },
      total: {
        ETH: 200000000000, USD: 5100, BTC: 12345678
      }
    });

    expect(requestStub.calledOnce).to.equal(true);
  });

});
