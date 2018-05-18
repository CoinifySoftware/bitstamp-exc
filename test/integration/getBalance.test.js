const expect = require('chai').expect,
  { promisify } = require('util'),
  sinon = require('sinon'),
  responses = require('./../responses.js'),
  errorCodes = require('../../lib/error_codes'),
  request = require('request'),
  Bitstamp = require('../../index.js');

describe('#getBalance', () => {

  const bitstamp = new Bitstamp({
    key: 'apikey',
    secret: 'apisecret',
    clientId: 'clientId',
    host: 'http://localhost:3000'
  });

  beforeEach(() => {
    requestStub = sinon.stub(request, 'post');

  });

  afterEach(() => {
    requestStub.restore();
  });

  it('should get and return balance', async () => {
    requestStub.yields(null, {}, JSON.stringify(responses.getBalanceResponse));

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

  it('should returns an error upon request', (done) => {
    const errorCause = new Error('Some random test error');
    requestStub.yields(errorCause, {}, JSON.stringify(responses.getBalanceResponse));


    bitstamp.getBalance((err) => {
      expect(err.message).to.equal('There is an error in the response from the Bitstamp service...');
      expect(err.code).to.equal(errorCodes.EXCHANGE_SERVER_ERROR);
      expect(err.cause).to.equal(errorCause);

      done();
    });
  });

  it('should return error if response is empty', (done) => {
    requestStub.yields(null, {}, null);

    bitstamp.getBalance((err) => {
      expect(err.message).to.equal('There is an error in the response from the Bitstamp service...');
      expect(err.code).to.equal(errorCodes.EXCHANGE_SERVER_ERROR);

      done();
    });
  });

  it('should return error if response contains errorMessage', (done) => {
    const exchangeError = new Error('Some random test error');
    requestStub.yields(null, { error: exchangeError }, JSON.stringify(responses.getBalanceResponse));


    bitstamp.getBalance((err) => {
      expect(err.message).to.equal('The exchange service responded with an error...');
      expect(err.code).to.equal(errorCodes.EXCHANGE_SERVER_ERROR);
      expect(err.cause).to.equal(exchangeError);

      done();
    });
  });

  it('should return error if data contains errorMessage', (done) => {
    const exchangeErrorMsg = 'Some random test error';

    requestStub.yields(null, {}, JSON.stringify({ error: exchangeErrorMsg }));

    bitstamp.getBalance((err) => {
      expect(err.message).to.equal('There is an error in the body of the response from the exchange service...');
      expect(err.code).to.equal(errorCodes.EXCHANGE_SERVER_ERROR);
      expect(err.cause).to.be.an('Error');
      expect(err.cause.message).to.equal(JSON.stringify(exchangeErrorMsg));

      done();
    });

  });

});
